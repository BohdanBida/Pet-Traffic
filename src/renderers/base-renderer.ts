export abstract class Renderer<T = unknown> {
    constructor(protected ctx: CanvasRenderingContext2D) { }

    public abstract draw(payload: T): void
}