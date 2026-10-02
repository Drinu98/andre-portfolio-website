import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
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
  MeshLambertMaterial,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  Sphere,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { stations, type StationId } from "@/lib/stations";
import {
  buildFormations,
  type Formation,
  type FormationGroup,
} from "./formations";

export type SculptureHit = {
  key: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
};

type Options = {
  count: number;
  maxPixelRatio: number;
  reducedMotion: boolean;
  /** Wide layouts get the single-row skyline. */
  wide: boolean;
  /** The on-page panel a station's formation should sit inside. */
  getStage: (id: StationId) => DOMRect | null;
  onHover: (hit: SculptureHit | null) => void;
  onSelect: (key: string) => void;
};

/** Where the sculpture sits on screen: centre in px, and px per scene unit. */
type Placement = { x: number; y: number; scale: number };

const FOV = 30;
const TRAVEL = 1.25;
const STAGGER = 0.55;
const STAGE_FILL = 0.92;
const Y_AXIS = new Vector3(0, 1, 0);

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const cssColor = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return new Color(value || fallback);
};

/**
 * One instanced mesh of boxes that is rearranged per station. Nothing is added
 * or removed between stations: every block travels to its slot in the next
 * formation, and the whole piece moves to that station's panel on the page.
 *
 * The canvas is a fixed, click-through layer above the content, so the blocks
 * can cross the page between panels. Pointer input is fed in by the caller.
 */
