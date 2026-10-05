import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Euler,
  Fog,
  Group,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Scene,
  Sphere,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { stations, type StationId } from "@/lib/stations";
import {
  buildFormations,
  CARD_HEIGHT,
  CARD_WIDTH,
  type Formation,
  type FormationGroup,
} from "./formations";

/** The words printed on one card. */
export type CardFace = {
  /** A short counter, such as "01". */
  index: string;
  title: string;
  kind: string;
  /** Where it lives: a host name, or a note that it has no public address. */
  place: string;
  /** A closing note, such as the number of tools used. */
  note: string;
};

export type SculptureHit = {
  key: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  /** A hit that can be clicked but should not take the focus. */
  passive?: boolean;
};

export type SculptureFrame = {
  /** Where the sculpture's centre sits, in viewport pixels. */
  centerX: number;
  centerY: number;
  /** The box it has to fit inside, in viewport pixels. */
  fitWidth: number;
  fitHeight: number;
};

type Options = {
  count: number;
  maxPixelRatio: number;
  reducedMotion: boolean;
  interactive: boolean;
  /**
   * Keeps focus from recolouring the blocks. Used where the piece sits behind
   * text, so a lit group does not fight the words in front of it.
   */
  quietFocus?: boolean;
  /** What to print per group key, for formations that carry cards. */
  cardFaces?: Record<string, CardFace>;
  onHover: (hit: SculptureHit | null) => void;
  onSelect: (key: string) => void;
};

const FOV = 30;
const FIT_RADIUS = 3.9;
const TRAVEL = 1.25;
const STAGGER = 0.55;
const LABEL_GUTTER = 16;
const CARD_PIXELS = 1024;
const Y_AXIS = new Vector3(0, 1, 0);

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const cssValue = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  fallback;

const cssColor = (name: string, fallback: string) =>
  new Color(cssValue(name, fallback));

/** Breaks a title into the fewest lines that fit, never splitting a word. */
const wrap = (
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
) => {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && context.measureText(`${last} ${word}`).width <= width)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
};

/**
 * One instanced mesh of boxes that is rearranged per station. Nothing is added
 * or removed between stations: every block travels to its slot in the next
 * formation, which is the whole idea of the piece.
 */
