import { ErrorNotification, NotificationService } from '@app/notifications';
import { Injectable } from '@app/core/di';
import { takeUntil } from 'rxjs';
import { Component } from '../component';
import { State } from '@app/state';
import { HTMLHelper } from '@app/helpers';
import { AppMode, IExampleData, UserActionEvent } from '@app/models';
import { UserEventsService } from '@app/core/services';

@Injectable([State, UserEventsService, NotificationService])
export class ControlsComponent extends Component<HTMLDivElement> {
  constructor(
    private readonly _state: State,
    private readonly _userEventService: UserEventsService,
    private readonly _notificationService: NotificationService,
  ) {
    super();
  }

  protected createElement(): HTMLDivElement {
    const exampleButton = HTMLHelper.createElement<HTMLButtonElement>({
      tagName: 'button',
      className: 'example-btn',
      textContent: 'Example',
      onClick: () => this._userEventService.sendActionEvent(UserActionEvent.SetExample),
    });

    const modeButton = HTMLHelper.createElement<HTMLButtonElement>({
      tagName: 'button',
      className: 'mode-btn edit-mode',
      onClick: () => {
        const mode = this._getNextMode();

        const eventType = mode === AppMode.Edit ? UserActionEvent.EnableEditMode : UserActionEvent.EnableSimulationMode;
        this._userEventService.sendActionEvent(eventType);
      }
    });

    const clearButton = HTMLHelper.createElement<HTMLButtonElement>({
      tagName: 'button',
      className: 'clear-btn',
      textContent: 'Clear',
      onClick: () => this._userEventService.sendActionEvent(UserActionEvent.Clear),
    });

    const saveButton = HTMLHelper.createElement<HTMLButtonElement>({
      tagName: 'button',
      className: 'save-btn',
      textContent: 'Save',
      onClick: () => this._saveMap(),
    });

    this._state.mode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        const isEdit = mode === AppMode.Edit;

        modeButton.classList.toggle('edit-mode', isEdit);
        modeButton.classList.toggle('simulation-mode', !isEdit);

        exampleButton.disabled = !isEdit;
        clearButton.disabled = !isEdit;
        saveButton.disabled = !isEdit;
      });

    return HTMLHelper.createElement<HTMLDivElement>({
      tagName: 'div',
      className: 'controls-container',
      children: [
        saveButton,
        exampleButton,
        modeButton,
        clearButton,
      ],
    });
  }

  private _getNextMode(): AppMode {
    const currentMode = this._state.mode$.getValue();

    return currentMode === AppMode.Edit ? AppMode.Simulation : AppMode.Edit;
  }

  private _saveMap(): void {
    if (this._state.roads.length === 0) {
      this._notificationService.add(new ErrorNotification('Cannot save empty map'));

      return;
    }

    const mapData: IExampleData = {
      name: `Map ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      state: {
        roads: this._state.roads,
      }
    };

    const blob = new Blob([JSON.stringify(mapData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'traffic-system-map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}