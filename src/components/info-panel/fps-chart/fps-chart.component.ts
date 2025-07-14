import { Component } from '../../component';

export class FpsChartComponent extends Component<HTMLCanvasElement> {
    private _fpsHistory: number[] = [];

    private readonly _maxPoints = 15;

    private readonly _maxFps = 200;

    constructor(
        private readonly _width: number,
        private readonly _height: number
    ) {
        super();
    }

    protected createElement(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this._width;
        canvas.height = this._height;
        canvas.classList.add('fps-chart-canvas');
        return canvas;
    }

    public update(fps: number): void {
        this._fpsHistory.push(fps);
        if (this._fpsHistory.length > this._maxPoints) {
            this._fpsHistory.shift();
        }

        this._draw();
    }

    private _draw(): void {
        const canvas = this.getElement();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, this._width, this._height);

        ctx.beginPath();
        ctx.moveTo(0, this._height - this._normalize(this._fpsHistory[0], this._height));

        for (let index = 1; index < this._fpsHistory.length; index++) {
            const x = (index / (this._maxPoints - 1)) * this._width;
            const y = this._height - this._normalize(this._fpsHistory[index], this._height);
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    private _normalize(fps: number, height: number): number {
        return Math.min(fps, this._maxFps) / this._maxFps * height;
    }
}
