import { State } from '@app/state';

export interface ITemplateData {
    name: string;
    state: Partial<State>;
}