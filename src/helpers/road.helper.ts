import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, CELL_SIZE, MIN_MARGIN_TO_BOUNDARY } from 'constants';
import { IPoint, IRoad, ICrossRoadSet } from '@app/models';
import { GeometryHelper } from '@app/helpers';

type CrossRoadMapType = Map<
    string,
    { point: IPoint; roadIds: Set<string>; angle?: number }
>;

export class RoadHelper {
    public static getClosestRoadPoint(roads: IRoad[], coords: IPoint): IPoint {
        const threshold = CELL_SIZE;
        let isCloseToStart = false;
        let isCloseToEnd = false;

        const closestRoad = roads.find((road: IRoad) => {
            isCloseToStart = Math.abs(road.start.x - coords.x) <= threshold && Math.abs(road.start.y - coords.y) <= threshold;
            isCloseToEnd = Math.abs(road.end.x - coords.x) <= threshold && Math.abs(road.end.y - coords.y) <= threshold;

            return isCloseToStart || isCloseToEnd;
        });

        if (!closestRoad) {
            return coords;
        }

        if (isCloseToStart) {
            return closestRoad.start;
        } else if (isCloseToEnd) {
            return closestRoad.end;
        }

        return coords;
    }

    public static validateCoordinates(coords: IPoint): boolean {
        const { x, y } = coords;

        return x >= MIN_MARGIN_TO_BOUNDARY &&
            y >= MIN_MARGIN_TO_BOUNDARY &&
            x <= (CANVAS_WIDTH_PX - MIN_MARGIN_TO_BOUNDARY) &&
            y <= (CANVAS_HEIGHT_PX - MIN_MARGIN_TO_BOUNDARY);
    }

    public static isOnRoad(road: IRoad, { x, y }: IPoint): boolean {
        const a = road.start.x < x && road.end.x > x && (road.start.y + CELL_SIZE / 2) > y && (road.end.y - CELL_SIZE / 2) < y;
        const b = road.start.x > x && road.end.x < x && (road.start.y + CELL_SIZE / 2) > y && (road.end.y - CELL_SIZE / 2) < y;
        const c = road.start.y < y && road.end.y > y && (road.start.x + CELL_SIZE / 2) > x && (road.end.x - CELL_SIZE / 2) < x;
        const d = road.start.y > y && road.end.y < y && (road.start.x + CELL_SIZE / 2) > x && (road.end.x - CELL_SIZE / 2) < x;

        return a || b || c || d;
    }

    public static getCrossRoads(roads: IRoad[]): ICrossRoadSet {
        const crossroadsMap: CrossRoadMapType = new Map<
            string,
            { point: IPoint; roadIds: Set<string>; angle?: number }
        >();

        for (let road of roads) {
            for (let otherRoad of roads) {
                if (!road.id || !otherRoad.id || road.id === otherRoad.id) continue;

                if (GeometryHelper.linesAreParallel(road, otherRoad)) continue;

                const checks: IPoint[] = [];

                if (GeometryHelper.isSameCoordinates(road.start, otherRoad.start)) {
                    checks.push(road.start);
                }
                if (GeometryHelper.isSameCoordinates(road.start, otherRoad.end)) {
                    checks.push(road.start);
                }
                if (GeometryHelper.isSameCoordinates(road.end, otherRoad.start)) {
                    checks.push(road.end);
                }
                if (GeometryHelper.isSameCoordinates(road.end, otherRoad.end)) {
                    checks.push(road.end);
                }

                for (const point of checks) {
                    const key = `${point.x},${point.y}`;
                    if (!crossroadsMap.has(key)) {
                        crossroadsMap.set(key, {
                            point,
                            roadIds: new Set<string>(),
                        });
                    }

                    crossroadsMap.get(key)!.roadIds.add(road.id);
                    crossroadsMap.get(key)!.roadIds.add(otherRoad.id);

                    // Only set angle if it’s not set yet
                    if (crossroadsMap.get(key)!.angle === undefined) {
                        crossroadsMap.get(key)!.angle = GeometryHelper.getCrossAngle(
                            road, otherRoad, point
                        );
                    }
                }
            }
        }

        return this._buildCrossRoadSet(crossroadsMap, roads);
    }

    private static _buildCrossRoadSet(data: CrossRoadMapType, roads: IRoad[]): ICrossRoadSet {
        const result: ICrossRoadSet = {
            turns: [],
            crossroads: [],
        };

        for (const { point, roadIds, angle } of data.values()) {
            if (roadIds.size > 2) {
                const connectedSides = {
                    top: false,
                    bottom: false,
                    left: false,
                    right: false,
                };

                for (const road of roads) {
                    if (!road.id || !roadIds.has(road.id)) continue;

                    let otherPoint: IPoint | null = null;

                    if (GeometryHelper.isSameCoordinates(point, road.start)) {
                        otherPoint = road.end;
                    } else if (GeometryHelper.isSameCoordinates(point, road.end)) {
                        otherPoint = road.start;
                    }

                    if (otherPoint) {
                        const dx = otherPoint.x - point.x;
                        const dy = otherPoint.y - point.y;

                        if (dy < 0) connectedSides.top = true;
                        if (dy > 0) connectedSides.bottom = true;
                        if (dx < 0) connectedSides.left = true;
                        if (dx > 0) connectedSides.right = true;
                    }
                }

                result.crossroads.push({
                    x: point.x,
                    y: point.y,
                    connectedSides,
                    number: result.crossroads.length + 1,
                });

            } else if (angle) {
                result.turns.push({
                    x: point.x,
                    y: point.y,
                    angle
                });
            }
        }

        return result;
    }
}