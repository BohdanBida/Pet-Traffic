export interface IDropdownOption<T = unknown> {
    value: T;
    label: string;
    selected?: boolean;
}
