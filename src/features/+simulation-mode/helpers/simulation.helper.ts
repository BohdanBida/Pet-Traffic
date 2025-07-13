import { INode, IRoad, IRoadNode } from '@app/models';
import { State } from '@app/state';
import { GeometryHelper } from 'helpers/geometry.helper';
import { v4 as uuid } from 'uuid';

export class SimulationModeHelper {
    public static buildNodes(state: State): [INode[], IRoadNode[]] {
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

        simRoads = state.roads.map((road: IRoad) => {
            const startNode = getOrCreateNode(road.start.x, road.start.y);
            const endNode = getOrCreateNode(road.end.x, road.end.y);
            const length = GeometryHelper.getDistance(road.start, road.end);

            const simRoad = { id: road.id!, startNode, endNode, length };
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