export class Sculpture {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 400);
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
  private blank = false;

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
  private readonly pointer = new Vector2();
  private readonly pointerSmooth = new Vector2();
  private readonly hoverPoint = new Vector2();
  private readonly ndc = new Vector2();
  private hoverPending = false;
  private hoverKey: string | null = null;

  private width = 1;
  private height = 1;
  private readonly placement: Placement = { x: 0, y: 0, scale: 40 };
  // Where the piece was when the current trip began, pinned to the document
  // so it keeps scrolling with the page while the blocks leave it.
  private readonly departure: Placement = { x: 0, y: 0, scale: 40 };
  private departureScroll = 0;
  private readonly lastStage = new Map<StationId, Placement>();

  private readonly accent = new Color();
  private readonly accentAlt = new Color();
  private readonly dim = new Color();
  private readonly lo = new Color();
  private readonly hi = new Color();
  private readonly scratch = new Vector3();

  constructor(
    private readonly host: HTMLElement,
    labelHost: HTMLElement,
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

    const { pulse, ...formations } = buildFormations(n, options.wide);
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
      const mark = Math.random();
      this.marked[i] = mark < 0.03 ? 1 : mark < 0.055 ? 2 : 0;
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

      for (const group of this.formations[id].groups) {
        const el = document.createElement("span");
        el.className = "scene-label";
        const name = document.createElement("b");
        name.textContent = group.label;
        el.append(name);
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

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(host);
    this.resize();
    this.stageOf("home", this.departure);
    this.departureScroll = window.scrollY;

    window.addEventListener("pointermove", this.onWindowPointer, {
      passive: true,
    });
    document.addEventListener("visibilitychange", this.onVisibility);

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  get currentStation() {
    return this.station;
  }

  setStation(id: StationId) {
    if (id === this.station) return;
    this.fromPos.set(this.curPos);
    this.fromScl.set(this.curScl);
    this.fromQuat.set(this.curQuat);
    this.tiltFrom.copy(this.tilt);
    this.departure.x = this.placement.x;
    this.departure.y = this.placement.y;
    this.departure.scale = this.placement.scale;
    this.departureScroll = window.scrollY;
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

  /** Marks the frame stale, for when layout or scroll position changed. */
  invalidate() {
    this.dirty = true;
  }

  /** Re-reads the palette from CSS so the scene follows the page theme. */
  setTheme() {
    const style = getComputedStyle(document.documentElement);
    const stage = cssColor("--stage-bg", "#fafafa");
    this.lo.copy(cssColor("--block-lo", "#262626"));
    this.hi.copy(cssColor("--block-hi", "#a3a3a3"));
    this.accent.copy(cssColor("--block-accent", "#3b82f6"));
    this.accentAlt.copy(cssColor("--block-accent-alt", "#a855f7"));
    this.dim.copy(cssColor("--block-dim", "#e5e5e5"));
    this.fog.color.copy(stage);
    this.sky.color.set(0xffffff);
    this.sky.groundColor.copy(stage);
    this.sky.intensity =
      Number(style.getPropertyValue("--block-ambient")) || 1.6;
    this.sun.intensity = 2.1;

    const c = new Color();
    for (let i = 0; i < this.count; i++) {
      if (this.marked[i] === 1) c.copy(this.accent);
      else if (this.marked[i] === 2) c.copy(this.accentAlt);
      else c.copy(this.lo).lerp(this.hi, this.tone[i]);
      this.baseColor[i * 3] = c.r;
      this.baseColor[i * 3 + 1] = c.g;
      this.baseColor[i * 3 + 2] = c.b;
    }
    const line = cssColor("--block-line", "#a3a3a3");
    for (const lines of this.guides.values())
      (lines.material as LineBasicMaterial).color.copy(line);
    this.dirty = true;
  }

  /** Sends one tall crest through the Signal formation. */
  pulse() {
    this.pulseSignal();
    this.dirty = true;
  }

  /**
   * Draws every formation once, settled and unlit, and returns each as an
   * image sized to its panel. Panels show these stills while the live piece
   * is docked somewhere else, so no panel is ever empty.
   */
  renderGhosts() {
    const ghosts: Partial<Record<StationId, string>> = {};
    const buffer = document.createElement("canvas");
    const context = buffer.getContext("2d");
    if (!context) return ghosts;

    const saved = {
      station: this.station,
      travel: this.travel,
      time: this.time,
      spinYaw: this.spinYaw,
      dragYaw: this.dragYaw,
      dragPitch: this.dragPitch,
      pointerX: this.pointerSmooth.x,
      pointerY: this.pointerSmooth.y,
      tilt: this.tilt.clone(),
      opacity: new Map(
        [...this.guides].map(([id, lines]) => [
          id,
          (lines.material as LineBasicMaterial).opacity,
        ]),
      ),
    };
    const ratio = this.renderer.getPixelRatio();
    const centre: Placement = {
      x: this.width / 2,
      y: this.height / 2,
      scale: 1,
    };

    this.travel = TRAVEL + STAGGER;
    this.time = 0;
    this.spinYaw = this.dragYaw = this.dragPitch = 0;
    this.pointerSmooth.set(0, 0);

    for (const { id } of stations) {
      const rect = this.options.getStage(id);
      if (!rect || rect.width < 1 || rect.height < 1) continue;
      const w = Math.min(rect.width, this.width);
      const h = Math.min(rect.height, this.height);
      const [extentX, extentY] = this.formations[id].extent;
      centre.scale =
        Math.min(w / (2 * extentX), h / (2 * extentY)) * STAGE_FILL;

      this.station = id;
      this.aim(centre);
      this.updateRig(0);
      this.updateBlocks(0, true);
      for (const [guide, lines] of this.guides) {
        lines.visible = guide === id;
        (lines.material as LineBasicMaterial).opacity = 0.55;
      }
      this.renderer.render(this.scene, this.camera);

      // The drawing buffer is only readable until this task yields.
      buffer.width = Math.round(w * ratio);
      buffer.height = Math.round(h * ratio);
      context.clearRect(0, 0, buffer.width, buffer.height);
      context.drawImage(
        this.renderer.domElement,
        Math.round(((this.width - w) / 2) * ratio),
        Math.round(((this.height - h) / 2) * ratio),
        buffer.width,
        buffer.height,
        0,
        0,
        buffer.width,
        buffer.height,
      );
      ghosts[id] = buffer.toDataURL("image/png");
    }

    this.station = saved.station;
    this.travel = saved.travel;
    this.time = saved.time;
    this.spinYaw = saved.spinYaw;
    this.dragYaw = saved.dragYaw;
    this.dragPitch = saved.dragPitch;
    this.pointerSmooth.set(saved.pointerX, saved.pointerY);
    this.tilt.copy(saved.tilt);
    for (const [id, lines] of this.guides) {
      const material = lines.material as LineBasicMaterial;
      material.opacity = saved.opacity.get(id) ?? 0;
      lines.visible = material.opacity > 0.01;
    }
    this.renderer.clear();
    this.blank = false;
    this.dirty = true;
    return ghosts;
  }

  startDrag() {
    this.dragging = true;
    this.dragMoved = 0;
    this.dragVelocity = 0;
  }

  drag(dx: number, dy: number) {
    if (!this.dragging) return;
    this.dragMoved += Math.abs(dx) + Math.abs(dy);
    this.dragVelocity = dx * 0.008;
    this.dragYaw += this.dragVelocity;
    this.dragPitch = Math.max(-0.6, Math.min(0.6, this.dragPitch + dy * 0.005));
    this.dirty = true;
  }

  /** Ends a drag; a press that barely moved counts as a click on the group. */
  endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.dragMoved < 5 && this.hoverKey)
      this.options.onSelect(this.hoverKey);
  }

  hoverAt(x: number, y: number) {
    this.hoverPoint.set(x, y);
    this.hoverPending = true;
  }

  hoverEnd() {
    this.hoverPending = false;
    this.clearHover();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    window.removeEventListener("pointermove", this.onWindowPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    for (const lines of this.guides.values()) {
      lines.geometry.dispose();
      (lines.material as LineBasicMaterial).dispose();
    }
    for (const label of this.labels) label.el.remove();
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

  private clearHover() {
    if (this.hoverKey === null) return;
    this.hoverKey = null;
    this.options.onHover(null);
  }

  private pick() {
    this.hoverPending = false;
    this.ndc.set(
      (this.hoverPoint.x / this.width) * 2 - 1,
      -(this.hoverPoint.y / this.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const formation = this.formations[this.station];
    const hit = this.raycaster
      .intersectObject(this.mesh, false)
      .find(
        (h) => h.instanceId !== undefined && formation.group[h.instanceId] >= 0,
      );
    if (!hit || hit.instanceId === undefined) return this.clearHover();
    const group = formation.groups[formation.group[hit.instanceId]];
    this.hoverKey = group.key;
    this.options.onHover({
      key: group.key,
      label: group.label,
      sub: group.sub,
      x: this.hoverPoint.x,
      y: this.hoverPoint.y,
    });
  }

  /**
   * Reads a station's panel into `out`. Falls back to the last known panel,
   * then to the middle of the viewport, so a missing panel never breaks a trip.
   */
  private stageOf(id: StationId, out: Placement) {
    const rect = this.options.getStage(id);
    const [extentX, extentY] = this.formations[id].extent;
    if (rect && rect.width > 0 && rect.height > 0) {
      out.x = rect.left + rect.width / 2;
      out.y = rect.top + rect.height / 2;
      out.scale =
        Math.min(rect.width / (2 * extentX), rect.height / (2 * extentY)) *
        STAGE_FILL;
      this.lastStage.set(id, { ...out });
      return out;
    }
    const known = this.lastStage.get(id);
    out.x = known?.x ?? this.width / 2;
    out.y = known?.y ?? this.height / 2;
    out.scale = known?.scale ?? 40;
    return out;
  }

  private readonly loop = (now: number) => {
    if (this.disposed || this.paused) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;

    const still = this.options.reducedMotion;
    if (still && !this.dirty && !this.hoverPending) return;
    if (!still) this.time += dt;

    const onScreen = this.updateCamera();
    const settled = this.travel >= TRAVEL + STAGGER;
    if (!onScreen && settled) {
      // The panel is well off screen: draw one empty frame, then idle.
      if (!this.blank) {
        this.renderer.clear();
        this.hideLabels();
        this.blank = true;
      }
      this.dirty = false;
      return;
    }
    this.blank = false;

    this.updateRig(dt);
    this.updateBlocks(dt);
    this.updateGuides(dt);
    if (this.hoverPending && !this.dragging) this.pick();
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
    this.dirty = false;
  };

  /** Places the camera so the piece lands on its panel. Returns visibility. */
  private updateCamera() {
    const target = this.stageOf(this.station, this.placement);
    const progress = easeInOut(Math.min(1, this.travel / (TRAVEL + STAGGER)));
    if (progress < 1) {
      const fromY = this.departure.y - (window.scrollY - this.departureScroll);
      target.x = this.departure.x + (target.x - this.departure.x) * progress;
      target.y = fromY + (target.y - fromY) * progress;
      target.scale =
        this.departure.scale + (target.scale - this.departure.scale) * progress;
    }

    this.aim(target);

    const margin = this.height * 0.4;
    return target.y > -margin && target.y < this.height + margin;
  }

  /** Points the camera so the piece is drawn at `at`, in viewport pixels. */
  private aim(at: Placement) {
    const distance =
      this.height / (2 * Math.tan((FOV * Math.PI) / 360) * at.scale);
    this.camera.aspect = this.width / this.height;
    this.camera.position.set(0, 0, distance);
    // An off-axis frustum moves the vanishing point with the sculpture, so it
    // is not skewed when it sits away from the middle of the viewport.
    this.camera.setViewOffset(
      this.width,
      this.height,
      this.width / 2 - at.x,
      this.height / 2 - at.y,
      this.width,
      this.height,
    );
    this.fog.near = distance - 2.5;
    this.fog.far = distance + 9;
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
      formation.spin === 0 ? Math.sin(this.time * 0.22) * formation.sway : 0;
    const yaw =
      this.spinYaw + this.dragYaw + sway + this.pointerSmooth.x * 0.14;

    this.lean.set(this.dragPitch + this.pointerSmooth.y * 0.08, 0, 0);
    this.leanQuat.setFromEuler(this.lean);
    this.yawQuat.setFromAxisAngle(Y_AXIS, yaw);
    this.rig.quaternion
      .copy(this.leanQuat)
      .multiply(this.tilt)
      .multiply(this.yawQuat);
    this.rig.updateMatrixWorld();
  }

  private updateBlocks(dt: number, ghost = false) {
    const formation = this.formations[this.station];
    formation.tick?.(this.time);
    this.travel = Math.min(TRAVEL + STAGGER, this.travel + dt);

    const { pos, scl, quat, group } = formation;
    const matrix = this.mesh.instanceMatrix.array as Float32Array;
    const color = this.mesh.instanceColor!.array as Float32Array;
    const hasFocus = this.focusGroup >= 0;
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
      const want = hasFocus ? (group[i] === this.focusGroup ? 1 : -1) : 0;
      const glow = ghost
        ? 0
        : still
          ? want
          : this.glow[i] + (want - this.glow[i]) * glowRate;
      if (!ghost) this.glow[i] = glow;
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

  private updateGuides(dt: number) {
    const rate = this.options.reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    const settled = this.travel > TRAVEL * 0.6;
    for (const [id, lines] of this.guides) {
      const material = lines.material as LineBasicMaterial;
      const want = id === this.station && settled ? 0.55 : 0;
      material.opacity += (want - material.opacity) * rate;
      lines.visible = material.opacity > 0.01;
    }
  }

  private hideLabels() {
    for (const label of this.labels) {
      if (!label.shown) continue;
      label.shown = false;
      label.el.classList.remove("is-visible");
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
      if (!active) continue;

      this.scratch.set(...label.group.anchor);
      if (formation.fixedAnchors) this.scratch.applyQuaternion(this.anchorQuat);
      else this.scratch.applyMatrix4(this.rig.matrixWorld);
      this.scratch.project(this.camera);
      // Labels are centred on their anchor and kept inside the viewport.
      const half = label.width / 2 + 8;
      const x = Math.max(
        half,
        Math.min(this.width - half, (this.scratch.x * 0.5 + 0.5) * this.width),
      );
      const y = (-this.scratch.y * 0.5 + 0.5) * this.height;
      label.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    }
  }
}
