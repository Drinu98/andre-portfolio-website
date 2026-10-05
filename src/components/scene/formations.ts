import { Euler, Quaternion } from "three";
import { experience } from "@/constants/experience";
import { projects } from "@/constants/projects";
import { skillCategories } from "@/constants/skills";
import { focusKey, stackLayers, type StationId } from "@/lib/stations";

export type FormationGroup = {
  key: string;
  label: string;
  sub?: string;
  /** Label anchor in sculpture space. */
  anchor: [number, number, number];
};

export type Formation = {
  id: StationId;
  /** Per-block targets. `pos`/`scl` are xyz triples, `quat` is xyzw. */
  pos: Float32Array;
  scl: Float32Array;
  quat: Float32Array;
  /** Index into `groups` for each block, or -1. */
  group: Int16Array;
  groups: FormationGroup[];
  /** Resting tilt of the whole sculpture. */
  tilt: Quaternion;
  /** Continuous yaw in rad/s. Zero means the sculpture only sways. */
  spin: number;
  /** Labels either stay up or only show for the focused group. */
  labels: "always" | "focus";
  /** Anchors ignore yaw, so labels hold still while the blocks turn. */
  fixedAnchors: boolean;
  /** Line segment vertex pairs drawn under the blocks. */
  guides: Float32Array;
  /** Half-angle of the idle sway in radians, for formations that do not spin. */
  sway?: number;
  /**
   * Half-width and half-height the formation needs on screen, in scene units.
   * Left out, it is framed as a sphere.
   */
  extent?: [number, number];
  /** Cards carried by the blocks. `tick` keeps their placement current. */
  cards?: Card[];
  /**
   * Rewrites the targets for time-dependent formations. `focus` is the index
   * of the focused group (or -1), and `snap` skips any easing.
   */
  tick?: (time: number, focus: number, snap: boolean) => void;
};

/** Where one card sits, in sculpture space. */
export type Card = {
  key: string;
  y: number;
  z: number;
  /** Rotation about the x axis, in radians. */
  tilt: number;
  scale: number;
  /** 1 for the card at the front, falling to 0 as it goes round the back. */
  presence: number;
};

export const CARD_WIDTH = 4.2;
export const CARD_HEIGHT = 3;

type Rng = () => number;

const TAU = Math.PI * 2;

const mulberry32 = (seed: number): Rng => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffled = (n: number, rng: Rng) => {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const tiltOf = (x: number, y: number, z: number) =>
  new Quaternion().setFromEuler(new Euler(x, y, z, "XYZ"));

const blank = (n: number) => {
  const quat = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) quat[i * 4 + 3] = 1;
  return {
    pos: new Float32Array(n * 3),
    scl: new Float32Array(n * 3),
    quat,
    group: new Int16Array(n).fill(-1),
  };
};

/** Splits `n` blocks across weights so the shares sum to exactly `n`. */
const allocate = (n: number, weights: number[]) => {
  const total = weights.reduce((a, b) => a + b, 0);
  const shares = weights.map((w) => Math.floor((n * w) / total));
  let left = n - shares.reduce((a, b) => a + b, 0);
  for (let i = 0; left > 0; i = (i + 1) % shares.length, left--) shares[i]++;
  return shares;
};

const circle = (
  out: number[],
  radius: number,
  place: (x: number, y: number, z: number) => [number, number, number],
  segments = 72,
) => {
  for (let s = 0; s < segments; s++) {
    const a = (s / segments) * TAU;
    const b = ((s + 1) / segments) * TAU;
    out.push(
      ...place(Math.cos(a) * radius, 0, Math.sin(a) * radius),
      ...place(Math.cos(b) * radius, 0, Math.sin(b) * radius),
    );
  }
};

/* -------------------------------------------------------------------------- */
/* 00 Assembly: an exploded stack of four slabs, one per layer of the work.    */
/* -------------------------------------------------------------------------- */

