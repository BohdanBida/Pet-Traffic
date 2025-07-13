const classDeps = new Map<Function, any[]>();

export function Injectable(dependencies: any[]) {
    return function (target: Function) {
        classDeps.set(target, dependencies);
    };
}

export class Injector {
    private static _instances = new Map<Function, any>();

    public static resolve<T>(target: new (...args: any[]) => T): T {
        if (this._instances.has(target)) return this._instances.get(target);

        const deps = classDeps.get(target) || [];
        const resolvedDeps = deps.map(dep => this.resolve(dep));
        const instance = new target(...resolvedDeps);

        this._instances.set(target, instance);
        return instance;
    }

    public static override<T>(token: new (...args: any[]) => T, instance: T): void {
        this._instances.set(token, instance);
    }

    public static clear(): void {
        this._instances.clear();
    }
}
