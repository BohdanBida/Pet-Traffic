import { AppMode, Car, ICrossRoad, IPoint, IRoad, ITurn, ValidationStatus } from '@app/models';
import { BehaviorSubject } from 'rxjs';
import { StateSnapshot } from './state-snapshot';

export class State {
    public mode$: BehaviorSubject<AppMode> = new BehaviorSubject<AppMode>(AppMode.Edit);
    
    public adjustByObjectsMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public inProgressRoad: IPoint | null = null;

    public validationStatus: ValidationStatus = ValidationStatus.Valid;

    public roads: IRoad[] = [];

    public crossroads: ICrossRoad[] = [];

    public turns: ITurn[] = [];

    public cars: Car[] = [];

    public createSnapshot(): StateSnapshot {
        return new StateSnapshot(
            structuredClone(this.roads),
            structuredClone(this.crossroads),
            structuredClone(this.turns)
        );
    }

    public restoreSnapshot(snapshot: StateSnapshot): void {
        this.roads = structuredClone(snapshot.roads);
        this.crossroads = structuredClone(snapshot.crossroads);
        this.turns = structuredClone(snapshot.turns);
    }

    public reset(): void {
        this.inProgressRoad = null;
        this.validationStatus = ValidationStatus.Valid;
        this.roads = [];
        this.crossroads = [];
        this.turns = [];
        this.cars = [];
    }

    public updateState(newState: Partial<State>): void {
        const { mode$, ...state } = newState;
        Object.assign(this, state);
    }
}