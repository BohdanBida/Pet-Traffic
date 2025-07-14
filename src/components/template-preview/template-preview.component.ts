import { Component } from 'components/component';
import { ITemplateData, IRoad } from '@app/models';
import { CELL_SIZE } from '@app/constants';

const SIZE_FACTOR = 1.5;
const OFFSET = CELL_SIZE * 3;

export class TemplatePreviewComponent extends Component {
    constructor(private _data: ITemplateData) {
        super();
    }

    protected createElement(): HTMLCanvasElement {
        const width = 192;
        const height = 192;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.classList.add('select-example-image');

        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;

        const roads = this._data.state.roads || [];

        roads.forEach((road: IRoad) => {
            const { x: x1, y: y1 } = road.start;
            const { x: x2, y: y2 } = road.end;

            ctx.beginPath();
            ctx.moveTo(x1 * SIZE_FACTOR + OFFSET, y1 * SIZE_FACTOR + OFFSET);
            ctx.lineTo(x2 * SIZE_FACTOR + OFFSET, y2 * SIZE_FACTOR + OFFSET);
            ctx.stroke();
        });

        return canvas;
    }

}