import { UserActionEvent } from './enums';

export interface IUserActionEvent<T = unknown> {
    type: UserActionEvent;
    payload?: T;
}
