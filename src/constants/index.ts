import { IDropdownOption, NotificationCacheOptions } from '@app/models';

export const CANVAS_WIDTH_PX = 800;
export const CANVAS_HEIGHT_PX = 800;

export const CELL_SIZE = 8;
export const ROAD_WIDTH = CELL_SIZE * 5;

export const MIN_MARGIN_TO_BOUNDARY = CELL_SIZE * 4;
export const MIN_ROAD_DISTANCE = CELL_SIZE * 2;

export const ROAD_COLOR = `rgba(98, 98, 98)`
export const ROAD_PAINT_COLOR = '#eee';
export const INVALID_ROAD_COLOR = `rgba(256, 98, 98)`;

export const TRAFFIC_LIGHT_COLORS = [
    ['#5f5', '#040'], // Green
    ['#ff5', '#440'], // Yellow
    ['#f00', '#400'], // Red
];

export const SUCCESS_COLOR = `rgba(32, 256, 98, 0.75)`;
export const INFO_COLOR = `rgba(32, 164, 256, 0.75)`;

export const NOTIFICATION_CACHE_OPTIONS: IDropdownOption<NotificationCacheOptions>[] = [
    { value: NotificationCacheOptions.Last5, label: 'Show last 5' },
    { value: NotificationCacheOptions.Last10, label: 'Show last 10' },
    { value: NotificationCacheOptions.Last25, label: 'Show last 25', selected: true },
    { value: NotificationCacheOptions.Last50, label: 'Show last 50' },
    { value: NotificationCacheOptions.Last100, label: 'Show last 100' },
    { value: NotificationCacheOptions.All, label: 'Show All' }
];