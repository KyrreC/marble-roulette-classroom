/**
 * Classroom builds intentionally keep marble names local. Upstream keyword
 * sprites require a third-party lookup, so this compatible service is a no-op.
 */
export class KeywordService {
  async init(): Promise<void> {}

  destroy(): void {}

  getSprite(_marbleName: string): CanvasImageSource | undefined {
    return undefined;
  }
}
