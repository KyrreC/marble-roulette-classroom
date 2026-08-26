import type { EntityLinearMotion, MapEntity } from '../../types/MapEntity.type';
import type { StageDef } from '../maps';

const COLORS = {
  rail: '#54c7ff',
  spring: '#ff5da8',
  springAccent: '#ffe36e',
  shortcut: '#ff8a4c',
  safe: '#5de0a6',
  gate: '#b47cff',
  finish: '#76f28b',
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

function peg(x: number, y: number, radius = 0.36, color: string = COLORS.springAccent): MapEntity {
  return {
    position: { x, y },
    type: 'static',
    shape: { type: 'circle', radius, color, bloomColor: color },
    props: props(0.9),
  };
}

function springPad(x: number, y: number, rotation: number, width = 2.6): MapEntity {
  return box(x, y, width, 0.2, rotation, COLORS.spring, { restitution: 1.12 });
}

const gateArms: MapEntity[] = [0, Math.PI / 2].map((rotation) =>
  box(13, 101, 2.8, 0.16, rotation, COLORS.gate, {
    type: 'kinematic',
    restitution: 0.3,
    angularVelocity: 1.8,
  })
);

export const springCanyonStage: StageDef = {
  title: 'Spring Canyon',
  goalY: 136,
  zoomY: 129,
  spawnJitterX: 0.075,
  antiStuck: {
    delayMs: 4000,
    horizontalImpulse: 0.17,
    downwardImpulse: 0.26,
  },
  entities: [
    // Guarded canyon walls and opening funnel.
    rail([
      [2, -300],
      [2, 9],
      [4.3, 15],
      [6.2, 19],
      [4.2, 29],
      [3.2, 37],
      [3.2, 86],
      [4.2, 94],
      [3.8, 108],
      [6.2, 116],
      [10.8, 128],
      [12.55, 133],
      [12.55, 137],
    ]),
    rail([
      [24, -300],
      [24, 9],
      [21.7, 15],
      [19.8, 19],
      [21.8, 29],
      [22.8, 37],
      [22.8, 86],
      [21.8, 94],
      [22.2, 108],
      [19.8, 116],
      [15.2, 128],
      [13.45, 133],
      [13.45, 137],
    ]),

    // Alternating high-restitution pads create the canyon's spring rhythm.
    springPad(8.4, 24, -0.18, 2.1),
    springPad(17.8, 35, 0.18, 2.7),
    springPad(9.2, 46, -0.16, 2.5),
    peg(15.2, 27.8, 0.42),
    peg(11.2, 39.8, 0.42),
    peg(16, 49.2, 0.42),

    // A rounded splitter sends marbles toward the short orange launch or green switchbacks.
    peg(13, 56.5, 0.52, COLORS.hub),
    rail(
      [
        [12.5, 57],
        [10.2, 63],
        [10.2, 82],
        [12.7, 90],
      ],
      COLORS.shortcut
    ),
    rail(
      [
        [13.5, 57],
        [15.8, 63],
        [15.8, 82],
        [13.3, 90],
      ],
      COLORS.safe
    ),

    // Short route: stronger launches and a rotating blocker make it fast but volatile.
    springPad(6.7, 65.5, -0.12, 2.25),
    box(7, 75, 1.8, 0.15, 0.08, COLORS.shortcut, {
      type: 'kinematic',
      restitution: 0.35,
      angularVelocity: -2.5,
    }),
    springPad(7.6, 84, 0.14, 1.8),

    // Safe route: wider alternating rails trade speed for predictable progress.
    rail(
      [
        [16.1, 64],
        [20.4, 68],
        [17, 73.5],
        [20.5, 79],
        [16.2, 85],
      ],
      COLORS.safe
    ),
    peg(19.5, 87, 0.34, COLORS.safe),

    // Rejoin lips keep arrivals away from the outer-wall corners.
    rail(
      [
        [3.2, 86],
        [8.5, 93],
        [10, 95],
      ],
      COLORS.shortcut
    ),
    rail(
      [
        [22.8, 86],
        [17.5, 93],
        [16, 95],
      ],
      COLORS.safe
    ),

    // A physical rotating gate and offset bumpers reshuffle the merged pack.
    ...gateArms,
    peg(8.5, 106.5),
    peg(11.5, 110),
    peg(14.5, 107),
    peg(17.5, 111),
    box(13, 115.2, 2.6, 0.16, 0, COLORS.gate, {
      type: 'kinematic',
      restitution: 0.24,
      linearMotion: { axis: 'x', distance: 2.1, speed: 2.2, phase: 0.25 },
    }),

    // Narrow glowing chute allows congestion and late overtakes without sealing the exit.
    rail(
      [
        [6.2, 116],
        [9.2, 121],
        [10.8, 128],
        [12.55, 133],
        [12.55, 137],
      ],
      COLORS.finish
    ),
    rail(
      [
        [19.8, 116],
        [16.8, 121],
        [15.2, 128],
        [13.45, 133],
        [13.45, 137],
      ],
      COLORS.finish
    ),
  ],
};
