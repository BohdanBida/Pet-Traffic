import { CrossRoadAngle } from './enums/enums';
import { ILine, IPoint } from './geometry.models';
import { v4 as uuid } from 'uuid';

export interface IRoad extends ILine {
    id?: string;
}

// todo: add enum for light id
export interface ICrossRoad extends IPoint {
    number?: number;
    horizontalLightId?: number; // 0-green, 1-yellow, 2-red
    verticalLightId?: number;   // 0-green, 1-yellow, 2-red

    connectedSides: Partial<{
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    }>;
}

export interface ITurn extends IPoint {
    angle: CrossRoadAngle;
}

export interface ICrossRoadSet {
    turns: ITurn[];
    crossroads: ICrossRoad[];
}

export interface INode {
    id: string;
    x: number;
    y: number;
    connectedRoads: IRoadNode[];
    horizontalLightId?: number;
    verticalLightId?: number;
}

export interface IRoadNode {
    id: string;
    startNode: INode;
    endNode: INode;
}

export interface ICar {
    id: string;
    color: string;
    road: IRoadNode;
    direction: 1 | -1;
    t: number;
    speed: number;
    targetSpeed: number;
    velocity: number;
    waiting: boolean;
    x: number;
    y: number;
    angle: number;
}

export class Car implements ICar {
    public id: string;
    public color: string;
    public targetSpeed: number;
    public velocity: number;
    public waiting: boolean;
    public x: number;
    public y: number;
    public angle: number;

    public waitingFor: 'light' | 'car' | null = null;

    constructor(
        public road: IRoadNode,
        public direction: 1 | -1,
        public t: number,
        public speed: number,
    ) {
        this.id = uuid();
        this.color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        this.road = road;
        this.direction = direction;
        this.t = t;
        this.speed = speed;
        this.targetSpeed = speed;
        this.velocity = 0;
        this.waiting = false;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
    }
}