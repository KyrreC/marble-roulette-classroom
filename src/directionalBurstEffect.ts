import type { GameObject } from './gameObject';
import type { ColorTheme } from './types/ColorTheme';
import type { DirectionalBurstDebugState, DirectionalBurstDef } from './types/StageEffect.type';

const DEFAULT_BURST_MS = 180;

export class DirectionalBurstEffect implements GameObject {
  isDestroy = false;

  private elapsedMs = 0;
  private firingRemainingMs = 0;
  private cycle = 0;
  private lastAffectedCount = 0;
  private totalAffectedCount = 0;

  constructor(
    private readonly definition: DirectionalBurstDef,
    private readonly onFire: (definition: DirectionalBurstDef) => number
  ) {}

  update(deltaTime: number): void {
    const previousClock = this.elapsedMs + (this.definition.phaseMs ?? 0);
    this.elapsedMs += deltaTime;
    const currentClock = this.elapsedMs + (this.definition.phaseMs ?? 0);
    const previousCycle = Math.floor(previousClock / this.definition.intervalMs);
    const currentCycle = Math.floor(currentClock / this.definition.intervalMs);

    if (currentCycle > previousCycle) {
      this.cycle = currentCycle;
      this.lastAffectedCount = this.onFire(this.definition);
      this.totalAffectedCount += this.lastAffectedCount;
      this.firingRemainingMs = this.definition.burstMs ?? DEFAULT_BURST_MS;
    } else {
      this.firingRemainingMs = Math.max(0, this.firingRemainingMs - deltaTime);
    }
  }

  render(ctx: CanvasRenderingContext2D, zoom: number, _theme: ColorTheme): void {
    const state = this.getState();
    if (state === 'idle') return;

    const { position, width, height, impulse, warningColor, burstColor } = this.definition;
    const magnitude = Math.hypot(impulse.x, impulse.y) || 1;
    const directionX = impulse.x / magnitude;
    const directionY = impulse.y / magnitude;
    const color = state === 'firing' ? burstColor : warningColor;
    const cycleElapsed = this.getCycleElapsed();
    const warningProgress = Math.max(
      0,
      Math.min(1, (cycleElapsed - (this.definition.intervalMs - this.definition.warningMs)) / this.definition.warningMs)
    );

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(0.04, 1.5 / zoom);
    ctx.shadowColor = color;
    ctx.shadowBlur = state === 'firing' ? 18 : 8 + warningProgress * 10;

    if (state === 'firing') {
      ctx.globalAlpha = 0.1;
      ctx.fillRect(position.x - width / 2, position.y - height / 2, width, height);
    }
    ctx.globalAlpha = state === 'firing' ? 0.85 : 0.2 + warningProgress * 0.22;
    ctx.setLineDash(state === 'firing' ? [] : [0.35, 0.28]);
    ctx.strokeRect(position.x - width / 2, position.y - height / 2, width, height);
    ctx.setLineDash([]);

    const mouthX = position.x - directionX * width * 0.48;
    const mouthY = position.y - directionY * height * 0.48;
    ctx.beginPath();
    ctx.arc(mouthX, mouthY, state === 'firing' ? 0.8 : 0.35 + warningProgress * 0.28, 0, Math.PI * 2);
    ctx.fill();

    if (state === 'firing') {
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      ctx.lineTo(
        mouthX + directionX * Math.max(width, height) * 0.8,
        mouthY + directionY * Math.max(width, height) * 0.8
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  getDebugState(): DirectionalBurstDebugState {
    return {
      state: this.getState(),
      cycle: this.cycle,
      lastAffectedCount: this.lastAffectedCount,
      totalAffectedCount: this.totalAffectedCount,
    };
  }

  private getCycleElapsed(): number {
    return (this.elapsedMs + (this.definition.phaseMs ?? 0)) % this.definition.intervalMs;
  }

  private getState(): DirectionalBurstDebugState['state'] {
    if (this.firingRemainingMs > 0) return 'firing';
    return this.getCycleElapsed() >= this.definition.intervalMs - this.definition.warningMs ? 'warning' : 'idle';
  }
}
