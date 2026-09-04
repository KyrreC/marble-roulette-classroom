import type { MapEntity } from '../../types/MapEntity.type';
import type { StageDef } from '../maps';

const COLORS = {
  wood: '#f09a55',
  gold: '#ffd45c',
  water: '#43d9e6',
  danger: '#ff6f69',
  rope: '#d8b47a',
  hull: '#6bb6ff',
  cannonball: '#e9f4ff',
  dock: '#8df0ba',
  hub: '#fff7d6',
} as const;

const props = (restitution = 0.12, angularVelocity = 0) => ({ density: 1, restitution, angularVelocity });

function rail(points: [number, number][], color: string = COLORS.wood): MapEntity {
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
  options: { type?: 'static' | 'kinematic'; restitution?: number; angularVelocity?: number } = {}
): MapEntity {
  return {
    position: { x, y },
    type: options.type ?? 'static',
    shape: { type: 'box', width, height, rotation, color, bloomColor: color },
    props: props(options.restitution ?? 0.12, options.angularVelocity ?? 0),
  };
}

function peg(x: number, y: number, radius = 0.42, color: string = COLORS.cannonball, restitution = 0.82): MapEntity {
  return {
    position: { x, y },
    type: 'static',
    shape: { type: 'circle', radius, color, bloomColor: color },
    props: props(restitution),
  };
}

function rotor(
  x: number,
  y: number,
  halfLength: number,
  armPairs: number,
  speed: number,
  color: string,
  restitution = 0.25,
  thickness = 0.14
): MapEntity[] {
  return Array.from({ length: armPairs }, (_, index) =>
    box(x, y, halfLength, thickness, (index * Math.PI) / armPairs, color, {
      type: 'kinematic',
      restitution,
      angularVelocity: speed,
    })
  );
}

function hub(x: number, y: number, radius = 0.36): MapEntity {
  return peg(x, y, radius, COLORS.hub, 0.25);
}

const counterHelms = [
  ...rotor(7.2, 24, 4.1, 3, 1.12, COLORS.gold, 0.3),
  ...rotor(18.8, 24, 4.1, 3, -0.98, COLORS.gold, 0.3),
  hub(7.2, 24),
  hub(18.8, 24),
];

const barrelRack: MapEntity[] = [
  ...rotor(6.1, 35, 3.0, 1, 1.75, COLORS.wood, 0.22, 0.34),
  ...rotor(12.9, 39, 3.2, 1, -1.9, COLORS.wood, 0.22, 0.34),
  ...rotor(19.5, 35, 3.0, 1, 1.7, COLORS.wood, 0.22, 0.34),
  ...rotor(8.9, 46, 3.1, 1, -1.82, COLORS.wood, 0.22, 0.34),
  ...rotor(16.6, 46, 3.1, 1, 1.9, COLORS.wood, 0.22, 0.34),
];

const oarBeaters: MapEntity[] = [
  box(7.1, 54, 4.7, 0.12, 0, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: 2.3,
    restitution: 0.34,
  }),
  box(18.8, 60, 4.5, 0.12, Math.PI / 5, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: -2.65,
    restitution: 0.34,
  }),
  box(11.7, 66, 4.9, 0.12, -Math.PI / 6, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: 2.45,
    restitution: 0.34,
  }),
];

const capstan = [...rotor(13, 75, 5.4, 3, 0.88, COLORS.gold, 0.28, 0.16), hub(13, 75, 0.48)];

const firstSplit = [...rotor(13, 83, 3.1, 2, -1.55, COLORS.hull, 0.25), hub(13, 83)];

const cabinAnchors: MapEntity[] = [
  box(6.7, 94, 3.0, 0.16, 0, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: -1.85,
    restitution: 0.34,
  }),
  box(8.1, 104, 2.8, 0.16, Math.PI / 3, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: 2.1,
    restitution: 0.34,
  }),
];

