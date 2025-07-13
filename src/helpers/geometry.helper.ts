import { CrossRoadAngle, IPoint, ILine } from '@app/models';

export class GeometryHelper {
    public static isSameCoordinates(a: IPoint, b: IPoint): boolean {
        return a.x === b.x && a.y === b.y;
    }

    public static getDistance(a: IPoint, b: IPoint): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    public static getSecondaryCoordinatesAtRightAngle(start: IPoint, target: IPoint): IPoint {
        const diffX = Math.abs(target.x - start.x);
        const diffY = Math.abs(target.y - start.y);

        return {
            x: diffX < diffY ? start.x : target.x,
            y: diffX < diffY ? target.y : start.y
        };
    }

    public static lineIsIntersectingWith(target: ILine, list: ILine[], lineWidth: number = 0): boolean {
        return list.some((road: ILine) => GeometryHelper.linesAreIntersecting(target, road, lineWidth));
    }

    public static linesAreIntersecting(a: ILine, b: ILine, lineWidth: number = 0): boolean {
        const { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } } = a;
        const { start: { x: x3, y: y3 }, end: { x: x4, y: y4 } } = b;

        const pointsAreEqual = [
            [a.start, b.start],
            [a.start, b.end],
            [a.end, b.start],
            [a.end, b.end],
        ].some(([pointA, pointB]) => GeometryHelper.pointsEqual(pointA, pointB));

        if (pointsAreEqual) {
            return GeometryHelper.linesAreOverlapped(a, b);
        }

        const o1 = GeometryHelper.orientation(x1, y1, x2, y2, x3, y3);
        const o2 = GeometryHelper.orientation(x1, y1, x2, y2, x4, y4);
        const o3 = GeometryHelper.orientation(x3, y3, x4, y4, x1, y1);
        const o4 = GeometryHelper.orientation(x3, y3, x4, y4, x2, y2);

        if (o1 !== o2 && o3 !== o4) {
            return true;
        }

        if (o1 === 0 && GeometryHelper.onSegment(x1, y1, x2, y2, x3, y3)) return true;
        if (o2 === 0 && GeometryHelper.onSegment(x1, y1, x2, y2, x4, y4)) return true;
        if (o3 === 0 && GeometryHelper.onSegment(x3, y3, x4, y4, x1, y1)) return true;
        if (o4 === 0 && GeometryHelper.onSegment(x3, y3, x4, y4, x2, y2)) return true;

        const threshold = lineWidth / 2;

        if (
            GeometryHelper.pointToSegmentDistance(a.start, b) <= threshold ||
            GeometryHelper.pointToSegmentDistance(a.end, b) <= threshold ||
            GeometryHelper.pointToSegmentDistance(b.start, a) <= threshold ||
            GeometryHelper.pointToSegmentDistance(b.end, a) <= threshold
        ) {
            return true;
        }

        return false; // No intersection, not even within width
    }

    public static linesAreOverlapped(a: ILine, b: ILine): boolean {
        const isHorizontal = a.start.y === a.end.y && b.start.y === b.end.y;
        const isVertical = a.start.x === a.end.x && b.start.x === b.end.x;

        if (isHorizontal) {
            // Must be on same Y
            if (a.start.y !== b.start.y) return false;

            const [aMin, aMax] = [Math.min(a.start.x, a.end.x), Math.max(a.start.x, a.end.x)];
            const [bMin, bMax] = [Math.min(b.start.x, b.end.x), Math.max(b.start.x, b.end.x)];

            return (bMin <= aMin && aMax <= bMax) || (aMin <= bMin && bMax <= aMax);
        }

        if (isVertical) {
            // Must be on same X
            if (a.start.x !== b.start.x) return false;

            const [aMin, aMax] = [Math.min(a.start.y, a.end.y), Math.max(a.start.y, a.end.y)];
            const [bMin, bMax] = [Math.min(b.start.y, b.end.y), Math.max(b.start.y, b.end.y)];

            return (bMin <= aMin && aMax <= bMax) || (aMin <= bMin && bMax <= aMax);
        }

        // Not axis-aligned same way - not valid
        return false;
    }

    public static orientation(px: number, py: number, qx: number, qy: number, rx: number, ry: number): number {
        const val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);

        if (val === 0) return 0;  // colinear

        return val > 0 ? 1 : 2; // clock or counterclock wise
    }

    public static onSegment(px: number, py: number, qx: number, qy: number, rx: number, ry: number): boolean {
        return (
            rx <= Math.max(px, qx) && rx >= Math.min(px, qx) &&
            ry <= Math.max(py, qy) && ry >= Math.min(py, qy)
        );
    }

    public static pointToSegmentDistance(p: IPoint, line: ILine): number {
        const { x: px, y: py } = p;
        const { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } } = line;

        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx === 0 && dy === 0) {
            // The segment is a point
            return Math.hypot(px - x1, py - y1);
        }

        // Project point onto line, clamped to segment
        const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
        const tClamped = Math.max(0, Math.min(1, t));

        const closestX = x1 + tClamped * dx;
        const closestY = y1 + tClamped * dy;

        return Math.hypot(px - closestX, py - closestY);
    }

    public static pointsEqual(a: IPoint, b: IPoint): boolean {
        return a.x === b.x && a.y === b.y;
    }

    public static linesAreParallel(a: ILine, b: ILine): boolean {
        const dx1 = a.end.x - a.start.x;
        const dy1 = a.end.y - a.start.y;

        const dx2 = b.end.x - b.start.x;
        const dy2 = b.end.y - b.start.y;

        return dx1 * dy2 - dy1 * dx2 === 0;
    }

    public static getCrossAngle(
        road1: ILine,
        road2: ILine,
        point: IPoint
    ): CrossRoadAngle | undefined {
        const dir1 = GeometryHelper.getDirectionAtPoint(road1, point);
        const dir2 = GeometryHelper.getDirectionAtPoint(road2, point);

        let vertical: 'tb' | 'bt' | null = null;
        let horizontal: 'lr' | 'rl' | null = null;

        for (const dir of [dir1, dir2]) {
            if (Math.abs(dir.dy) >= Math.abs(dir.dx)) {
                vertical = dir.dy > 0 ? 'tb' : 'bt';
            } else {
                horizontal = dir.dx > 0 ? 'lr' : 'rl';
            }
        }

        if (vertical === 'tb' && horizontal === 'lr') return CrossRoadAngle.LeftTop;
        if (vertical === 'tb' && horizontal === 'rl') return CrossRoadAngle.RightTop;
        if (vertical === 'bt' && horizontal === 'lr') return CrossRoadAngle.LeftBottom;
        if (vertical === 'bt' && horizontal === 'rl') return CrossRoadAngle.RightBottom;

        return undefined;
    }

    public static getDirectionAtPoint(
        road: ILine,
        point: IPoint
    ): { dx: number; dy: number } {
        if (GeometryHelper.isSameCoordinates(road.start, point)) {
            return {
                dx: road.end.x - road.start.x,
                dy: road.end.y - road.start.y,
            };
        } else {
            return {
                dx: road.start.x - road.end.x,
                dy: road.start.y - road.end.y,
            };
        }
    }
}