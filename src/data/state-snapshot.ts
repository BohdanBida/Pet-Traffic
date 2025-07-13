import { IRoad, ICrossRoad, ITurn } from '@app/models';

export class StateSnapshot {
    constructor(
        public roads: IRoad[],
        public crossroads: ICrossRoad[],
        public turns: ITurn[],
    ) { }
}