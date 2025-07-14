import { NotificationService, RedoNotification, UndoNotification } from '@app/notifications';
import { Injectable } from '@app/core/di';
import { State, StateSnapshot } from '@app/state';
import { AppMode } from '@app/models';

@Injectable([State, NotificationService])
export class StateHistoryManager {
    private undoStack: StateSnapshot[] = [];
    private redoStack: StateSnapshot[] = [];

    private get isNotEditMode(): boolean {
        return this.state.mode$.getValue() !== AppMode.Edit;
    }

    constructor(
        public readonly state: State,
        public readonly notificationService: NotificationService,
    ) {
        this._setupListeners();
    }

    public save(): void {
        this.undoStack.push(this._createSnapshot());
        this.redoStack = [];
    }

    public undo(): void {
        if (this.undoStack.length === 0 || this.isNotEditMode) return;

        const snapshot = this.undoStack.pop()!;
        this.redoStack.push(this._createSnapshot());
        this.state.restoreSnapshot(snapshot);
        this.notificationService.add(new UndoNotification());
    }

    public redo(): void {
        if (this.redoStack.length === 0 || this.isNotEditMode) return;

        const snapshot = this.redoStack.pop()!;
        this.undoStack.push(this._createSnapshot());
        this.state.restoreSnapshot(snapshot);
        this.notificationService.add(new RedoNotification());
    }

    private _createSnapshot(): StateSnapshot {
        return new StateSnapshot(
            structuredClone(this.state.roads),
            structuredClone(this.state.crossroads),
            structuredClone(this.state.turns)
        );
    }

    private _setupListeners(): void {
        document.addEventListener('keydown', (e) => {
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            if (isCtrlOrCmd && e.code === 'KeyZ') {
                e.shiftKey ? this.redo() : this.undo();
            }
        });
    }
}
