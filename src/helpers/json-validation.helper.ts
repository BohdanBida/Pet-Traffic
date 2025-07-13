import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, CELL_SIZE, MIN_MARGIN_TO_BOUNDARY } from '@app/constants';

export class JsonValidationHelper {
    public static validate(json: any): void {
        if (!json || typeof json !== 'object') {
            throw new Error('Invalid JSON format');
        }

        if (!('name' in json) || !('state' in json)) {
            throw new Error('JSON must contain "name" and "state" properties');
        }

        if (typeof json.name !== 'string' || typeof json.state !== 'object') {
            throw new Error('Invalid data types in JSON. "name" must be a string and "state" must be an object');
        }

        if (!Array.isArray(json.state.roads) || json.state.roads.length === 0) {
            throw new Error('"state" must contain a non-empty array of "roads"');
        }

        json.state.roads.forEach((road: any, index: number) => JsonValidationHelper._validateRoad(road, index));
    }

    private static _validateRoad(road: any, index: number): void {
        if (!('id' in road) || !('start' in road) || !('end' in road)) {
            throw new Error('Invalid data. Each road must have id, end, and start properties');
        }

        if (typeof road.id !== 'string' || typeof road.start !== 'object' || typeof road.end !== 'object') {
            throw new Error(`Invalid data types in road at index ${index}`);
        }

        if (!('x' in road.start) || !('y' in road.start) || !('x' in road.end) || !('y' in road.end)) {
            throw new Error(`Invalid data. Start and end points must have x and y properties in road at index ${index}`);
        }

        JsonValidationHelper._validatePoint(road.start, index, 'start');
        JsonValidationHelper._validatePoint(road.end, index, 'end');
    }

    private static _validatePoint(point: any, index: number, propertyName: string): void {
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
            throw new Error(`Invalid coordinates in road.${propertyName} at index ${index}`);
        }

        const margin = MIN_MARGIN_TO_BOUNDARY / CELL_SIZE;

        if (
            point.x < margin || point.x > (CANVAS_WIDTH_PX - margin) ||
            point.y < margin || point.y > (CANVAS_HEIGHT_PX - margin)
        ) {
            throw new Error(`Coordinates in road.${propertyName} at index ${index} are out of bounds`);
        }
    }
}