const hullPaddles = [
  ...rotor(18.5, 95, 2.7, 3, 1.25, COLORS.water, 0.24),
  ...rotor(19.2, 105, 2.5, 3, -1.42, COLORS.water, 0.24),
  hub(18.5, 95),
  hub(19.2, 105),
];

const rejoinMixer = [...rotor(13, 115, 5.0, 2, 1.35, COLORS.gold, 0.3), hub(13, 115)];

const chainPinwheels: MapEntity[] = [
  ...rotor(7, 124, 2.35, 2, 2.35, COLORS.rope, 0.3, 0.1),
  ...rotor(12.2, 129, 2.4, 2, -2.55, COLORS.rope, 0.3, 0.1),
  ...rotor(18.4, 124, 2.35, 2, 2.2, COLORS.rope, 0.3, 0.1),
  ...rotor(8.8, 136, 2.35, 2, -2.4, COLORS.rope, 0.3, 0.1),
  ...rotor(16.2, 136, 2.35, 2, 2.6, COLORS.rope, 0.3, 0.1),
];

const doubleWaterwheel = [
  ...rotor(9.2, 147, 4.25, 3, 1.12, COLORS.water, 0.3),
  ...rotor(16.8, 157, 4.25, 3, -1.28, COLORS.water, 0.3),
  hub(9.2, 147, 0.44),
  hub(16.8, 157, 0.44),
];

const anchorArray: MapEntity[] = [
  box(6.7, 166, 4.3, 0.15, 0, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: 1.52,
    restitution: 0.32,
  }),
  box(18.5, 176, 4.8, 0.15, Math.PI / 4, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: -1.18,
    restitution: 0.3,
  }),
  box(9.7, 185, 4.1, 0.15, -Math.PI / 5, COLORS.danger, {
    type: 'kinematic',
    angularVelocity: 1.72,
    restitution: 0.32,
  }),
];

const mastCarousel = [...rotor(13, 195, 6.6, 3, -0.68, COLORS.gold, 0.22, 0.18), hub(13, 195, 0.52)];

const cannonballDeck: MapEntity[] = [
  peg(7, 205, 0.58, COLORS.cannonball, 0.9),
  peg(13, 208.5, 0.62, COLORS.gold, 0.92),
  peg(19, 205, 0.58, COLORS.cannonball, 0.9),
  peg(9.7, 214, 0.5, COLORS.cannonball, 0.86),
  peg(16.3, 214, 0.5, COLORS.cannonball, 0.86),
  box(4.8, 217, 2.2, 0.13, 0.16, COLORS.wood, { restitution: 0.6 }),
  box(21.2, 217, 2.2, 0.13, -0.16, COLORS.wood, { restitution: 0.6 }),
];

const secondSplit = [...rotor(13, 223, 3.2, 2, 1.62, COLORS.hull, 0.28), hub(13, 223)];

const stormRudders = [
  ...rotor(6.4, 233, 1.9, 2, 2.8, COLORS.danger, 0.34, 0.11),
  ...rotor(8.2, 240, 1.8, 2, -3.05, COLORS.danger, 0.34, 0.11),
  ...rotor(6.3, 247, 1.9, 2, 2.65, COLORS.danger, 0.34, 0.11),
];

const dockCranes: MapEntity[] = [
  box(18.5, 235, 3.5, 0.16, 0, COLORS.rope, {
    type: 'kinematic',
    angularVelocity: -1.08,
    restitution: 0.25,
  }),
  box(18.2, 245, 3.2, 0.16, Math.PI / 3, COLORS.rope, {
    type: 'kinematic',
    angularVelocity: 1.22,
    restitution: 0.25,
  }),
];

const harborPropellers = [
  ...rotor(6.5, 263, 3.0, 2, 1.95, COLORS.water, 0.32),
  ...rotor(13, 267, 3.5, 3, -1.55, COLORS.water, 0.32),
  ...rotor(19.5, 263, 3.0, 2, 2.1, COLORS.water, 0.32),
  hub(6.5, 263),
  hub(13, 267),
  hub(19.5, 263),
];