const buildAssembly = (n: number): Formation => {
  const rng = mulberry32(11);
  const f = blank(n);
  const order = shuffled(n, rng);

  const layers = stackLayers.length;
  const levels = 2;
  const g = Math.ceil(Math.sqrt(n / (layers * levels)));
  const side = 4;
  const cell = side / g;
  const slab = levels * cell;
  const gap = 0.46;
  const height = layers * slab + (layers - 1) * gap;

  const cells: [number, number, number, number][] = [];
  for (let l = 0; l < layers; l++)
    for (let lev = 0; lev < levels; lev++)
      for (let ix = 0; ix < g; ix++)
        for (let iz = 0; iz < g; iz++) cells.push([l, lev, ix, iz]);
  const pick = shuffled(cells.length, rng);

  const baseY = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const i = order[k];
    const [l, lev, ix, iz] = cells[pick[k]];
    const y = height / 2 - l * (slab + gap) - (lev + 0.5) * cell;
    f.pos[i * 3] = (ix + 0.5) * cell - side / 2;
    f.pos[i * 3 + 1] = y;
    f.pos[i * 3 + 2] = (iz + 0.5) * cell - side / 2;
    baseY[i] = y;
    f.group[i] = l;

    // Each layer gets its own grain: screens, components, services, bedrock.
    let w = cell * 0.8;
    let h = cell * 0.8;
    if (l === 0) {
      w = cell * 0.9;
      h = cell * 0.2;
    } else if (l === 1) {
      w = cell * (0.5 + rng() * 0.3);
      h = cell * (0.5 + rng() * 0.4);
    } else if (l === 2) {
      w = cell * 0.74;
      h = cell * (rng() < 0.2 ? 1.5 : 0.78);
    } else {
      w = cell * 0.94;
      h = cell * 0.56;
    }
    f.scl[i * 3] = w;
    f.scl[i * 3 + 1] = h;
    f.scl[i * 3 + 2] = w;
  }

  const groups: FormationGroup[] = stackLayers.map((layer, l) => ({
    key: focusKey.layer(layer.key),
    label: layer.title,
    sub: `Layer 0${l + 1}`,
    anchor: [
      side / 2 + 0.2,
      height / 2 - l * (slab + gap) - slab / 2,
      side / 2 + 0.2,
    ],
  }));

  const guides: number[] = [];
  const h2 = height / 2 + 0.3;
  const s2 = side / 2 + 0.12;
  for (const [x, z] of [
    [-s2, -s2],
    [s2, -s2],
    [s2, s2],
    [-s2, s2],
  ])
    guides.push(x, -h2, z, x, h2, z);
  for (let l = 0; l < layers - 1; l++) {
    const y = height / 2 - l * (slab + gap) - slab - gap / 2;
    guides.push(-s2, y, -s2, s2, y, -s2, s2, y, -s2, s2, y, s2);
    guides.push(s2, y, s2, -s2, y, s2, -s2, y, s2, -s2, y, -s2);
  }

  return {
    id: "home",
    ...f,
    groups,
    tilt: tiltOf(0.46, -0.72, 0),
    spin: 0,
    labels: "always",
    fixedAnchors: false,
    guides: new Float32Array(guides),
    tick: (time) => {
      for (let i = 0; i < n; i++)
        f.pos[i * 3 + 1] =
          baseY[i] + Math.sin(time * 0.7 + f.group[i] * 1.1) * 0.05;
    },
  };
};

/* -------------------------------------------------------------------------- */
/* 01 Island: a stylised relief of the Maltese islands.                        */
/* -------------------------------------------------------------------------- */

// Hand-traced coastlines as [longitude, latitude]. Deliberately coarse: each
// block covers roughly a kilometre, so this is a silhouette, not a chart.
const MALTA: [number, number][] = [
  [14.329, 35.989],
  [14.365, 35.996],
  [14.375, 35.99],
  [14.355, 35.972],
  [14.39, 35.967],
  [14.39, 35.948],
  [14.425, 35.96],
  [14.42, 35.945],
  [14.455, 35.94],
  [14.49, 35.93],
  [14.515, 35.91],
  [14.519, 35.902],
  [14.53, 35.895],
  [14.55, 35.887],
  [14.575, 35.868],
  [14.565, 35.853],
  [14.565, 35.822],
  [14.545, 35.84],
  [14.53, 35.825],
  [14.535, 35.812],
  [14.51, 35.806],
  [14.455, 35.82],
  [14.42, 35.826],
  [14.375, 35.85],
  [14.33, 35.905],
  [14.34, 35.93],
  [14.34, 35.96],
  [14.327, 35.98],
];

