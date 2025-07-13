import { State } from '@app/state';

export interface IExampleData {
    name: string;
    state: Partial<State>;
    imageName: string;
}