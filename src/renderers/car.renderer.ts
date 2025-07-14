import { Injectable } from '@app/core/di';
import { CELL_SIZE } from 'constants';
import { Car } from '@app/models';
import { Renderer } from './base-renderer';

const STOP_LIGHT_THRESHOLD = 0.025;

@Injectable([CanvasRenderingContext2D])
export class CarRenderer extends Renderer<Car> {
    public draw(car: Car): void {
        const { color, x, y, angle, targetSpeed, velocity, waiting } = car;
        const width = CELL_SIZE;
        const height = CELL_SIZE * 2.5;

        this.ctx.save();

        this.ctx.translate(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);

        this.ctx.rotate(angle);
        this.ctx.rotate(-Math.PI / 2);

        const windowWidth = width - 2;
        const windowX = -width / 2 + 1;

        if ((targetSpeed + STOP_LIGHT_THRESHOLD) < velocity || waiting || car.velocity === 0) {
            this._drawLights(windowX, -height / 2, '#FF0000', 3);
        }

        this._drawLights(windowX, height / 2 - 1, '#FFFFFFA0', 2);

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        this.ctx.fillStyle = '#222';

        this.ctx.fillRect(windowX, -height / 2 + 3, windowWidth, CELL_SIZE / 4);
        this.ctx.fillRect(windowX, height / 11, windowWidth, CELL_SIZE / 3);

        this.ctx.restore();
    }

    private _drawLights(x: number, y: number, color: string, brightnessFactor: number): void {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Combine shadows to increase brightness
        for (let i = 0; i <= brightnessFactor; i++) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x - 0.5, y, 7, 1);
        }

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
}