const GOZO: [number, number][] = [
  [14.185, 36.05],
  [14.19, 36.065],
  [14.25, 36.08],
  [14.29, 36.065],
  [14.335, 36.035],
  [14.3, 36.024],
  [14.25, 36.015],
  [14.21, 36.028],
];

const COMINO: [number, number] = [14.336, 36.012];

// San Ġwann, where the label is pinned.
const HOME: [number, number] = [14.4786, 35.9094];

const inPolygon = (x: number, y: number, poly: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
};

const buildIsland = (n: number): Formation => {
  const rng = mulberry32(23);
  const f = blank(n);
  const order = shuffled(n, rng);

  const lon0 = 14.165;
  const lon1 = 14.595;
  const lat0 = 35.772;
  const lat1 = 36.12;
  const g = Math.ceil(Math.sqrt(n));
  const size = 6;
  const cell = size / g;

  const land = new Uint8Array(g * g);
  const lonOf = (ix: number) => lon0 + ((ix + 0.5) / g) * (lon1 - lon0);
  const latOf = (iz: number) => lat1 - ((iz + 0.5) / g) * (lat1 - lat0);
  for (let iz = 0; iz < g; iz++)
    for (let ix = 0; ix < g; ix++) {
      const lon = lonOf(ix);
      const lat = latOf(iz);
      const comino =
        Math.hypot((lon - COMINO[0]) * 0.81, lat - COMINO[1]) < 0.0105;
      if (inPolygon(lon, lat, MALTA) || inPolygon(lon, lat, GOZO) || comino)
        land[iz * g + ix] = 1;
    }

  // Chebyshev distance to the nearest cell of the other kind.
  const reach = 6;
  const coast = new Float32Array(g * g);
  for (let iz = 0; iz < g; iz++)
    for (let ix = 0; ix < g; ix++) {
      const here = land[iz * g + ix];
      let best = reach;
      for (let dz = -reach; dz <= reach; dz++)
        for (let dx = -reach; dx <= reach; dx++) {
          const x = ix + dx;
          const z = iz + dz;
          const other =
            x < 0 || z < 0 || x >= g || z >= g ? 0 : land[z * g + x];
          if (other !== here) best = Math.min(best, Math.hypot(dx, dz));
        }
      coast[iz * g + ix] = best;
    }

  type Slot = { ix: number; iz: number; lev: number; land: boolean };
  const slots: Slot[] = [];
  const levels = new Uint8Array(g * g);
  for (let iz = 0; iz < g; iz++)
    for (let ix = 0; ix < g; ix++) {
      if (!land[iz * g + ix]) continue;
      // The ground rises towards the western cliffs and falls to the harbours.
      const west = Math.min(1, Math.max(0, (14.53 - lonOf(ix)) / 0.2));
      const inland = Math.min(1, coast[iz * g + ix] / 3);
      const levelsHere = Math.min(
        5,
        1 + Math.floor(inland * (0.6 + 2.8 * west) + rng() * 0.9),
      );
      for (let lev = 0; lev < levelsHere; lev++)
        slots.push({ ix, iz, lev, land: true });
      levels[iz * g + ix] = levelsHere;
    }

  const sea: { ix: number; iz: number; d: number }[] = [];
  for (let iz = 0; iz < g; iz++)
    for (let ix = 0; ix < g; ix++)
      if (!land[iz * g + ix])
        sea.push({ ix, iz, d: coast[iz * g + ix] + rng() * 2.4 });
  sea.sort((a, b) => a.d - b.d);
  for (const s of sea) slots.push({ ix: s.ix, iz: s.iz, lev: 0, land: false });

  const step = cell * 0.82;
  const lift = -0.7;
  for (let k = 0; k < n; k++) {
    const i = order[k];
    const s = slots[k % slots.length];
    f.pos[i * 3] = (s.ix + 0.5) * cell - size / 2;
    f.pos[i * 3 + 2] = (s.iz + 0.5) * cell - size / 2;
    if (s.land) {
      f.pos[i * 3 + 1] = lift + (s.lev + 0.5) * step;
      f.scl[i * 3] = cell * 0.86;
      f.scl[i * 3 + 1] = step * 0.92;
      f.scl[i * 3 + 2] = cell * 0.86;
      f.group[i] = 0;
    } else {
      f.pos[i * 3 + 1] = lift;
      f.scl[i * 3] = cell * 0.3;
      f.scl[i * 3 + 1] = cell * 0.08;
      f.scl[i * 3 + 2] = cell * 0.3;
    }
  }

  const home = {
    ix: Math.floor(((HOME[0] - lon0) / (lon1 - lon0)) * g),
    iz: Math.floor(((lat1 - HOME[1]) / (lat1 - lat0)) * g),
  };

  const half = size / 2 + 0.25;
  const guides: number[] = [];
  guides.push(-half, lift, -half, half, lift, -half);
  guides.push(half, lift, -half, half, lift, half);
  guides.push(half, lift, half, -half, lift, half);
  guides.push(-half, lift, half, -half, lift, -half);
  for (const t of [-1 / 3, 1 / 3]) {
    guides.push(t * half, lift, -half, t * half, lift, half);
    guides.push(-half, lift, t * half, half, lift, t * half);
  }

  return {
    id: "about",
    ...f,
    groups: [
      {
        key: focusKey.place("malta"),
        label: "Malta",
        sub: "35.91°N 14.48°E",
        anchor: [
          (home.ix + 0.5) * cell - size / 2,
          lift + (levels[home.iz * g + home.ix] + 1.2) * step,
          (home.iz + 0.5) * cell - size / 2,
        ],
      },
    ],
    tilt: tiltOf(0.82, -0.28, 0),
    spin: 0,
    labels: "always",
    fixedAnchors: false,
    guides: new Float32Array(guides),
  };
};

