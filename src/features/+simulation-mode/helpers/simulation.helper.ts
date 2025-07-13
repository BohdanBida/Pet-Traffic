import { INode, IRoadNode } from '@app/models';
import { State } from '@app/state';
import { v4 as uuid } from 'uuid';

export class SimulationModeHelper {
    public static convertEditToSim(state: State): [INode[], IRoadNode[]] {
        const nodeMap = new Map<string, INode>();
        let simRoads: IRoadNode[] = [];
        let simNodes: INode[] = [];

        const getOrCreateNode = (x: number, y: number): INode => {
            const key = `${x},${y}`;
            if (!nodeMap.has(key)) {
                nodeMap.set(key, {
                    id: uuid(),
                    x, y,
                    connectedRoads: [],
                    horizontalLightId: 2,
                    verticalLightId: 2,
                });
            }
            return nodeMap.get(key)!;
        };

        simRoads = state.roads.map(r => {
            const startNode = getOrCreateNode(r.start.x, r.start.y);
            const endNode = getOrCreateNode(r.end.x, r.end.y);
            const simRoad = { id: r.id!, startNode, endNode };
            startNode.connectedRoads.push(simRoad);
            endNode.connectedRoads.push(simRoad);
            return simRoad;
        });

        simNodes = Array.from(nodeMap.values());

        state.crossroads.forEach(cr => {
            const node = nodeMap.get(`${cr.x},${cr.y}`);
            if (node) {
                node.horizontalLightId = cr.horizontalLightId ?? 2;
                node.verticalLightId = cr.verticalLightId ?? 2;
            }
        });

        return [simNodes, simRoads];
    }
}