import { Injectable } from '@app/core/di';
import { takeUntil } from 'rxjs';
import { BaseAppNotification, NotificationService } from '@app/notifications';
import { HTMLHelper } from '@app/helpers';
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
    const listElement = HTMLHelper.createElement<HTMLUListElement>({
      tagName: 'ul',
      className: 'events-list'
    });

    this._notificationService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((events: BaseAppNotification[]) => {
        listElement.innerHTML = '';

        events.forEach(event => {
          listElement.appendChild(this._getEventItemElement(event));
        });
      });

    return HTMLHelper.createElement<HTMLDivElement>({
      tagName: 'div',
      className: 'events-container',
      children: [
        this._getHeaderElement(),
        listElement
      ],
    });
  }

  private _getHeaderElement(): HTMLHeadElement {
    const dropdown = this._getCacheSizeDropdown();

    const clearButton = HTMLHelper.createElement<HTMLButtonElement>({
      tagName: 'button',
      className: 'logs-clear-button',
      onClick: () => this._notificationService.clear(),
    });

    return HTMLHelper.createElement<HTMLHeadElement>({
      tagName: 'header',
      children: [
        HTMLHelper.createElement({
          tagName: 'h2',
          textContent: 'Logs',
        }),
        dropdown,
        clearButton,
      ],
    });
  }

  private _getCacheSizeDropdown(): HTMLSelectElement {
    const options: HTMLOptionElement[] = NOTIFICATION_CACHE_OPTIONS.map(
      this._getDropdownOption.bind(this),
    )

    const dropdown = HTMLHelper.createElement<HTMLSelectElement>({
      tagName: 'select',
      className: 'cache-size-select',
      children: options,
      onChange: (e: Event) => {
        const value = parseInt((e.target as HTMLSelectElement).value, 10);

        this._notificationService.setCacheSize(value);
      }
    });

    return dropdown;
  }

  private _getDropdownOption({
    value,
    label,
    selected,
  }: IDropdownOption<number>): HTMLOptionElement {
    const option = HTMLHelper.createElement<HTMLOptionElement>({
      tagName: 'option',
      textContent: label,
    });

    option.value = value.toString();
    option.selected = selected ?? false;

    return option;
  }


  private _getEventItemElement(event: BaseAppNotification): HTMLLIElement {
    const indicator = HTMLHelper.createElement<HTMLDivElement>({
      tagName: 'div',
      className: `event-indicator event-${event.type}`,
    });

    const timestamp = HTMLHelper.createElement<HTMLSpanElement>({
      tagName: 'span',
      className: 'timestamp',
      textContent: event.timestamp,
    });

    const message = HTMLHelper.createElement<HTMLSpanElement>({
      tagName: 'span',
      textContent: event.message,
    });

    return HTMLHelper.createElement<HTMLLIElement>({
      tagName: 'li',
      className: 'event-item',
      children: [
        indicator,
        timestamp,
        message,
      ],
    });
  }
}