/* -------------------------------------------------------------------------- */
/* 02 Orbits: one ring per skill category, one heavy block per tool.           */
/* -------------------------------------------------------------------------- */

const buildOrbits = (n: number): Formation => {
  const rng = mulberry32(37);
  const f = blank(n);
  const order = shuffled(n, rng);

  const rings = skillCategories.map((category, k) => ({
    category,
    radius: 1.2 + k * 0.74,
    speed: (k % 2 === 0 ? 1 : -1) * (0.2 / (1 + k * 0.5)),
    quat: tiltOf(
      [0.22, -0.3, 0.12, -0.16][k % 4],
      0,
      [0.3, 0.1, -0.24, 0.2][k % 4],
    ),
    labelAngle: [-2.3, -0.75, 2.45, 1.5][k % 4],
  }));

  const nucleus = Math.round(n * 0.09);
  const heavy = rings.reduce((t, r) => t + r.category.skills.length, 0);
  const dust = allocate(
    n - nucleus - heavy,
    rings.map((r) => r.radius),
  );

  const ring = new Int8Array(n).fill(-1);
  const angle = new Float32Array(n);
  const offR = new Float32Array(n);
  const offY = new Float32Array(n);

  let k = 0;
  for (let c = 0; c < nucleus; c++, k++) {
    const i = order[k];
    const r = 0.5 * Math.cbrt(rng());
    const a = rng() * TAU;
    const y = rng() * 2 - 1;
    const flat = Math.sqrt(1 - y * y);
    f.pos[i * 3] = r * flat * Math.cos(a);
    f.pos[i * 3 + 1] = r * y;
    f.pos[i * 3 + 2] = r * flat * Math.sin(a);
    const s = 0.05 + rng() * 0.13;
    f.scl[i * 3] = f.scl[i * 3 + 1] = f.scl[i * 3 + 2] = s;
  }

  rings.forEach((r, ri) => {
    const count = r.category.skills.length;
    for (let s = 0; s < count; s++, k++) {
      const i = order[k];
      ring[i] = ri;
      angle[i] = (s / count) * TAU + ri * 0.7;
      f.scl[i * 3] = f.scl[i * 3 + 1] = f.scl[i * 3 + 2] = 0.24;
      f.group[i] = ri;
    }
    for (let d = 0; d < dust[ri]; d++, k++) {
      const i = order[k];
      ring[i] = ri;
      angle[i] = rng() * TAU;
      offR[i] = (rng() - 0.5) * 0.2;
      offY[i] = (rng() - 0.5) * 0.09;
      const s = 0.03 + rng() * 0.05;
      f.scl[i * 3] = s;
      f.scl[i * 3 + 1] = s;
      f.scl[i * 3 + 2] = s * (1.5 + rng() * 3);
      f.group[i] = ri;
    }
  });

  const place = (ri: number) => (x: number, y: number, z: number) => {
    const q = rings[ri].quat;
    // v' = v + 2w(q × v) + 2(q × (q × v))
    const tx = 2 * (q.y * z - q.z * y);
    const ty = 2 * (q.z * x - q.x * z);
    const tz = 2 * (q.x * y - q.y * x);
    return [
      x + q.w * tx + (q.y * tz - q.z * ty),
      y + q.w * ty + (q.z * tx - q.x * tz),
      z + q.w * tz + (q.x * ty - q.y * tx),
    ] as [number, number, number];
  };

  const guides: number[] = [];
  rings.forEach((r, ri) => circle(guides, r.radius, place(ri), 96));

  const groups: FormationGroup[] = rings.map((r, ri) => ({
    key: focusKey.skill(r.category.key),
    label: r.category.title,
    sub: `${String(r.category.skills.length).padStart(2, "0")} tools`,
    anchor: place(ri)(
      Math.cos(r.labelAngle) * r.radius,
      0,
      Math.sin(r.labelAngle) * r.radius,
    ),
  }));

  const tick = (time: number) => {
    for (let i = 0; i < n; i++) {
      const ri = ring[i];
      if (ri < 0) continue;
      const r = rings[ri];
      const a = angle[i] + time * r.speed;
      const radius = r.radius + offR[i];
      const p = place(ri)(Math.cos(a) * radius, offY[i], Math.sin(a) * radius);
      f.pos[i * 3] = p[0];
      f.pos[i * 3 + 1] = p[1];
      f.pos[i * 3 + 2] = p[2];
      // ring tilt * yaw(-a) keeps each block's long axis on the tangent.
      const sy = Math.sin(-a / 2);
      const cy = Math.cos(-a / 2);
      const q = r.quat;
      f.quat[i * 4] = q.x * cy - q.z * sy;
      f.quat[i * 4 + 1] = q.w * sy + q.y * cy;
      f.quat[i * 4 + 2] = q.z * cy + q.x * sy;
      f.quat[i * 4 + 3] = q.w * cy - q.y * sy;
    }
  };
  tick(0);

  return {
    id: "skills",
    ...f,
    groups,
    tilt: tiltOf(0.5, 0, 0.08),
    spin: 0,
    labels: "always",
    fixedAnchors: false,
    guides: new Float32Array(guides),
    tick,
  };
};

