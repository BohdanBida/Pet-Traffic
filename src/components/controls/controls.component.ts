import { ErrorNotification, NotificationService } from '@app/notifications';
import { Injectable } from '@app/core/di';
import { takeUntil } from 'rxjs';
import { Component } from '../component';
import { State } from '@app/state';
import { FileHelper, HTMLElementBuilder } from '@app/helpers';
import { AppMode, ITemplateData, UserActionEvent } from '@app/models';
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
    const saveButton = this._createSaveButton();
    const exampleButton = this._createTemplatesButton();
    const modeButton = this._createModeButton();
    const clearButton = this._createClearButton();

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

    return new HTMLElementBuilder('div')
      .setClass('controls-container')
      .setChildren([
        saveButton,
        exampleButton,
        modeButton,
        clearButton,
      ])
      .build();
  }

  private _createSaveButton(): HTMLButtonElement {
    return new HTMLElementBuilder('button')
      .setClass('save-btn')
      .setText('Save')
      .onClick(() => this._onSave())
      .build();
  }

  private _createTemplatesButton(): HTMLButtonElement {
    return new HTMLElementBuilder('button')
      .setClass('example-btn')
      .setText('Templates')
      .onClick(() => this._onSetTemplate())
      .build();
  }

  private _createModeButton(): HTMLButtonElement {
    return new HTMLElementBuilder('button')
      .setClass('mode-btn edit-mode')
      .onClick(() => this._onChangeMode())
      .build();
  }


  private _createClearButton(): HTMLButtonElement {
    return new HTMLElementBuilder('button')
      .setClass('clear-btn')
      .setText('Clear')
      .onClick(() => this._onClear())
      .build();
  }

  private _onSetTemplate(): void {
    this._userEventService.sendActionEvent(UserActionEvent.SetTemplate)
  }

  private _onChangeMode(): void {
    const mode = this._getNextMode();
    const eventType =
      mode === AppMode.Edit
        ? UserActionEvent.EnableEditMode
        : UserActionEvent.EnableSimulationMode;

    this._userEventService.sendActionEvent(eventType);
  }

  private _getNextMode(): AppMode {
    const currentMode = this._state.mode$.getValue();

    return currentMode === AppMode.Edit ? AppMode.Simulation : AppMode.Edit;
  }

  private _onClear(): void {
    this._userEventService.sendActionEvent(UserActionEvent.Clear)
  }

  private _onSave(): void {
    if (this._state.roads.length === 0) {
      this._notificationService.add(
        new ErrorNotification('Cannot save empty map')
      );
      return;
    }

    const mapData: ITemplateData = {
      name: `Map ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      state: {
        roads: this._state.roads,
      },
    };

    FileHelper.saveFile(mapData, 'traffic-system-map.json');
  }
}
