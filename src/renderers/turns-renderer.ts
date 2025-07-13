import { Injectable } from '@app/core/di';
import { CELL_SIZE, ROAD_COLOR, ROAD_PAINT_COLOR, ROAD_WIDTH } from 'constants';
import { CrossRoadAngle, IPoint, ITurn } from '@app/models';
import { Renderer } from './base-renderer';

@Injectable([CanvasRenderingContext2D])
export class TurnsRenderer extends Renderer<IPoint> {
    public draw(payload: ITurn): void {
        const x = payload.x * CELL_SIZE + CELL_SIZE / 2;
        const y = payload.y * CELL_SIZE + CELL_SIZE / 2;

        this.ctx.fillStyle = ROAD_COLOR;
        const size = ROAD_WIDTH;
        this.ctx.beginPath();
        this.ctx.roundRect(x - size / 2, y - size / 2, size, size, CELL_SIZE * 1.5);
        this.ctx.fill();
        this._drawLines(payload.angle, x, y);
    }

    private _drawLines(angle: CrossRoadAngle, x: number, y: number): void {
        this.ctx.strokeStyle = ROAD_PAINT_COLOR;
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        const length = CELL_SIZE / 1.5;

        switch (angle) {
            case CrossRoadAngle.LeftTop:
                this.ctx.moveTo(x - 1, y);
                this.ctx.lineTo(x + length, y);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(x, y + length);
                this.ctx.lineTo(x, y + 1);

                break;
            case CrossRoadAngle.RightTop:
                this.ctx.moveTo(x, y - 1);
                this.ctx.lineTo(x, y + length);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(x - length, y);
                this.ctx.lineTo(x - 1, y);

                break;
            case CrossRoadAngle.LeftBottom:
                this.ctx.moveTo(x + length, y);
                this.ctx.lineTo(x - 1, y);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(x, y - 1);
                this.ctx.lineTo(x, y - length);

                break;
            case CrossRoadAngle.RightBottom:
                this.ctx.moveTo(x - length, y);
                this.ctx.lineTo(x - 1, y);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(x, y + 1);
                this.ctx.lineTo(x, y - length);

                break;
        }

        this.ctx.stroke();
    }
}