/* -------------------------------------------------------------------------- */
/* 03 Reel: one framed title card per project, on a wheel that turns to        */
/* whichever project is in focus.                                              */
/* -------------------------------------------------------------------------- */

const hostOf = (href: string) => {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return "Internal system";
  }
};

const buildReel = (n: number): Formation => {
  const rng = mulberry32(41);
  const f = blank(n);
  const order = shuffled(n, rng);

  const radius = 2.6;
  const step = 0.62;
  const halfW = CARD_WIDTH / 2 + 0.07;
  const halfH = CARD_HEIGHT / 2 + 0.07;
  const perimeter = 4 * (halfW + halfH);
  const shares = allocate(
    n,
    projects.map(() => 1),
  );

  // Neighbours sit a full step apart; cards further round are bunched up so
  // all of them fit on the back of the wheel.
  const angleOf = (offset: number) => {
    const a = Math.abs(offset);
    return Math.sign(offset) * (a <= 2 ? a * step : 2 * step + (a - 2) * 0.28);
  };
  const presenceOf = (offset: number) => {
    const a = Math.abs(offset);
    if (a <= 1) return 1 - 0.45 * a;
    if (a <= 2) return 0.55 - 0.27 * (a - 1);
    return Math.max(0, 0.28 - (a - 2) * 0.5);
  };

  // Each block's place on its card's frame, before the wheel turns it.
  const card = new Int8Array(n);
  const localX = new Float32Array(n);
  const localY = new Float32Array(n);
  const baseScl = new Float32Array(n * 3);

  let k = 0;
  projects.forEach((_, ci) => {
    const count = shares[ci];
    const pitch = perimeter / count;
    for (let b = 0; b < count; b++, k++) {
      const i = order[k];
      let u = (b + 0.5) * pitch;
      let x: number;
      let y: number;
      let flat = true;
      if (u < 2 * halfW) {
        x = -halfW + u;
        y = halfH;
      } else if ((u -= 2 * halfW) < 2 * halfH) {
        x = halfW;
        y = halfH - u;
        flat = false;
      } else if ((u -= 2 * halfH) < 2 * halfW) {
        x = halfW - u;
        y = -halfH;
      } else {
        x = -halfW;
        y = -halfH + (u - 2 * halfW);
        flat = false;
      }
      const bolt = rng() < 0.05;
      const thick = bolt ? 0.14 : 0.06 + rng() * 0.03;
      const length = bolt ? 0.14 : pitch * 0.86;
      card[i] = ci;
      localX[i] = x;
      localY[i] = y;
      baseScl[i * 3] = flat ? length : thick;
      baseScl[i * 3 + 1] = flat ? thick : length;
      baseScl[i * 3 + 2] = thick;
      f.group[i] = ci;
    }
  });

  const cards: Card[] = projects.map((project) => ({
    key: focusKey.project(project.title),
    y: 0,
    z: 0,
    tilt: 0,
    scale: 1,
    presence: 0,
  }));

  let wheel = 0;
  let last = 0;
  const tick = (time: number, focus: number, snap: boolean) => {
    const dt = Math.max(0, Math.min(0.05, time - last));
    last = time;
    const target = focus >= 0 ? focus : Math.round(wheel);
    wheel = snap ? target : wheel + (target - wheel) * (1 - Math.exp(-dt * 5));

    cards.forEach((c, ci) => {
      const offset = ci - wheel;
      c.tilt = angleOf(offset);
      c.y = -radius * Math.sin(c.tilt);
      // Cards are taller than the gap between them, so on a true cylinder
      // their edges would cut through each other. Each step round the wheel
      // also steps back, which keeps every card wholly behind the one before.
      c.z =
        radius * (Math.cos(c.tilt) - 1) - 0.9 * Math.min(3, Math.abs(offset));
      c.scale = 1 - 0.26 * Math.min(1, Math.abs(offset));
      c.presence = presenceOf(offset);
    });

    for (let i = 0; i < n; i++) {
      const c = cards[card[i]];
      const sin = Math.sin(c.tilt);
      const cos = Math.cos(c.tilt);
      const y = localY[i] * c.scale;
      f.pos[i * 3] = localX[i] * c.scale;
      f.pos[i * 3 + 1] = c.y + y * cos;
      f.pos[i * 3 + 2] = c.z + y * sin;
      f.scl[i * 3] = baseScl[i * 3] * c.scale;
      f.scl[i * 3 + 1] = baseScl[i * 3 + 1] * c.scale;
      f.scl[i * 3 + 2] = baseScl[i * 3 + 2] * c.scale;
      f.quat[i * 4] = Math.sin(c.tilt / 2);
      f.quat[i * 4 + 3] = Math.cos(c.tilt / 2);
    }
  };
  tick(0, 0, true);

  // The two rims of the wheel the cards ride on.
  const guides: number[] = [];
  for (const x of [-halfW - 0.3, halfW + 0.3])
    circle(
      guides,
      radius,
      (a, _, b) => [x, b, a - radius] as [number, number, number],
      96,
    );

  return {
    id: "projects",
    ...f,
    groups: projects.map((project) => ({
      key: focusKey.project(project.title),
      label: project.title,
      sub: hostOf(project.href),
      anchor: [-halfW, halfH + 0.16, 0],
    })),
    tilt: tiltOf(0.05, -0.34, 0),
    spin: 0,
    sway: 0.09,
    extent: [2.55, 3],
    labels: "focus",
    fixedAnchors: false,
    guides: new Float32Array(guides),
    cards,
    tick,
  };
};

