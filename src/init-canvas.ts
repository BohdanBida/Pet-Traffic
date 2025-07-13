import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from './constants';
import { Injector } from './core/di/injector';

export function initCanvas() {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    canvas.id = 'canvas';
    canvas.width = CANVAS_WIDTH_PX;
    canvas.height = CANVAS_HEIGHT_PX;
    canvas.style.width = `${CANVAS_WIDTH_PX}px`;
    canvas.style.height = `${CANVAS_HEIGHT_PX}px`;

    const ctx = canvas.getContext('2d')!;

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    Injector.override(HTMLCanvasElement, canvas);
    Injector.override(CanvasRenderingContext2D, ctx);
}