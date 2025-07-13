import { Injectable } from '@app/core/di';
import { takeUntil } from 'rxjs';
import { Component } from '../component';
import { State } from '@app/state';
import { HTMLHelper } from '@app/helpers';
import { AppMode, UserActionEvent } from '@app/models';
import { UserEventsService } from '@app/core/services';

@Injectable([State, UserEventsService])
export class ControlsComponent extends Component<HTMLDivElement> {
  constructor(
    private readonly _state: State,
    private readonly _userEventService: UserEventsService,
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

    this._state.mode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        const isEdit = mode === AppMode.Edit;

        modeButton.classList.toggle('edit-mode', isEdit);
        modeButton.classList.toggle('simulation-mode', !isEdit);

        exampleButton.disabled = !isEdit;
        clearButton.disabled = !isEdit;
      });

    return HTMLHelper.createElement<HTMLDivElement>({
      tagName: 'div',
      className: 'controls-container',
      children: [
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
}