/* -------------------------------------------------------------------------- */
/* 04 Helix: the career timeline, oldest role at the bottom.                   */
/* -------------------------------------------------------------------------- */

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** Reads "August 2020" as a month count; anything else means today. */
const monthIndex = (value: string) => {
  const [name, year] = value.trim().toLowerCase().split(/\s+/);
  const month = MONTHS.indexOf(name);
  if (month < 0 || !Number(year)) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  return Number(year) * 12 + month;
};

const yearOf = (value: string) => value.match(/\d{4}/)?.[0] ?? "Now";

const buildHelix = (n: number): Formation => {
  const rng = mulberry32(53);
  const f = blank(n);
  const order = shuffled(n, rng);

  const jobs = experience
    .map((job) => ({
      job,
      from: monthIndex(job.startDate),
      to: monthIndex(job.endDate),
    }))
    .sort((a, b) => a.from - b.from);
  const start = jobs[0].from;
  const span = Math.max(1, jobs[jobs.length - 1].to - start);
  const shares = allocate(
    n,
    jobs.map((j) => Math.max(j.to - j.from, span * 0.1)),
  );

  const turns = 2.2;
  const bottom = -2.7;
  const rise = 5.4;
  const radius = 1.5;
  const margin = 0.008;

  const groups: FormationGroup[] = [];
  let k = 0;
  jobs.forEach((j, ji) => {
    const t0 = (j.from - start) / span + margin;
    const t1 = (j.to - start) / span - margin;
    for (let b = 0; b < shares[ji]; b++, k++) {
      const i = order[k];
      const t = t0 + rng() * (t1 - t0);
      const kind = rng();
      let a = t * turns * TAU;
      let r = radius;
      let y = bottom + t * rise;
      let sx = 0.07 + rng() * 0.07;
      let sy = sx;
      let sz = sx * (1.4 + rng() * 2);
      if (kind < 0.56) {
        r += (rng() - 0.5) * 0.5;
        y += (rng() - 0.5) * 0.16;
      } else if (kind < 0.8) {
        a += Math.PI;
        r += (rng() - 0.5) * 0.18;
        sx = sy = 0.04 + rng() * 0.03;
        sz = sx * 2;
      } else {
        // Rungs sit on fixed steps so they read as ladder bars.
        const step = Math.round(t * 64) / 64;
        a = step * turns * TAU;
        y = bottom + step * rise;
        r = (rng() * 2 - 1) * radius * 0.92;
        sx = 0.09;
        sy = 0.025;
        sz = 0.025;
      }
      f.pos[i * 3] = Math.cos(a) * r;
      f.pos[i * 3 + 1] = y;
      f.pos[i * 3 + 2] = Math.sin(a) * r;
      f.scl[i * 3] = sx;
      f.scl[i * 3 + 1] = sy;
      f.scl[i * 3 + 2] = sz;
      f.quat[i * 4 + 1] = Math.sin(-a / 2);
      f.quat[i * 4 + 3] = Math.cos(-a / 2);
      f.group[i] = ji;
    }
    groups.push({
      key: focusKey.job(j.job.company),
      label: j.job.company,
      sub: `${yearOf(j.job.startDate)} to ${yearOf(j.job.endDate)}`,
      anchor: [radius + 0.55, bottom + ((t0 + t1) / 2) * rise, 0],
    });
  });

  const guides: number[] = [0, bottom - 0.4, 0, 0, bottom + rise + 0.4, 0];
  const firstYear = Math.ceil(start / 12);
  const lastYear = Math.floor((start + span) / 12);
  for (let year = firstYear; year <= lastYear; year++) {
    const y = bottom + ((year * 12 - start) / span) * rise;
    guides.push(-0.22, y, 0, 0.22, y, 0, 0, y, -0.22, 0, y, 0.22);
  }

  return {
    id: "experience",
    ...f,
    groups,
    tilt: tiltOf(0.2, 0, -0.1),
    spin: 0.16,
    labels: "always",
    fixedAnchors: true,
    guides: new Float32Array(guides),
  };
};

