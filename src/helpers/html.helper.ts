export interface ICreateElementPayload {
    tagName: string;
    className?: string;
    textContent?: string;
    children?: HTMLElement | HTMLElement[];
    onClick?: (event: MouseEvent) => void;
    onChange?: (event: Event) => void;
}

export class HTMLHelper {
    public static createElement<T extends HTMLElement>({
        tagName,
        className,
        textContent,
        children,
        onClick,
        onChange,
    }: ICreateElementPayload): T {
        const element = document.createElement(tagName) as T;

        if (className) {
            element.className = className;
        }

        if (textContent) {
            element.textContent = textContent;
        }

        if (children) {
            if (Array.isArray(children)) {
                children.forEach(child => element.appendChild(child));
            } else {
                element.appendChild(children);
            }
        }

        if (onClick) {
            element.addEventListener('click', onClick);
        }

        if (onChange) {
            element.addEventListener('change', onChange);
        }

        return element;
    }
}