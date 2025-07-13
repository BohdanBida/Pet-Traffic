import { Injectable } from '@app/core/di';
import { UserInputService } from '@app/core/services';
import { IRoad, ValidationStatus } from '@app/models';
import { CarRenderer, CrossRoadRenderer, GridRenderer, RoadRenderer, TipsRenderer, TurnsRenderer } from '@app/renderers';
import { State } from '@app/state';

@Injectable([
    State,
    UserInputService,
    RoadRenderer,
    GridRenderer,
    CrossRoadRenderer,
    TurnsRenderer,
    CarRenderer,
    TipsRenderer,
])
export class DrawService {
    constructor(
        private readonly _state: State,
        private readonly _userInputService: UserInputService,
        private readonly _roadRenderer: RoadRenderer,
        private readonly _gridRenderer: GridRenderer,
        private readonly _crossRoadRenderer: CrossRoadRenderer,
        private readonly _turnsRenderer: TurnsRenderer,
        private readonly _carRenderer: CarRenderer,
        private readonly _tipsRenderer: TipsRenderer,
    ) { }

    public drawGrid(width: number, height: number): void {
        this._gridRenderer.draw({
            width,
            height,
        });
    }

    public drawRoads(): void {
        for (const road of this._state.roads) {
            this._roadRenderer.draw({
                coordinates: road,
                shadow: false,
            });
        }
    }

    public drawCrossroads(): void {
        for (const crossRoad of this._state.crossroads) {
            this._crossRoadRenderer.draw(crossRoad);
        }

        for (const turn of this._state.turns) {
            this._turnsRenderer.draw(turn);
        }
    }

    public drawCars(): void {
        for (const car of this._state.cars) {
            this._carRenderer.draw(car);
        }
    }

    public drawUserInput(): void {
        const end = this._userInputService.mousePosition;
        const start = this._state.inProgressRoad;

        if (!end) {
            return;
        }

        if (start) {
            const isNewCrossRoadAtStart = this._state.roads.some((road: IRoad) => {
                return road.start.x === start.x && road.start.y === start.y ||
                    road.end.x === start.x && road.end.y === start.y;
            });

            const isNewCrossRoadAtEnd = this._state.roads.some((road: IRoad) => {
                return road.start.x === end.x && road.start.y === end.y ||
                    road.end.x === end.x && road.end.y === end.y;
            });

            this._roadRenderer.draw({
                coordinates: { start, end },
                shadow: true,
                activeEnd: isNewCrossRoadAtEnd,
                activeStart: isNewCrossRoadAtStart,
                isValid: this._state.validationStatus === ValidationStatus.Valid,
            });
        }

        if (this._state.adjustByObjectsMode$.getValue()) {
            this._tipsRenderer.draw(end);
        }
    }
}