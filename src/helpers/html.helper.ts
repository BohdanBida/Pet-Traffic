interface HTMLElementTagNameMap {
    div: HTMLDivElement;
    span: HTMLSpanElement;
    button: HTMLButtonElement;
    input: HTMLInputElement;
    canvas: HTMLCanvasElement;
    select: HTMLSelectElement;
    option: HTMLOptionElement;
    ul: HTMLUListElement;
    li: HTMLLIElement;
    header: HTMLHeadElement;
    h1: HTMLHeadingElement;
    h2: HTMLHeadingElement;
    h3: HTMLHeadingElement;
}

type TagName = keyof HTMLElementTagNameMap;

export class HTMLElementBuilder<K extends TagName> {
    private element: HTMLElementTagNameMap[K];

    constructor(tagName: K) {
        this.element = document.createElement(tagName) as HTMLElementTagNameMap[K];
    }

    public setClass(className: string): this {
        this.element.className = className;
        return this;
    }

    public setText(text: string): this {
        this.element.textContent = text;
        return this;
    }

    public setChildren(children: HTMLElement | HTMLElement[]): this {
        if (Array.isArray(children)) {
            children.forEach(child => this.element.appendChild(child));
        } else {
            this.element.appendChild(children);
        }
        return this;
    }

    public onClick(handler: (event: MouseEvent) => void): this {
        this.element.addEventListener('click', (e) => {
            if (e instanceof MouseEvent) {
                handler(e);
            }
        });
        return this;
    }

    public onChange(handler: (event: Event) => void): this {
        this.element.addEventListener('change', handler);
        return this;
    }

    public build(): HTMLElementTagNameMap[K] {
        return this.element;
    }
}
