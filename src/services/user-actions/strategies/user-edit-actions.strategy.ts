import { State } from '@app/state';
import { AbstractUserActionsStrategy } from './abstract-user-actions.strategy';
import { InvalidCoordinatesNotification, NotificationService, RoadIntersectingNotification, RoadTooShortNotification } from '@app/notifications';
import { UserEventsService, UserInputService } from '@app/core/services';
import { IPoint, UserActionEvent, ValidationStatus } from '@app/models';
import { GeometryHelper, RoadHelper, ValidationHelper } from '@app/helpers';
import { CELL_SIZE } from 'constants';


export class UserEditActionsStrategy extends AbstractUserActionsStrategy {
    constructor(
        protected readonly state: State,
        protected readonly canvas: HTMLCanvasElement,
        protected readonly notificationService: NotificationService,
        protected readonly userInputService: UserInputService,
        protected readonly userEventsService: UserEventsService,
    ) {
        super();
    }

    public onMouseDown(e: MouseEvent): void {
        if (e.button !== 0) {
            if (this.state.inProgressRoad) {
                this.state.inProgressRoad = null;
            } else {
                this.state.roads.forEach(road => {
                    if (RoadHelper.isOnRoad(road, this.userInputService.mousePosition!)) {
                        this.userEventsService.sendActionEvent(UserActionEvent.RoadRemoved, road);
                    }
                });
            }

            return;
        }

        this.state.inProgressRoad = RoadHelper.getClosestRoadPoint(this.state.roads, this.userInputService.mousePosition!);
    }

    public onMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const current = {
            x: Math.round(Math.floor(x / CELL_SIZE)),
            y: Math.round(Math.floor(y / CELL_SIZE))
        };

        const closestRoadPoint = RoadHelper.getClosestRoadPoint(this.state.roads, current);

        if (!this.state.inProgressRoad) {
            const currentMousePosition = this.state.adjustByObjectsMode$.getValue() ?
                closestRoadPoint :
                current;

            this.userInputService.mousePosition$.next(currentMousePosition);

            return;
        }

        const endPoint = GeometryHelper.getSecondaryCoordinatesAtRightAngle(this.state.inProgressRoad!, closestRoadPoint);

        this.state.validationStatus = ValidationHelper.validateRoad(this.state.inProgressRoad!, endPoint, this.state.roads);

        this.userInputService.mousePosition$.next(endPoint);
    }

    public onMouseUp(): void {
        const mousePosition = this.userInputService.mousePosition;

        if (!this.state.inProgressRoad || !mousePosition) {
            this.state.inProgressRoad = null;

            return;
        }

        const endCoords = GeometryHelper.getSecondaryCoordinatesAtRightAngle(this.state.inProgressRoad!, mousePosition!);

        if (GeometryHelper.isSameCoordinates(this.state.inProgressRoad, endCoords)) {
            this.state.inProgressRoad = null;

            return;
        }

        if (this.state.validationStatus !== ValidationStatus.Valid) {
            this._handleValidationStatus(this.state.validationStatus, endCoords);
            this.state.inProgressRoad = null;

            return;
        }

        this.userEventsService.sendActionEvent(UserActionEvent.RoadAdded, { start: this.state.inProgressRoad, end: endCoords });
    }

    private _handleValidationStatus(status: ValidationStatus, endCoords: IPoint): void {
        const distance = GeometryHelper.getDistance(this.state.inProgressRoad!, endCoords);

        switch (status) {
            case ValidationStatus.Intersection:
                this.notificationService.add(new RoadIntersectingNotification());
                break;
            case ValidationStatus.TooShort:
                this.notificationService.add(new RoadTooShortNotification(distance));
                break;
            case ValidationStatus.InvalidCoordinates:
                this.notificationService.add(new InvalidCoordinatesNotification());
                break;
        }
    }
}