export class Sculpture {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 120);
  private readonly rig = new Group();
  private readonly mesh: InstancedMesh;
  private readonly geometry = new BoxGeometry(1, 1, 1);
  private readonly material = new MeshLambertMaterial({ color: 0xffffff });
  private readonly sky = new HemisphereLight(0xffffff, 0xffffff, 1);
  private readonly sun = new DirectionalLight(0xffffff, 1);
  private readonly fog = new Fog(0xffffff, 1, 2);
  private readonly raycaster = new Raycaster();
  private readonly resizeObserver: ResizeObserver;

  private readonly count: number;
  private readonly formations: Record<StationId, Formation>;
  private readonly pulseSignal: () => void;
  private readonly guides = new Map<StationId, LineSegments>();
  private readonly labels: {
    station: StationId;
    group: FormationGroup;
    el: HTMLElement;
    shown: boolean;
    width: number;
  }[] = [];
  private readonly cards: {
    station: StationId;
    index: number;
    mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;
    face: CardFace;
    canvas: HTMLCanvasElement;
    texture: CanvasTexture;
  }[] = [];
  private readonly cardGeometry = new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
  private cardReveal = 0;

  // Per-block state. `from` is where the current trip started, `cur` is now.
  private readonly fromPos: Float32Array;
  private readonly fromScl: Float32Array;
  private readonly fromQuat: Float32Array;
  private readonly curPos: Float32Array;
  private readonly curScl: Float32Array;
  private readonly curQuat: Float32Array;
  private readonly seed: Float32Array;
  private readonly arc: Float32Array;
  private readonly tone: Float32Array;
  private readonly marked: Uint8Array;
  private readonly glow: Float32Array;
  private readonly baseColor: Float32Array;

  private station: StationId = "home";
  private focus: string | null = null;
  private focusGroup = -1;
  private travel = 0;
  private time = 0;
  private last = 0;
  private raf = 0;
  private paused = false;
  private disposed = false;
  private dirty = true;

  private readonly tiltFrom = new Quaternion();
  private readonly tilt = new Quaternion();
  private readonly yawQuat = new Quaternion();
  private readonly leanQuat = new Quaternion();
  private readonly anchorQuat = new Quaternion();
  private readonly lean = new Euler();
  private spinYaw = 0;
  private dragYaw = 0;
  private dragPitch = 0;
  private dragVelocity = 0;
  private dragging = false;
  private dragMoved = 0;
  private readonly dragLast = new Vector2();
  private readonly pointer = new Vector2();
  private readonly pointerSmooth = new Vector2();
  private readonly hoverAt = new Vector2();
  private readonly ndc = new Vector2();
  private hoverPending = false;
  private hoverKey: string | null = null;

  private width = 1;
  private height = 1;
  private frame: SculptureFrame = {
    centerX: 0,
    centerY: 0,
    fitWidth: 1,
    fitHeight: 1,
  };
  private readonly shift = new Vector2();
  private distance = 24;
  private framed = false;

  private readonly accent = new Color();
  private readonly dim = new Color();
  private readonly lo = new Color();
  private readonly hi = new Color();
  private readonly scratch = new Vector3();

  constructor(
    private readonly host: HTMLElement,
    private readonly labelHost: HTMLElement,
    private readonly options: Options,
  ) {
    this.count = options.count;
    const n = this.count;

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, options.maxPixelRatio),
    );
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = "scene-canvas";
    host.appendChild(this.renderer.domElement);

    const { pulse, ...formations } = buildFormations(n);
    this.formations = formations;
    this.pulseSignal = pulse;

    this.fromPos = new Float32Array(n * 3);
    this.fromScl = new Float32Array(n * 3);
    this.fromQuat = new Float32Array(n * 4);
    this.curPos = new Float32Array(n * 3);
    this.curScl = new Float32Array(n * 3);
    this.curQuat = new Float32Array(n * 4);
    this.seed = new Float32Array(n);
    this.arc = new Float32Array(n * 3);
    this.tone = new Float32Array(n);
    this.marked = new Uint8Array(n);
    this.glow = new Float32Array(n);
    this.baseColor = new Float32Array(n * 3);

    // The opening state: blocks scattered wide at zero size, so the first
    // trip reads as the piece assembling itself.
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const y = Math.random() * 2 - 1;
      const flat = Math.sqrt(1 - y * y);
      const r = 5 + Math.random() * 5;
      this.fromPos[i * 3] = Math.cos(a) * flat * r;
      this.fromPos[i * 3 + 1] = y * r;
      this.fromPos[i * 3 + 2] = Math.sin(a) * flat * r;
      this.fromQuat[i * 4 + 3] = 1;
      this.seed[i] = Math.random();
      this.tone[i] = Math.random();
      this.marked[i] = Math.random() < 0.045 ? 1 : 0;
      const b = Math.random() * Math.PI * 2;
      const lift = 0.35 + Math.random() * 0.9;
      this.arc[i * 3] = Math.cos(b) * lift;
      this.arc[i * 3 + 1] = (Math.random() - 0.3) * lift;
      this.arc[i * 3 + 2] = Math.sin(b) * lift;
    }
    this.curPos.set(this.fromPos);
    this.curQuat.set(this.fromQuat);

    this.mesh = new InstancedMesh(this.geometry, this.material, n);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.instanceColor = new InstancedBufferAttribute(
      new Float32Array(n * 3),
      3,
    );
    this.mesh.instanceColor.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    // Blocks move every frame, so give the raycaster a fixed generous bound.
    this.mesh.boundingSphere = new Sphere(new Vector3(), 14);
    this.rig.add(this.mesh);

    for (const { id } of stations) {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new BufferAttribute(this.formations[id].guides, 3),
      );
      const lines = new LineSegments(
        geometry,
        new LineBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      lines.visible = false;
      lines.frustumCulled = false;
      this.guides.set(id, lines);
      this.rig.add(lines);

      this.formations[id].cards?.forEach((card, index) => {
        const face = options.cardFaces?.[card.key];
        if (!face) return;
        const canvas = document.createElement("canvas");
        canvas.width = CARD_PIXELS;
        canvas.height = Math.round((CARD_PIXELS * CARD_HEIGHT) / CARD_WIDTH);
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(
          8,
          this.renderer.capabilities.getMaxAnisotropy(),
        );
        const mesh = new Mesh(
          this.cardGeometry,
          new MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            toneMapped: false,
          }),
        );
        mesh.visible = false;
        this.cards.push({ station: id, index, mesh, face, canvas, texture });
        this.rig.add(mesh);
      });

      for (const group of this.formations[id].groups) {
        const el = document.createElement("span");
        el.className = "scene-label";
        const dot = document.createElement("i");
        const name = document.createElement("b");
        name.textContent = group.label;
        el.append(dot, name);
        if (group.sub) {
          const sub = document.createElement("em");
          sub.textContent = group.sub;
          el.append(sub);
        }
        labelHost.appendChild(el);
        this.labels.push({ station: id, group, el, shown: false, width: 0 });
      }
    }

    this.sun.position.set(-5, 8, 6);
    this.scene.add(this.rig, this.sky, this.sun);
    this.scene.fog = this.fog;

    this.tilt.copy(this.formations.home.tilt);
    this.tiltFrom.copy(this.tilt);
    if (options.reducedMotion) this.travel = TRAVEL + STAGGER;

    this.setTheme();
    // The faces are printed in web fonts, which may still be on their way.
    document.fonts?.ready.then(() => {
      if (!this.disposed) this.paintCards();
    });

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(host);
    this.resize();

    window.addEventListener("pointermove", this.onWindowPointer, {
      passive: true,
    });
    document.addEventListener("visibilitychange", this.onVisibility);
    if (options.interactive) {
      host.addEventListener("pointerdown", this.onPointerDown);
      host.addEventListener("pointermove", this.onPointerMove);
      host.addEventListener("pointerup", this.onPointerUp);
      host.addEventListener("pointercancel", this.onPointerCancel);
      host.addEventListener("pointerleave", this.onPointerLeave);
    }

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  setStation(id: StationId) {
    if (id === this.station) return;
    this.fromPos.set(this.curPos);
    this.fromScl.set(this.curScl);
    this.fromQuat.set(this.curQuat);
    this.tiltFrom.copy(this.tilt);
    this.station = id;
    this.travel = this.options.reducedMotion ? TRAVEL + STAGGER : 0;
    this.focusGroup = this.groupIndex(this.focus);
    this.clearHover();
    this.dirty = true;
  }

  setFocus(key: string | null) {
    if (key === this.focus) return;
    this.focus = key;
    this.focusGroup = this.groupIndex(key);
    this.dirty = true;
  }

  setFrame(frame: SculptureFrame) {
    this.frame = frame;
    this.dirty = true;
  }

  /** Re-reads the palette from CSS so the scene follows the page theme. */
  setTheme() {
    const paper = cssColor("--paper", "#e9e4d8");
    this.lo.copy(cssColor("--block-lo", "#1e1d17"));
    this.hi.copy(cssColor("--block-hi", "#8f8973"));
    this.accent.copy(cssColor("--block-accent", "#f2440d"));
    this.dim.copy(cssColor("--block-dim", "#d3cdbd"));
    this.fog.color.copy(paper);
    this.sky.color.set(0xffffff);
    this.sky.groundColor.copy(paper);
    this.sky.intensity =
      Number(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--block-ambient",
        ),
      ) || 1.5;
    this.sun.intensity = 2.1;

    const c = new Color();
    for (let i = 0; i < this.count; i++) {
      if (this.marked[i]) c.copy(this.accent);
      else c.copy(this.lo).lerp(this.hi, this.tone[i]);
      this.baseColor[i * 3] = c.r;
      this.baseColor[i * 3 + 1] = c.g;
      this.baseColor[i * 3 + 2] = c.b;
    }
    this.paintCards();
    const line = cssColor("--ink", "#16150f");
    for (const lines of this.guides.values())
      (lines.material as LineBasicMaterial).color.copy(line);
    this.dirty = true;
  }

  /** Sends one tall crest through the Signal formation. */
  pulse() {
    this.pulseSignal();
    this.dirty = true;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    window.removeEventListener("pointermove", this.onWindowPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.host.removeEventListener("pointerdown", this.onPointerDown);
    this.host.removeEventListener("pointermove", this.onPointerMove);
    this.host.removeEventListener("pointerup", this.onPointerUp);
    this.host.removeEventListener("pointercancel", this.onPointerCancel);
    this.host.removeEventListener("pointerleave", this.onPointerLeave);
    for (const lines of this.guides.values()) {
      lines.geometry.dispose();
      (lines.material as LineBasicMaterial).dispose();
    }
    for (const label of this.labels) label.el.remove();
    for (const card of this.cards) {
      card.texture.dispose();
      card.mesh.material.dispose();
    }
    this.cardGeometry.dispose();
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private groupIndex(key: string | null) {
    if (!key) return -1;
    return this.formations[this.station].groups.findIndex((g) => g.key === key);
  }

  private readonly resize = () => {
    this.width = Math.max(1, this.host.clientWidth);
    this.height = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(this.width, this.height, false);
    this.dirty = true;
  };

  private readonly onVisibility = () => {
    this.paused = document.hidden;
    if (!this.paused) {
      this.last = performance.now();
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(this.loop);
    }
  };

  private readonly onWindowPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1,
    );
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    this.dragging = true;
    this.dragMoved = 0;
    this.dragVelocity = 0;
    this.dragLast.set(event.clientX, event.clientY);
    this.host.dataset.dragging = "true";
    if (event.pointerType === "touch") {
      // A finger has no hover, so find what is under it now: a tap then
      // selects it. The browser keeps vertical swipes for scrolling.
      this.hoverAt.set(event.clientX, event.clientY);
      this.pick();
    } else this.host.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (this.dragging) {
      // Tracked by hand: `movementX` is not reliable for touch everywhere.
      const dx = event.clientX - this.dragLast.x;
      const dy = event.clientY - this.dragLast.y;
      this.dragLast.set(event.clientX, event.clientY);
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      this.dragVelocity = dx * 0.006;
      this.dragYaw += this.dragVelocity;
      this.dragPitch = Math.max(
        -0.6,
        Math.min(0.6, this.dragPitch + dy * 0.004),
      );
      this.dirty = true;
      return;
    }
    if (event.pointerType === "touch") return;
    this.hoverAt.set(event.clientX, event.clientY);
    this.hoverPending = true;
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    if (!this.dragging) return;
    const key = this.dragMoved < 5 ? this.hoverKey : null;
    this.endDrag(event);
    if (key) this.options.onSelect(key);
  };

  /** The browser took the gesture over (a scroll), so nothing was tapped. */
  private readonly onPointerCancel = (event: PointerEvent) => {
    if (this.dragging) this.endDrag(event);
  };

  private endDrag(event: PointerEvent) {
    this.dragging = false;
    delete this.host.dataset.dragging;
    if (this.host.hasPointerCapture(event.pointerId))
      this.host.releasePointerCapture(event.pointerId);
    if (event.pointerType === "touch") this.clearHover();
  }

  private readonly onPointerLeave = () => {
    this.hoverPending = false;
    this.clearHover();
  };

  private clearHover() {
    if (this.hoverKey === null) return;
    this.hoverKey = null;
    this.host.dataset.hit = "false";
    this.options.onHover(null);
  }

  private pick() {
    this.hoverPending = false;
    const rect = this.host.getBoundingClientRect();
    this.ndc.set(
      ((this.hoverAt.x - rect.left) / rect.width) * 2 - 1,
      -((this.hoverAt.y - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const formation = this.formations[this.station];

    // A card stands for its whole group, so its face is as good as its frame.
    const targets = [
      this.mesh,
      ...this.cards.filter((c) => c.mesh.visible).map((c) => c.mesh),
    ];
    let index = -1;
    for (const hit of this.raycaster.intersectObjects(targets, false)) {
      const card = this.cards.find((c) => c.mesh === hit.object);
      index = card
        ? card.index
        : hit.instanceId !== undefined
          ? formation.group[hit.instanceId]
          : -1;
      if (index >= 0) break;
    }
    if (index < 0) return this.clearHover();

    // On a reel only the front card takes the focus. Hovering one behind it
    // would turn the wheel under the pointer and chase its own tail, so those
    // are click targets only.
    let passive = false;
    if (formation.cards) {
      const front = formation.cards.reduce(
        (best, card, i, all) => (card.presence > all[best].presence ? i : best),
        0,
      );
      passive = index !== front;
    }

    const group = formation.groups[index];
    this.hoverKey = group.key;
    this.host.dataset.hit = "true";
    this.options.onHover({
      key: group.key,
      label: group.label,
      sub: group.sub,
      x: this.hoverAt.x,
      y: this.hoverAt.y,
      passive,
    });
  }

  /** Prints each card's face in the page's own type and colours. */
  private paintCards() {
    if (this.cards.length === 0) return;
    const sans = cssValue("--font-sans", "system-ui, sans-serif");
    const mono = cssValue("--font-mono", "ui-monospace, monospace");
    const paper = cssValue("--card", "#f2eee4");
    const ink = cssValue("--ink", "#16150f");
    const muted = cssValue("--muted", "#55524a");
    const rule = cssValue("--line-strong", "#a9a28d");
    const accent = cssValue("--accent", "#f2440d");

    for (const { face, canvas, texture } of this.cards) {
      const context = canvas.getContext("2d");
      if (!context) continue;
      const { width, height } = canvas;
      const pad = width * 0.07;
      const inner = width - pad * 2;
      const small = width * 0.031;

      context.fillStyle = paper;
      context.fillRect(0, 0, width, height);

      context.font = `500 ${small}px ${mono}`;
      context.letterSpacing = `${small * 0.08}px`;
      context.textBaseline = "alphabetic";
      const top = pad + small;
      const bottom = height - pad;
      context.textAlign = "left";
      context.fillStyle = accent;
      context.fillText(face.index, pad, top);
      context.fillStyle = muted;
      context.fillText(face.place.toUpperCase(), pad, bottom);
      context.textAlign = "right";
      context.fillText(face.kind.toUpperCase(), width - pad, top);
      context.fillText(face.note.toUpperCase(), width - pad, bottom);

      const ruleY = bottom - small * 2.1;
      context.fillStyle = rule;
      context.fillRect(pad, top + small * 1.1, inner, 2);
      context.fillRect(pad, ruleY, inner, 2);

      // The title takes the largest size at which it fits the space between
      // the rules, and sits on the lower one.
      context.textAlign = "left";
      context.fillStyle = ink;
      const room = ruleY - (top + small * 1.1) - small * 2.4;
      let size = width * 0.17;
      let lines: string[] = [];
      for (; size > width * 0.05; size *= 0.94) {
        context.font = `600 ${size}px ${sans}`;
        context.letterSpacing = `${-size * 0.03}px`;
        lines = wrap(context, face.title, inner);
        const widest = Math.max(
          ...lines.map((line) => context.measureText(line).width),
        );
        if (widest <= inner && lines.length * size * 0.98 <= room) break;
      }
      lines.forEach((line, i) =>
        context.fillText(
          line,
          pad - size * 0.04,
          ruleY - small * 1.5 - (lines.length - 1 - i) * size * 0.98,
        ),
      );

      texture.needsUpdate = true;
    }
    this.dirty = true;
  }

  private readonly loop = (now: number) => {
    if (this.disposed || this.paused) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;

    const still = this.options.reducedMotion;
    if (still && !this.dirty && !this.hoverPending) return;
    if (!still) this.time += dt;

    this.updateCamera(dt);
    this.updateRig(dt);
    this.updateBlocks(dt);
    this.updateCards(dt);
    this.updateGuides(dt);
    if (this.hoverPending && !this.dragging) this.pick();
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
    this.dirty = false;
  };

  private updateCamera(dt: number) {
    const { centerX, centerY, fitWidth, fitHeight } = this.frame;
    const targetShiftX = centerX - this.width / 2;
    const targetShiftY = centerY - this.height / 2;
    const [extentX, extentY] = this.formations[this.station].extent ?? [
      FIT_RADIUS,
      FIT_RADIUS,
    ];
    // Pixels per scene unit that just fits the formation inside the frame.
    const scale = Math.max(
      12,
      Math.min(fitWidth / (2 * extentX), fitHeight / (2 * extentY)),
    );
    const targetDistance =
      this.height / (2 * Math.tan((FOV * Math.PI) / 360) * scale);

    const k =
      this.framed && !this.options.reducedMotion ? 1 - Math.exp(-dt * 5) : 1;
    this.framed = true;
    this.shift.x += (targetShiftX - this.shift.x) * k;
    this.shift.y += (targetShiftY - this.shift.y) * k;
    this.distance += (targetDistance - this.distance) * k;

    this.camera.aspect = this.width / this.height;
    this.camera.position.set(0, 0, this.distance);
    // An off-axis frustum moves the vanishing point with the sculpture, so it
    // is not skewed when it sits beside the text column.
    this.camera.setViewOffset(
      this.width,
      this.height,
      -this.shift.x,
      -this.shift.y,
      this.width,
      this.height,
    );
    this.fog.near = this.distance - 2.5;
    this.fog.far = this.distance + 9;
  }

  private updateRig(dt: number) {
    const formation = this.formations[this.station];
    const total = TRAVEL + STAGGER;
    this.tilt.slerpQuaternions(
      this.tiltFrom,
      formation.tilt,
      easeInOut(Math.min(1, this.travel / total)),
    );

    if (formation.spin !== 0) this.spinYaw += formation.spin * dt;
    else {
      // Unwind to the nearest full turn so resting formations face forward.
      const rest = Math.round(this.spinYaw / (Math.PI * 2)) * Math.PI * 2;
      this.spinYaw += (rest - this.spinYaw) * (1 - Math.exp(-dt * 2.2));
    }

    if (!this.dragging) {
      this.dragYaw += this.dragVelocity;
      this.dragVelocity *= Math.exp(-dt * 4);
      const rest = Math.round(this.dragYaw / (Math.PI * 2)) * Math.PI * 2;
      this.dragYaw += (rest - this.dragYaw) * (1 - Math.exp(-dt * 0.5));
      this.dragPitch *= Math.exp(-dt * 1.2);
    }

    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-dt * 3));
    const sway =
      formation.spin === 0
        ? Math.sin(this.time * 0.22) * (formation.sway ?? 0.3)
        : 0;
    const yaw =
      this.spinYaw + this.dragYaw + sway + this.pointerSmooth.x * 0.16;

    this.lean.set(this.dragPitch + this.pointerSmooth.y * 0.09, 0, 0);
    this.leanQuat.setFromEuler(this.lean);
    this.yawQuat.setFromAxisAngle(Y_AXIS, yaw);
    this.rig.quaternion
      .copy(this.leanQuat)
      .multiply(this.tilt)
      .multiply(this.yawQuat);
    this.rig.updateMatrixWorld();
  }

  private updateBlocks(dt: number) {
    const formation = this.formations[this.station];
    formation.tick?.(this.time, this.focusGroup, this.options.reducedMotion);
    this.travel = Math.min(TRAVEL + STAGGER, this.travel + dt);

    const { pos, scl, quat, group } = formation;
    const matrix = this.mesh.instanceMatrix.array as Float32Array;
    const color = this.mesh.instanceColor!.array as Float32Array;
    const lit = this.focusGroup >= 0 && !this.options.quietFocus;
    const glowRate = 1 - Math.exp(-dt * 9);
    const still = this.options.reducedMotion;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const local = (this.travel - this.seed[i] * STAGGER) / TRAVEL;
      const t = local <= 0 ? 0 : local >= 1 ? 1 : easeInOut(local);
      const u = 1 - t;

      let px = pos[i3];
      let py = pos[i3 + 1];
      let pz = pos[i3 + 2];
      let sx = scl[i3];
      let sy = scl[i3 + 1];
      let sz = scl[i3 + 2];
      let qx = quat[i4];
      let qy = quat[i4 + 1];
      let qz = quat[i4 + 2];
      let qw = quat[i4 + 3];

      if (t < 1) {
        // Blocks leave on an arc rather than a straight line.
        const bow = Math.sin(Math.PI * t);
        px = this.fromPos[i3] * u + px * t + this.arc[i3] * bow;
        py = this.fromPos[i3 + 1] * u + py * t + this.arc[i3 + 1] * bow;
        pz = this.fromPos[i3 + 2] * u + pz * t + this.arc[i3 + 2] * bow;
        sx = this.fromScl[i3] * u + sx * t;
        sy = this.fromScl[i3 + 1] * u + sy * t;
        sz = this.fromScl[i3 + 2] * u + sz * t;
        const fx = this.fromQuat[i4];
        const fy = this.fromQuat[i4 + 1];
        const fz = this.fromQuat[i4 + 2];
        const fw = this.fromQuat[i4 + 3];
        const sign = fx * qx + fy * qy + fz * qz + fw * qw < 0 ? -1 : 1;
        qx = fx * u + qx * t * sign;
        qy = fy * u + qy * t * sign;
        qz = fz * u + qz * t * sign;
        qw = fw * u + qw * t * sign;
        const length = Math.hypot(qx, qy, qz, qw) || 1;
        qx /= length;
        qy /= length;
        qz /= length;
        qw /= length;
      }

      this.curPos[i3] = px;
      this.curPos[i3 + 1] = py;
      this.curPos[i3 + 2] = pz;
      this.curScl[i3] = sx;
      this.curScl[i3 + 1] = sy;
      this.curScl[i3 + 2] = sz;
      this.curQuat[i4] = qx;
      this.curQuat[i4 + 1] = qy;
      this.curQuat[i4 + 2] = qz;
      this.curQuat[i4 + 3] = qw;

      // glow: +1 for the focused group, -1 for everything else, 0 at rest.
      const want = lit ? (group[i] === this.focusGroup ? 1 : -1) : 0;
      const glow = still
        ? want
        : this.glow[i] + (want - this.glow[i]) * glowRate;
      this.glow[i] = glow;
      const swell = glow > 0 ? 1 + glow * 0.16 : 1;
      sx *= swell;
      sy *= swell;
      sz *= swell;

      const x2 = qx + qx;
      const y2 = qy + qy;
      const z2 = qz + qz;
      const xx = qx * x2;
      const xy = qx * y2;
      const xz = qx * z2;
      const yy = qy * y2;
      const yz = qy * z2;
      const zz = qz * z2;
      const wx = qw * x2;
      const wy = qw * y2;
      const wz = qw * z2;
      const o = i * 16;
      matrix[o] = (1 - (yy + zz)) * sx;
      matrix[o + 1] = (xy + wz) * sx;
      matrix[o + 2] = (xz - wy) * sx;
      matrix[o + 3] = 0;
      matrix[o + 4] = (xy - wz) * sy;
      matrix[o + 5] = (1 - (xx + zz)) * sy;
      matrix[o + 6] = (yz + wx) * sy;
      matrix[o + 7] = 0;
      matrix[o + 8] = (xz + wy) * sz;
      matrix[o + 9] = (yz - wx) * sz;
      matrix[o + 10] = (1 - (xx + yy)) * sz;
      matrix[o + 11] = 0;
      matrix[o + 12] = px;
      matrix[o + 13] = py;
      matrix[o + 14] = pz;
      matrix[o + 15] = 1;

      const target = glow > 0 ? this.accent : this.dim;
      const mix = glow > 0 ? glow * 0.92 : -glow * 0.82;
      color[i3] = this.baseColor[i3] + (target.r - this.baseColor[i3]) * mix;
      color[i3 + 1] =
        this.baseColor[i3 + 1] + (target.g - this.baseColor[i3 + 1]) * mix;
      color[i3 + 2] =
        this.baseColor[i3 + 2] + (target.b - this.baseColor[i3 + 2]) * mix;
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor!.needsUpdate = true;
  }

  /** Fades the cards in once their frames have arrived, and out again. */
  private updateCards(dt: number) {
    if (this.cards.length === 0) return;
    const rate = this.options.reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
    const arrived = this.travel > TRAVEL * 0.85;
    const active = this.cards[0].station === this.station;
    this.cardReveal += ((active && arrived ? 1 : 0) - this.cardReveal) * rate;

    for (const { station, index, mesh } of this.cards) {
      const card = this.formations[station].cards![index];
      const opacity = this.cardReveal * card.presence;
      mesh.visible = opacity > 0.01;
      if (!mesh.visible) continue;
      mesh.position.set(0, card.y, card.z);
      mesh.rotation.x = card.tilt;
      mesh.scale.setScalar(card.scale);
      mesh.material.opacity = opacity;
    }
  }

  private updateGuides(dt: number) {
    const rate = this.options.reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    const settled = this.travel > TRAVEL * 0.6;
    for (const [id, lines] of this.guides) {
      const material = lines.material as LineBasicMaterial;
      const want = id === this.station && settled ? 0.3 : 0;
      material.opacity += (want - material.opacity) * rate;
      lines.visible = material.opacity > 0.01;
    }
  }

  private updateLabels() {
    const formation = this.formations[this.station];
    const settled = this.travel > TRAVEL;
    this.anchorQuat.copy(this.leanQuat).multiply(this.tilt);
    for (const label of this.labels) {
      const active =
        label.station === this.station &&
        settled &&
        (formation.labels === "always" || label.group.key === this.focus);
      if (active !== label.shown) {
        label.shown = active;
        label.el.classList.toggle("is-visible", active);
        if (active) label.width = label.el.offsetWidth;
      }
      label.el.classList.toggle(
        "is-lit",
        active && label.group.key === this.focus,
      );
      if (!active) continue;

      this.scratch.set(...label.group.anchor);
      if (formation.fixedAnchors) this.scratch.applyQuaternion(this.anchorQuat);
      else this.scratch.applyMatrix4(this.rig.matrixWorld);
      this.scratch.project(this.camera);
      // Keep the label inside the viewport.
      const x = Math.min(
        (this.scratch.x * 0.5 + 0.5) * this.width,
        this.width - label.width - LABEL_GUTTER,
      );
      const y = (-this.scratch.y * 0.5 + 0.5) * this.height;
      label.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }
}
