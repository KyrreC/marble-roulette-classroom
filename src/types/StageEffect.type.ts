import type { VectorLike } from './VectorLike';

export type DirectionalBurstDef = {
  type: 'directionalBurst';
  position: VectorLike;
  width: number;
  height: number;
  impulse: VectorLike;
  intervalMs: number;
  phaseMs?: number;
  warningMs: number;
  burstMs?: number;
  warningColor: string;
  burstColor: string;
};

export type StageEffectDef = DirectionalBurstDef;

export type DirectionalBurstDebugState = {
  state: 'idle' | 'warning' | 'firing';
  cycle: number;
  lastAffectedCount: number;
  totalAffectedCount: number;
};
