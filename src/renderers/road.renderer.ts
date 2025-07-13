import { Injectable } from '@app/core/di';
import {
    CELL_SIZE, INFO_COLOR, INVALID_ROAD_COLOR, ROAD_COLOR,
    ROAD_PAINT_COLOR, ROAD_WIDTH, SUCCESS_COLOR
} from 'constants';
import { IPoint, IRoad } from '@app/models';
import { Renderer } from './base-renderer';

export interface IRoadDrawPayload {
    coordinates: IRoad;
    shadow?: boolean;
    isValid?: boolean;
    activeEnd?: boolean;
    activeStart?: boolean;
}

@Injectable([CanvasRenderingContext2D])
export class RoadRenderer extends Renderer<IRoadDrawPayload> {
    public draw(payload: IRoadDrawPayload): void {
        const { coordinates, shadow = false } = payload;
        const { start, end } = coordinates;

        const adjustedStart = {
            x: start.x * CELL_SIZE + CELL_SIZE / 2,
            y: start.y * CELL_SIZE + CELL_SIZE / 2
        }

        const adjustedEnd = {
            x: end.x * CELL_SIZE + CELL_SIZE / 2,
            y: end.y * CELL_SIZE + CELL_SIZE / 2
        };

        this._drawRoad({
            ...payload,
            coordinates: {
                start: adjustedStart,
                end: adjustedEnd
            },
        });

        this._drawLines(adjustedStart, adjustedEnd);

        if (shadow) {
            this._drawSafeZone(adjustedEnd, Boolean(payload.isValid) && (payload.activeEnd ?? false));

            if (payload.activeStart) {
                this._drawSafeZone(adjustedStart, Boolean(payload.isValid) && (payload.activeStart ?? false));
            }
        }
    }

    private _drawRoad(payload: IRoadDrawPayload): void {
        const { start, end } = payload.coordinates;
        const { isValid = true } = payload;

        const color = this._getRoadColor(isValid);

        if (payload.shadow) {
            this.ctx.globalAlpha = 0.5;
        } else {
            this.ctx.globalAlpha = 1;
        }

        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = ROAD_WIDTH;

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);

        this._drawEnd(start, angle + Math.PI, color);
        this._drawEnd(end, angle, color);

        this.ctx.globalAlpha = 1;
    }

    private _drawLines(a: IPoint, b: IPoint): void {
        this.ctx.strokeStyle = ROAD_PAINT_COLOR;
        this.ctx.lineWidth = 1;
        this.ctx.lineDashOffset = 20;
        this.ctx.setLineDash([CELL_SIZE, CELL_SIZE]);

        const isVertical = a.x === b.x;
        const isDown = a.y > b.y;
        const isRight = a.x > b.x;

        this.ctx.beginPath();

        if (isVertical) {
            const offset = isDown ? CELL_SIZE : -CELL_SIZE;
            this.ctx.moveTo(a.x, a.y - offset);
            this.ctx.lineTo(b.x, b.y + offset);
        } else {
            const offset = isRight ? CELL_SIZE : -CELL_SIZE;
            this.ctx.moveTo(a.x - offset, a.y);
            this.ctx.lineTo(b.x + offset, b.y);
        }

        this.ctx.stroke();

        this.ctx.setLineDash([]);
    }

    private _drawEnd({ x, y }: IPoint, angle: number, color: string): void {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        const radius = ROAD_WIDTH / 4;

        const w = ROAD_WIDTH / 2;
        const h = ROAD_WIDTH;

        this.ctx.fillStyle = color;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(w - radius, -h / 2);
        this.ctx.quadraticCurveTo(w, -h / 2, w, -h / 2 + radius);
        this.ctx.lineTo(w, h / 2 - radius);
        this.ctx.quadraticCurveTo(w, h / 2, w - radius, h / 2);
        this.ctx.lineTo(0, h / 2);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();

        this.ctx.beginPath();
        this.ctx.fillStyle = ROAD_PAINT_COLOR;
        this.ctx.rect(x - 1, y - 1, 2, 2)
        this.ctx.fill();
    }

    private _drawSafeZone(point: IPoint, active: boolean): void {
        this.ctx.strokeStyle = active ?
            SUCCESS_COLOR :
            INFO_COLOR;

        this.ctx.lineDashOffset = 20;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, CELL_SIZE * 4, 0, Math.PI * 2);
        this.ctx.stroke();

        if (active) {
            this.ctx.fillStyle = `rgba(32, 256, 98, 0.1)`;
            this.ctx.fill();
        }

        this.ctx.setLineDash([]);
    }

    private _getRoadColor(isValid: boolean): string {
        return isValid ? ROAD_COLOR : INVALID_ROAD_COLOR;
    }
}