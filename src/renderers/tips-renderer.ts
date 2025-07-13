import { Injectable } from '@app/core/di';
import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, CELL_SIZE, INFO_COLOR, MIN_ROAD_DISTANCE } from 'constants';
import { IPoint } from '@app/models';
import { Renderer } from './base-renderer';

@Injectable([CanvasRenderingContext2D])
export class TipsRenderer extends Renderer<IPoint> {
    public draw(point: IPoint): void {
        const x = point.x * CELL_SIZE + CELL_SIZE / 2;
        const y = point.y * CELL_SIZE + CELL_SIZE / 2;

        this.ctx.strokeStyle = INFO_COLOR;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        this._drawCross(x, y, 2);

        this.ctx.beginPath();

        const restrictedRadius = MIN_ROAD_DISTANCE * CELL_SIZE;

        this.ctx.arc(x, y, restrictedRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        for (let i = 1; i < CANVAS_WIDTH_PX / CELL_SIZE / MIN_ROAD_DISTANCE - 1; i++) {
            this._drawCross(x + restrictedRadius * i, y);
            this._drawCross(x, y + restrictedRadius * i);
            this._drawCross(x - restrictedRadius * i, y);
            this._drawCross(x, y - restrictedRadius * i);
        }

        this.ctx.setLineDash([]);
    }

    private _drawCross(x: number, y: number, width: number = 1): void {
        this.ctx.lineWidth = width;

        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(CANVAS_WIDTH_PX, y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, CANVAS_HEIGHT_PX);
        this.ctx.stroke();
    }
}