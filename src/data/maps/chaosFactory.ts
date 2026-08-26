import type { EntityLinearMotion, MapEntity } from '../../types/MapEntity.type';
import type { StageDef } from '../maps';

const COLORS = {
  rail: '#35d8ff',
  fast: '#ff9f43',
  safe: '#36e0b5',
  peg: '#ffe66d',
  mover: '#cf70ff',
  finish: '#65f58b',
  hub: '#f7f7ff',
} as const;

const props = (restitution = 0.1, angularVelocity = 0) => ({ density: 1, restitution, angularVelocity });

function rail(points: [number, number][], color: string = COLORS.rail): MapEntity {
  return {
    position: { x: 0, y: 0 },
    type: 'static',
    shape: { type: 'polyline', points, rotation: 0, color, bloomColor: color },
    props: props(0.08),
  };
}

function box(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  color: string,
  options: {
    type?: 'static' | 'kinematic';
    restitution?: number;
    angularVelocity?: number;
    linearMotion?: EntityLinearMotion;
  } = {}
): MapEntity {
  return {
    position: { x, y },
    type: options.type ?? 'static',
    shape: { type: 'box', width, height, rotation, color, bloomColor: color },
    props: props(options.restitution ?? 0.12, options.angularVelocity ?? 0),
    linearMotion: options.linearMotion,
  };
}

function peg(x: number, y: number, radius = 0.32, color: string = COLORS.peg): MapEntity {
  return {
    position: { x, y },
    type: 'static',
    shape: { type: 'circle', radius, color, bloomColor: color },
    props: props(0.82),
  };
}

const pegs: MapEntity[] = [];
const pegRows = [
  { y: 74, xs: [10, 13, 16] },
  { y: 78, xs: [8.5, 11.5, 14.5, 17.5] },
  { y: 82, xs: [10, 13, 16] },
  { y: 86, xs: [8.5, 11.5, 14.5, 17.5] },
  { y: 90, xs: [10, 13, 16] },
];

for (const row of pegRows) {
  for (const x of row.xs) pegs.push(peg(x, row.y));
}

const spinnerArms: MapEntity[] = [0, Math.PI / 3, (Math.PI * 2) / 3].map((rotation) =>
  box(13, 27, 3.15, 0.16, rotation, COLORS.fast, {
    type: 'kinematic',
    restitution: 0.28,
    angularVelocity: 2.2,
  })
);

export const chaosFactoryStage: StageDef = {
  title: 'Chaos Factory',
  goalY: 132.5,
  zoomY: 125.5,
  spawnJitterX: 0.065,
  antiStuck: {
    delayMs: 4000,
    horizontalImpulse: 0.16,
    downwardImpulse: 0.18,
  },
  entities: [
    // Continuous outer walls and the opening funnel.
    rail([
      [2, -300],
      [2, 9],
      [5, 16],
      [7.5, 20],
      [5.4, 28],
      [6.8, 35],
      [3.2, 39],
      [3.2, 61],
      [7.5, 69],
      [7.5, 72],
      [5.5, 94],
      [5.5, 114],
      [12.55, 126],
      [12.55, 133.5],
    ]),
    rail([
      [24, -300],
      [24, 9],
      [21, 16],
      [18.5, 20],
      [20.6, 28],
      [19.2, 35],
      [23, 39],
      [23, 61],
      [18.5, 69],
      [18.5, 72],
      [20.5, 94],
      [20.5, 114],
      [13.45, 126],
      [13.45, 133.5],
    ]),

    // Funnel accents and protected six-arm windmill.
    rail(
      [
        [5.1, 15.8],
        [8.2, 17.5],
        [9.3, 20.5],
      ],
      COLORS.hub
    ),
    rail(
      [
        [20.9, 15.8],
        [17.8, 17.5],
        [16.7, 20.5],
      ],
      COLORS.hub
    ),
    ...spinnerArms,
    peg(13, 27, 0.42, COLORS.hub),

    // Y splitter. Orange is the short, volatile route; teal is the long, stable route.
    rail(
      [
        [14, 34.8],
        [11.5, 40],
        [11.2, 58.5],
        [13, 65],
      ],
      COLORS.fast
    ),
    rail(
      [
        [14, 34.8],
        [15.3, 40],
        [14.8, 58.5],
        [13, 65],
      ],
      COLORS.safe
    ),
    box(7.2, 45.5, 1.85, 0.15, 0.18, COLORS.fast, {
      type: 'kinematic',
      restitution: 0.28,
      angularVelocity: -3.1,
    }),
    box(7.4, 55, 1.55, 0.14, -0.3, COLORS.fast, {
      type: 'kinematic',
      restitution: 0.24,
      angularVelocity: 2.7,
    }),
    peg(5.2, 50, 0.4, COLORS.fast),
    peg(9.5, 50.8, 0.4, COLORS.fast),
    rail(
      [
        [15.2, 42],
        [20.2, 46],
        [16.1, 51],
        [20.4, 56],
        [15.1, 61],
      ],
      COLORS.safe
    ),
    peg(17.4, 59.5, 0.34, COLORS.safe),

    // Rejoin and compact pachinko field.
    rail(
      [
        [3.2, 61],
        [8.8, 68.5],
        [8.8, 70.5],
      ],
      COLORS.fast
    ),
    rail(
      [
        [23, 61],
        [17.2, 68.5],
        [17.2, 70.5],
      ],
      COLORS.safe
    ),
    ...pegs,

    // Three staggered, physically moving gates. No position fully seals the corridor.
    box(9.7, 98.5, 2.4, 0.18, 0, COLORS.mover, {
      type: 'kinematic',
      restitution: 0.2,
      linearMotion: { axis: 'x', distance: 0.9, speed: 2.0, phase: 0 },
    }),
    box(16.3, 104.5, 2.4, 0.18, 0, COLORS.mover, {
      type: 'kinematic',
      restitution: 0.2,
      linearMotion: { axis: 'x', distance: 0.9, speed: 2.3, phase: 0.5 },
    }),
    box(13, 110.5, 3.0, 0.18, 0, COLORS.mover, {
      type: 'kinematic',
      restitution: 0.2,
      linearMotion: { axis: 'x', distance: 2.0, speed: 2.6, phase: 0.25 },
    }),

    // Asymmetric anti-arch lips before the glowing final funnel.
    box(10.2, 117.3, 1.2, 0.14, 0.16, COLORS.finish, { restitution: 0.1 }),
    box(15.9, 118.4, 1.1, 0.14, -0.2, COLORS.finish, { restitution: 0.1 }),
    rail(
      [
        [5.5, 114],
        [9.5, 119],
        [12.55, 126],
        [12.55, 133.5],
      ],
      COLORS.finish
    ),
    rail(
      [
        [20.5, 114],
        [16.7, 120],
        [13.45, 126],
        [13.45, 133.5],
      ],
      COLORS.finish
    ),
  ],
};
