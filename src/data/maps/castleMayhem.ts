import type { EntityLinearMotion, MapEntity } from '../../types/MapEntity.type';
import type { StageDef } from '../maps';

const COLORS = {
  stone: '#58c9ff',
  gold: '#ffd65c',
  shield: '#ff6fae',
  gate: '#b985ff',
  hammer: '#ff8a4c',
  stair: '#55e0a4',
  courtyard: '#72efff',
  crown: '#fff176',
  hub: '#f8f7ff',
} as const;

const props = (restitution = 0.1, angularVelocity = 0) => ({ density: 1, restitution, angularVelocity });

function rail(points: [number, number][], color: string = COLORS.stone): MapEntity {
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

function peg(x: number, y: number, radius = 0.35, color: string = COLORS.courtyard, restitution = 0.82): MapEntity {
  return {
    position: { x, y },
    type: 'static',
    shape: { type: 'circle', radius, color, bloomColor: color },
    props: props(restitution),
  };
}

function spinner(x: number, y: number, width: number, speed: number, color: string, restitution = 0.25): MapEntity {
  return box(x, y, width, 0.16, 0, color, {
    type: 'kinematic',
    angularVelocity: speed,
    restitution,
  });
}

const drawbridges: MapEntity[] = [
  spinner(7.4, 25, 6.2, 0.72, COLORS.gold, 0.18),
  spinner(18.6, 25, 6.2, -0.67, COLORS.gold, 0.18),
];

const pendulums: MapEntity[] = [
  spinner(7.2, 37, 5.4, 1.18, COLORS.gate, 0.24),
  spinner(13, 44, 7.2, -1.32, COLORS.gate, 0.3),
  spinner(18.8, 51, 5.4, 1.08, COLORS.gate, 0.24),
];

const crossGuard: MapEntity[] = [0, Math.PI / 2].map((rotation) =>
  box(13, 60, 6.8, 0.17, rotation, COLORS.gate, {
    type: 'kinematic',
    angularVelocity: 1.45,
    restitution: 0.28,
  })
);

const shieldField: MapEntity[] = [
  peg(8, 70, 0.52, COLORS.shield, 0.98),
  peg(13, 73.5, 0.58, COLORS.gold, 1.02),
  peg(18, 70, 0.52, COLORS.shield, 0.98),
  peg(10.5, 79, 0.48, COLORS.gold, 0.95),
  peg(15.5, 79, 0.48, COLORS.gold, 0.95),
  box(6.4, 84.5, 1.75, 0.18, -0.18, COLORS.shield, { restitution: 0.88 }),
  box(19.6, 84.5, 1.75, 0.18, 0.18, COLORS.shield, { restitution: 0.88 }),
];

const portcullises: MapEntity[] = [
  box(7.2, 94, 7, 0.18, 0.16, COLORS.gold, {
    type: 'kinematic',
    restitution: 0.16,
    linearMotion: { axis: 'y', distance: 1.3, speed: 1.45, phase: 0 },
  }),
  box(18.8, 94, 7, 0.18, -0.16, COLORS.gold, {
    type: 'kinematic',
    restitution: 0.16,
    linearMotion: { axis: 'y', distance: 1.3, speed: 1.45, phase: 0.5 },
  }),
];

const rollers: MapEntity[] = [
  spinner(6.3, 105, 3.5, 2.2, COLORS.gold, 0.2),
  spinner(11, 110, 3.5, -2.35, COLORS.gate, 0.2),
  spinner(15.5, 105, 3.5, 2.05, COLORS.gold, 0.2),
  spinner(19.7, 112, 3.5, -2.2, COLORS.gate, 0.2),
  spinner(8.3, 118, 3.5, -2.0, COLORS.gate, 0.2),
  spinner(14, 119, 3.5, 2.3, COLORS.gold, 0.2),
];

const squeezeWalls: MapEntity[] = [
  box(7.2, 130, 0.2, 4.2, 0, COLORS.stone, {
    type: 'kinematic',
    restitution: 0.1,
    linearMotion: { axis: 'x', distance: 1.35, speed: 1.3, phase: 0 },
  }),
  box(18.8, 130, 0.2, 4.2, 0, COLORS.stone, {
    type: 'kinematic',
    restitution: 0.1,
    linearMotion: { axis: 'x', distance: 1.35, speed: 1.3, phase: 0.5 },
  }),
];

const leftHammers: MapEntity[] = [
  spinner(6.5, 150, 4.6, -1.8, COLORS.hammer, 0.32),
  spinner(8.2, 159.5, 4.4, 2.0, COLORS.hammer, 0.34),
];

const rightStairs: MapEntity[] = [
  spinner(18, 148, 3.8, 1.35, COLORS.stair, 0.2),
  spinner(19.2, 156, 3.6, -1.5, COLORS.stair, 0.2),
  spinner(17.5, 163, 3.6, 1.6, COLORS.stair, 0.2),
];

const courtyardPegs: MapEntity[] = [];
for (const row of [
  { y: 177, xs: [8, 13, 18] },
  { y: 182, xs: [6, 10.5, 15.5, 20] },
  { y: 187, xs: [8, 13, 18] },
]) {
  for (const x of row.xs) courtyardPegs.push(peg(x, row.y));
}

const slidingGates: MapEntity[] = [
  box(8.2, 195, 8.4, 0.18, 0.13, COLORS.gate, {
    type: 'kinematic',
    restitution: 0.18,
    linearMotion: { axis: 'x', distance: 1.2, speed: 1.8, phase: 0 },
  }),
  box(17.8, 202, 8.4, 0.18, -0.13, COLORS.gate, {
    type: 'kinematic',
    restitution: 0.18,
    linearMotion: { axis: 'x', distance: 1.2, speed: 2.0, phase: 0.5 },
  }),
  box(13, 209, 7.6, 0.18, 0.16, COLORS.gate, {
    type: 'kinematic',
    restitution: 0.2,
    linearMotion: { axis: 'x', distance: 2.4, speed: 2.25, phase: 0.25 },
  }),
];

const crownGate: MapEntity[] = [0, Math.PI / 2].map((rotation) =>
  box(13, 216.5, 6.8, 0.17, rotation, COLORS.crown, {
    type: 'kinematic',
    angularVelocity: -1.65,
    restitution: 0.24,
  })
);

export const castleMayhemStage: StageDef = {
  title: 'Castle Mayhem',
  goalY: 233,
  zoomY: 226,
  spawnJitterX: 0.08,
  antiStuck: {
    delayMs: 2800,
    horizontalImpulse: 0.26,
    downwardImpulse: 0.38,
  },
  entities: [
    // Full-height guarded walls and the castle entrance funnel.
    rail([
      [2, -300],
      [2, 9],
      [4.3, 15],
      [5.4, 20],
      [3.2, 30],
      [3.2, 166],
      [4.2, 171],
      [3.2, 211],
      [6.2, 219],
      [10.8, 227],
      [12.55, 231],
      [12.55, 234],
    ]),
    rail([
      [24, -300],
      [24, 9],
      [21.7, 15],
      [20.6, 20],
      [22.8, 30],
      [22.8, 166],
      [21.8, 171],
      [22.8, 211],
      [19.8, 219],
      [15.2, 227],
      [13.45, 231],
      [13.45, 234],
    ]),

    // Drawbridges, pendulums, and the cross guard create a continuous opening gauntlet.
    ...drawbridges,
    peg(13, 27, 0.42, COLORS.hub, 0.4),
    ...pendulums,
    ...crossGuard,
    peg(13, 60, 0.4, COLORS.hub, 0.3),

    // Bright shields and paired rising gates reshuffle and briefly bunch the pack.
    ...shieldField,
    ...portcullises,

    // Alternating rollers feed into a wide, impossible-to-close squeezing corridor.
    ...rollers,
    ...squeezeWalls,
    peg(13, 137.5, 0.55, COLORS.hub, 0.45),

    // Central tower splits the pack around two distinct but similarly long routes.
    rail(
      [
        [12.5, 138],
        [10.4, 145],
        [10.4, 162],
        [12.7, 169],
      ],
      COLORS.hammer
    ),
    rail(
      [
        [13.5, 138],
        [15.6, 145],
        [15.6, 162],
        [13.3, 169],
      ],
      COLORS.stair
    ),
    ...leftHammers,
    ...rightStairs,
    rail(
      [
        [3.2, 166],
        [7.5, 171.5],
        [9.7, 173.5],
      ],
      COLORS.hammer
    ),
    rail(
      [
        [22.8, 166],
        [18.5, 171.5],
        [16.3, 173.5],
      ],
      COLORS.stair
    ),

    // The courtyard rejoins both routes before three offset sliding gates.
    ...courtyardPegs,
    ...slidingGates,

    // Crown gate and open funnel create a final contest without sealing the exit.
    ...crownGate,
    peg(13, 216.5, 0.42, COLORS.hub, 0.3),
    rail(
      [
        [3.2, 211],
        [6.2, 219],
        [10.8, 227],
        [12.55, 231],
        [12.55, 234],
      ],
      COLORS.crown
    ),
    rail(
      [
        [22.8, 211],
        [19.8, 219],
        [15.2, 227],
        [13.45, 231],
        [13.45, 234],
      ],
      COLORS.crown
    ),
  ],
};
