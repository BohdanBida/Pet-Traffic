import { Injectable } from '@app/core/di';
import { State } from '@app/state';
import { AppMode, INode, IRoadNode } from '@app/models';
import { SimulationModeHelper } from './helpers';
import { TickService } from '@app/core/services';
import {
    TrafficLightsManager, CarFactory, CarMovementManager,
    TrafficInteractionManager
} from './services';

@Injectable([
    State,
    TickService,
    TrafficLightsManager,
    CarFactory,
    CarMovementManager,
    TrafficInteractionManager,
])
export class SimulationModeService {
    public simNodes: INode[] = [];

    public simRoads: IRoadNode[] = [];

    constructor(
        private readonly _state: State,
        private readonly _tickService: TickService,
        private readonly _traffic: TrafficLightsManager,
        private readonly _carFactory: CarFactory,
        private readonly _carMovementManager: CarMovementManager,
        private readonly _trafficInteractionManager: TrafficInteractionManager,
    ) { }

    public run(): void {
        this.stop();

        if (!this._state.roads.length) {
            return;
        }

        this._state.mode$.next(AppMode.Simulation);

        this.convertEditToSim();

        this._traffic.start(this.simNodes);

        this._carFactory.initCars(this._state, this.simRoads);

        this._tickService.start().subscribe(() => this.step());
    }

    public stop(): void {
        this._state.cars = [];
        this._tickService.stop();
        this._traffic.stop();
    }

    public convertEditToSim(): void {
        const [simNodes, simRoads] = SimulationModeHelper.buildNodes(this._state);
        this.simNodes = simNodes;
        this.simRoads = simRoads;
    }

    public step(): void {
        for (const car of this._state.cars) {
            if (this._trafficInteractionManager.shouldWaitForLight(car)) continue;

            if (!this._trafficInteractionManager.isSafeToProceed(car)) {
                car.targetSpeed = 0;
            } else {
                car.targetSpeed = car.speed;
            }

            this._carMovementManager.step(car);
        }
    }
}
