import { Injectable } from '@app/core/di';
import { CELL_SIZE, ROAD_COLOR, ROAD_PAINT_COLOR, ROAD_WIDTH, TRAFFIC_LIGHT_COLORS } from 'constants';
import { ICrossRoad } from '@app/models';
import { Renderer } from './base-renderer';

interface ILightStackOptions {
    baseX: number;
    baseY: number;
    isHorizontal: boolean;
    inverse?: boolean;
    styleOptions: ILightStackStyleOptions;
    activeId: number;
}
interface ILightStackStyleOptions {
    lightWidth: number;
    lightHeight: number;
    gap: number;
}

// TODO: Refactor this
@Injectable([CanvasRenderingContext2D])
export class CrossRoadRenderer extends Renderer<ICrossRoad> {
    public draw(payload: ICrossRoad): void {
        const x = payload.x * CELL_SIZE + CELL_SIZE / 2;
        const y = payload.y * CELL_SIZE + CELL_SIZE / 2;

        this.ctx.fillStyle = ROAD_COLOR;
        const size = ROAD_WIDTH + CELL_SIZE / 2;
        this.ctx.beginPath();
        this.ctx.roundRect(x - size / 2, y - size / 2, size, size, CELL_SIZE);
        this.ctx.fill();

        this.ctx.fillStyle = 'white';
        this.ctx.font = `${CELL_SIZE * 1.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(String(payload.number), x, y);

        this._drawTrafficLights(payload, x, y, size);
    }

    private _drawTrafficLights(payload: ICrossRoad, baseX: number, baseY: number, size: number): void {
        const lightHeight = CELL_SIZE / 2;

        const styleOptions: ILightStackStyleOptions = {
            lightHeight,
            lightWidth: CELL_SIZE,
            gap: CELL_SIZE / 2,
        }

        const { horizontalLightId = 2, verticalLightId = 2 } = payload;

        // === TOP SIDE ===
        if (payload.connectedSides.top) {
            this._drawLightStack({
                baseX,
                baseY: baseY - size - lightHeight / 2,
                isHorizontal: true,
                inverse: true,
                styleOptions,
                activeId: verticalLightId,
            });
        }

        // === BOTTOM SIDE ===
        if (payload.connectedSides.bottom) {
            this._drawLightStack({
                baseX,
                baseY: baseY + size + lightHeight / 2 - lightHeight,
                isHorizontal: true,
                styleOptions,
                activeId: verticalLightId,
            });
        }

        // === LEFT SIDE ===
        if (payload.connectedSides.left) {
            this._drawLightStack({
                baseX: baseX - size - lightHeight / 2,
                baseY,
                isHorizontal: false,
                styleOptions,
                activeId: horizontalLightId,
            });
        }

        // === RIGHT SIDE ===
        if (payload.connectedSides.right) {
            this._drawLightStack({
                baseX: baseX + size + lightHeight / 2 - lightHeight,
                baseY,
                isHorizontal: false,
                inverse: true,
                styleOptions,
                activeId: horizontalLightId,
            });
        }

    }

    private _drawLightStack(options: ILightStackOptions): void {
        const { baseX, baseY, isHorizontal, inverse, activeId } = options;
        const { lightWidth, lightHeight, gap } = options.styleOptions;

        const totalLength = TRAFFIC_LIGHT_COLORS.length * (lightWidth + gap) - gap;
        const colors = inverse ? [...TRAFFIC_LIGHT_COLORS].reverse() : TRAFFIC_LIGHT_COLORS;
        const adjustedActiveId = inverse ? colors.length - 1 - activeId : activeId;

        this._drawCrosswalk(baseX, baseY, isHorizontal, totalLength, CELL_SIZE, inverse);
        this._drawLineUnderLights(baseX, baseY, isHorizontal, totalLength, CELL_SIZE, inverse);

        Promise.resolve().then(() => {

            this.ctx.strokeStyle = '#111';
            this.ctx.lineWidth = 2;

            this.ctx.strokeRect(
                isHorizontal ? baseX - totalLength / 2 + (lightWidth + gap) - 12 : baseX,
                isHorizontal ? baseY : baseY - totalLength / 2 + (lightWidth + gap) - 12,
                isHorizontal ? lightWidth * 4 : lightHeight,
                isHorizontal ? lightHeight : lightWidth * 4,
            );

            for (let i = 0; i < colors.length; i++) {
                const color = colors[i][i === adjustedActiveId ? 0 : 1];
                this.ctx.fillStyle = color;
                this.ctx.strokeStyle = '#111';
                this.ctx.lineWidth = 1;

                // Set glow
                if (adjustedActiveId === i) {
                    this.ctx.shadowColor = color;
                    this.ctx.shadowBlur = CELL_SIZE;
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                }

                if (isHorizontal) {
                    this.ctx.fillRect(
                        baseX - totalLength / 2 + i * (lightWidth + gap),
                        baseY,
                        lightWidth,
                        lightHeight
                    );
                } else {
                    this.ctx.fillRect(
                        baseX,
                        baseY - totalLength / 2 + i * (lightWidth + gap),
                        lightHeight,
                        lightWidth
                    );
                }

                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
            }
        });
    }

    private _drawCrosswalk(
        baseX: number,
        baseY: number,
        isHorizontal: boolean,
        length: number,
        width: number,
        inverse: boolean = false,
    ): void {
        const sign = (isHorizontal !== inverse) ? -1 : 1;
        const offset = sign * width * 1.25 + CELL_SIZE / 4;

        this.ctx.setLineDash([1, 2]);
        this.ctx.strokeStyle = ROAD_PAINT_COLOR;
        this.ctx.fillStyle = ROAD_COLOR;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();

        const backgroundSize = ROAD_WIDTH;

        if (isHorizontal) {
            this.ctx.fillRect(baseX - length / 2, baseY + offset - backgroundSize / 2, length, backgroundSize);
            this.ctx.moveTo(baseX - length / 2, baseY + offset);
            this.ctx.lineTo(baseX + length / 2, baseY + offset);
        } else {
            this.ctx.fillRect(baseX + offset - backgroundSize / 2, baseY - length / 2, backgroundSize, length);
            this.ctx.moveTo(baseX + offset, baseY - length / 2);
            this.ctx.lineTo(baseX + offset, baseY + length / 2);
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    private _drawLineUnderLights(
        baseX: number,
        baseY: number,
        isHorizontal: boolean,
        length: number,
        width: number,
        inverse: boolean = false,
    ): void {
        const sign = (isHorizontal !== inverse) ? 1 : -1;
        const offset = sign * width + CELL_SIZE / 4;

        this.ctx.strokeStyle = ROAD_PAINT_COLOR;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        if (isHorizontal) {
            this.ctx.moveTo(baseX - length / 2, baseY + offset);
            this.ctx.lineTo(baseX + length / 2, baseY + offset);
        } else {
            this.ctx.moveTo(baseX + offset, baseY - length / 2);
            this.ctx.lineTo(baseX + offset, baseY + length / 2);
        }

        this.ctx.stroke();
    }
}