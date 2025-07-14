import { ROAD_WIDTH, CELL_SIZE } from '@app/constants';

export const LANE_OFFSET = -1.3;
export const CARS_AMOUNT = 30;
export const CAR_LENGTH = 3;
export const SAFE_DISTANCE = 1.5;
export const CROSSROAD_STOP_DISTANCE = ROAD_WIDTH * 1.75 / CELL_SIZE;
export const ACCELERATION = 0.00015;
export const DECELERATION = 0.0002;
export const MAX_PX_PER_TICK = 10;

export const TRAFFIC_LIGHT_CYCLE = 2800;

export const TICKS_PER_SECOND = 60;