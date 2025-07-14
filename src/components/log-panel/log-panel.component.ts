import { Injectable } from '@app/core/di';
import { takeUntil } from 'rxjs';
import { BaseAppNotification, NotificationService } from '@app/notifications';
import { HTMLElementBuilder } from '@app/helpers';
import { NOTIFICATION_CACHE_OPTIONS } from '@app/constants';
import { IDropdownOption } from '@app/models';
import { Component } from '../component';

@Injectable([NotificationService])
export class LogPanelComponent extends Component<HTMLDivElement> {
  constructor(
    private readonly _notificationService: NotificationService,
  ) {
    super();
  }

  protected createElement(): HTMLDivElement {
    const listElement = this._createEventsList();

    this._notificationService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((events: BaseAppNotification[]) => {
        listElement.innerHTML = '';
        events.forEach(event => {
          listElement.appendChild(this._createEventItem(event));
        });
      });

    return new HTMLElementBuilder('div')
      .setClass('events-container')
      .setChildren([
        this._createHeader(),
        listElement,
      ])
      .build();
  }

  private _createHeader(): HTMLElement {
    return new HTMLElementBuilder('header')
      .setChildren([
        new HTMLElementBuilder('h2')
          .setText('Application Logs')
          .build(),
        this._createCacheSizeDropdown(),
        this._createClearButton(),
      ])
      .build();
  }

  private _createClearButton(): HTMLButtonElement {
    return new HTMLElementBuilder('button')
      .setClass('logs-clear-button')
      .onClick(() => this._onClear())
      .build();
  }

  private _createCacheSizeDropdown(): HTMLSelectElement {
    const options: HTMLOptionElement[] = NOTIFICATION_CACHE_OPTIONS.map(
      this._createDropdownOption.bind(this),
    );

    return new HTMLElementBuilder('select')
      .setClass('cache-size-select')
      .setChildren(options)
      .onChange((e) => {
        const value = parseInt((e.target as HTMLSelectElement).value, 10);
        this._notificationService.setCacheSize(value);
      })
      .build();
  }

  private _createDropdownOption(optionData: IDropdownOption<number>): HTMLOptionElement {
    const option = new HTMLElementBuilder('option')
      .setText(optionData.label)
      .build();

    option.value = optionData.value.toString();
    option.selected = optionData.selected ?? false;

    return option;
  }

  private _createEventsList(): HTMLUListElement {
    return new HTMLElementBuilder('ul')
      .setClass('events-list')
      .build();
  }

  private _createEventItem(event: BaseAppNotification): HTMLLIElement {
    const indicator = new HTMLElementBuilder('div')
      .setClass(`event-indicator event-${event.type}`)
      .build();

    const timestamp = new HTMLElementBuilder('span')
      .setClass('timestamp')
      .setText(event.timestamp)
      .build();

    const message = new HTMLElementBuilder('span')
      .setText(event.message)
      .build();

    return new HTMLElementBuilder('li')
      .setClass('event-item')
      .setChildren([
        indicator,
        timestamp,
        message,
      ])
      .build();
  }

  private _onClear(): void {
    this._notificationService.clear();
  }
}
