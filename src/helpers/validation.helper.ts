import { CELL_SIZE, MIN_ROAD_DISTANCE, ROAD_WIDTH } from 'constants';
import { IPoint, IRoad, ValidationStatus } from '@app/models';
import { GeometryHelper, RoadHelper } from '@app/helpers';

const VALIDATION_ROAD_WIDTH = ROAD_WIDTH * 2 / CELL_SIZE;

export class ValidationHelper {
    public static validateRoad(start: IPoint, endPoint: IPoint, roads: IRoad[]): ValidationStatus {
        if (!start) {
            return ValidationStatus.Valid;
        }

        const areIntersecting = roads.length ?
            GeometryHelper.lineIsIntersectingWith({
                start: start,
                end: endPoint
            }, roads, VALIDATION_ROAD_WIDTH) : false;

        if (areIntersecting) {
            return ValidationStatus.Intersection;
        }

        const x = endPoint.x * CELL_SIZE;
        const y = endPoint.y * CELL_SIZE;

        if (!RoadHelper.validateCoordinates({ x, y })) {
            return ValidationStatus.InvalidCoordinates;
        }

        if (GeometryHelper.getDistance(start, endPoint) < MIN_ROAD_DISTANCE) {
            return ValidationStatus.TooShort;
        }

        return ValidationStatus.Valid;
    }
}