const cannonLoader = [...rotor(13, 254, 3.3, 2, -1.25, COLORS.danger, 0.28), hub(13, 254, 0.42)];

const whirlpool = [...rotor(13, 276, 5.6, 4, 0.62, COLORS.gold, 0.2, 0.13), hub(13, 276, 0.58)];

export const pirateAdventureHarborStage: StageDef = {
  title: 'Pirate Adventure Harbor',
  goalY: 289,
  zoomY: 284,
  spawnJitterX: 0.09,
  antiStuck: {
    delayMs: 2700,
    horizontalImpulse: 0.24,
    downwardImpulse: 0.36,
  },
  effects: [
    {
      type: 'directionalBurst',
      position: { x: 13, y: 254 },
      width: 18,
      height: 14,
      impulse: { x: 1.15, y: 0.28 },
      intervalMs: 1800,
      warningMs: 500,
      burstMs: 220,
      warningColor: '#ffe66d',
      burstColor: '#fff4b0',
    },
  ],
  entities: [
    // Continuous harbor walls and the boarding funnel.
    rail([
      [2, -300],
      [2, 10],
      [4.2, 17],
      [3.1, 30],
      [3.1, 82],
      [2.8, 108],
      [7.5, 114],
      [3.1, 120],
      [3.1, 222],
      [2.8, 248],
      [6.7, 254],
      [3.1, 259],
      [3.1, 278],
      [8.2, 283],
      [12.5, 287],
      [12.5, 290],
    ]),
    rail([
      [24, -300],
      [24, 10],
      [21.8, 17],
      [22.9, 30],
      [22.9, 82],
      [23.2, 108],
      [18.5, 114],
      [22.9, 120],
      [22.9, 222],
      [23.2, 248],
      [19.3, 254],
      [22.9, 259],
      [22.9, 278],
      [17.8, 283],
      [13.5, 287],
      [13.5, 290],
    ]),

    // Upper-deck rotating gauntlet.
    ...counterHelms,
    ...barrelRack,
    ...oarBeaters,
    ...capstan,

    // First split: stronger cabin anchors versus steadier hull paddle wheels.
    ...firstSplit,
    rail(
      [
        [12.5, 82],
        [10.6, 89],
        [10.6, 106],
        [12.5, 113],
      ],
      COLORS.danger
    ),
    rail(
      [
        [13.5, 82],
        [15.4, 89],
        [15.4, 106],
        [13.5, 113],
      ],
      COLORS.water
    ),
    ...cabinAnchors,
    ...hullPaddles,
    ...rejoinMixer,

    // Central harbor machinery builds toward the mast carousel.
    ...chainPinwheels,
    ...doubleWaterwheel,
    ...anchorArray,
    ...mastCarousel,
    ...cannonballDeck,

    // Second split: fast storm rudders versus slower dock cranes.
    ...secondSplit,
    rail(
      [
        [12.5, 222],
        [10.7, 229],
        [10.7, 245],
        [12.5, 251],
      ],
      COLORS.danger
    ),
    rail(
      [
        [13.5, 222],
        [15.3, 229],
        [15.3, 245],
        [13.5, 251],
      ],
      COLORS.rope
    ),
    ...stormRudders,
    ...dockCranes,

    // The cannon mouth is physical scenery; the warned burst is configured above.
    box(3.8, 254, 1.2, 0.34, 0, COLORS.danger, { restitution: 0.12 }),
    peg(5.1, 254, 0.5, COLORS.gold, 0.4),
    ...cannonLoader,
    ...harborPropellers,
    ...whirlpool,

    // Bright dock funnel leaves a full marble-width exit below the whirlpool.
    rail(
      [
        [3.1, 278],
        [8.2, 283],
        [12.5, 287],
        [12.5, 290],
      ],
      COLORS.dock
    ),
    rail(
      [
        [22.9, 278],
        [17.8, 283],
        [13.5, 287],
        [13.5, 290],
      ],
      COLORS.dock
    ),
  ],
};
