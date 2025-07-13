import { Injectable } from '@app/core/di';
import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, CELL_SIZE } from 'constants';
import { ISize } from '@app/models';
import { Renderer } from './base-renderer';

@Injectable([CanvasRenderingContext2D])
export class GridRenderer extends Renderer<ISize> {
    public draw({ width, height }: ISize): void {
        this.ctx.strokeStyle = '#cccccca0';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= width; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * CELL_SIZE, 0);
            this.ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT_PX);
            this.ctx.stroke();
        }

        for (let j = 0; j <= height; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * CELL_SIZE);
            this.ctx.lineTo(CANVAS_WIDTH_PX, j * CELL_SIZE);
            this.ctx.stroke();
        }
    }
}