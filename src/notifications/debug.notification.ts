import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';


const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};

export class DebugNotification extends BaseAppNotification {
    public readonly type = NotificationType.Debug;

    constructor(...args: unknown[]) {
        super();

        const circularReplacer = getCircularReplacer();

        this.message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, circularReplacer) : arg).join(' ');
    }
}