import { CELL_SIZE } from 'constants';
import { Injectable } from '@app/core/di';
import { AppMode } from '@app/models';
import { State } from '@app/state';
import { DrawService } from './draw.service';
import { Subject, throttleTime } from 'rxjs';

@Injectable([
    State,
    HTMLCanvasElement,
    CanvasRenderingContext2D,
    DrawService,
])
export class MainRenderProcessService {
    private _gridWidth: number;

    private _gridHeight: number;

    private _lastFrameTime: number = performance.now();

    private _fpsSubject$ = new Subject<number>();

    private readonly _fpsDebounceTime = 100;

    constructor(
        private readonly _state: State,
        private readonly _canvas: HTMLCanvasElement,
        private readonly _ctx: CanvasRenderingContext2D,
        private readonly _drawService: DrawService,
    ) {
        this._gridWidth = Math.floor(this._canvas.width / CELL_SIZE);
        this._gridHeight = Math.floor(this._canvas.height / CELL_SIZE);

        this._fpsSubject$
            .pipe(throttleTime(this._fpsDebounceTime))
            .subscribe(fps => this._state.fps$.next(fps));
    }

    public render(currentTime: number = performance.now()) {
        const delta = currentTime - this._lastFrameTime;

        if (delta > 0) {
            const fps = 1000 / delta;
            this._fpsSubject$.next(Math.round(fps));
        }

        this._lastFrameTime = currentTime;

        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        const isEditMode = this._state.mode$.getValue() === AppMode.Edit;

        if (isEditMode) {
            this._drawService.drawGrid(this._gridWidth, this._gridHeight);
        }

        this._drawService.drawRoads();
        this._drawService.drawCrossroads();
        this._drawService.drawCars();

        if (isEditMode) {
            this._drawService.drawUserInput();
        }

        requestAnimationFrame(this.render.bind(this));
    }
}