/* -------------------------------------------------------------------------- */
/* 05 Signal: concentric bars that ripple outwards from the centre.            */
/* -------------------------------------------------------------------------- */

export type SignalFormation = Formation & { pulse: () => void };

const buildSignal = (n: number): SignalFormation => {
  const rng = mulberry32(67);
  const f = blank(n);
  const order = shuffled(n, rng);

  const ringCount = n > 1000 ? 17 : 13;
  const radii = Array.from({ length: ringCount }, (_, j) => 0.3 + j * 0.2);
  const shares = allocate(n, radii);
  const dist = new Float32Array(n);

  let k = 0;
  radii.forEach((r, j) => {
    for (let b = 0; b < shares[j]; b++, k++) {
      const i = order[k];
      const a = (b / shares[j]) * TAU + j * 0.37;
      f.pos[i * 3] = Math.cos(a) * r;
      f.pos[i * 3 + 2] = Math.sin(a) * r;
      f.scl[i * 3] = 0.07;
      f.scl[i * 3 + 2] = 0.11;
      f.quat[i * 4 + 1] = Math.sin(-a / 2);
      f.quat[i * 4 + 3] = Math.cos(-a / 2);
      dist[i] = r;
    }
  });

  const flat = (x: number, y: number, z: number) =>
    [x, y, z] as [number, number, number];
  const guides: number[] = [];
  for (const r of [1.2, 2.3, 3.5]) circle(guides, r, flat, 96);
  guides.push(-3.8, 0, 0, 3.8, 0, 0, 0, 0, -3.8, 0, 0, 3.8);

  let pulsedAt = -Infinity;
  let clock = 0;
  const tick = (time: number) => {
    clock = time;
    const since = time - pulsedAt;
    for (let i = 0; i < n; i++) {
      const r = dist[i];
      let wave = Math.sin(r * 2.6 - time * 1.7) * Math.exp(-r * 0.2);
      // A sent message travels outwards as one tall crest.
      const front = since * 2.4;
      wave +=
        2.2 * Math.exp(-((r - front) ** 2) * 2.5) * Math.exp(-since * 0.5);
      f.pos[i * 3 + 1] = wave * 0.34;
      f.scl[i * 3 + 1] = 0.05 + Math.abs(wave) * 0.42;
    }
  };
  tick(0);

  return {
    id: "contact",
    ...f,
    groups: [],
    tilt: tiltOf(0.92, 0.3, 0),
    spin: 0.05,
    labels: "focus",
    fixedAnchors: true,
    guides: new Float32Array(guides),
    tick,
    pulse: () => {
      pulsedAt = clock;
    },
  };
};

export const buildFormations = (n: number) => {
  const signal = buildSignal(n);
  return {
    home: buildAssembly(n),
    about: buildIsland(n),
    skills: buildOrbits(n),
    projects: buildReel(n),
    experience: buildHelix(n),
    contact: signal as Formation,
    pulse: signal.pulse,
  };
};
