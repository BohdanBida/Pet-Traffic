import { Observable } from 'rxjs';

export class FileHelper {
    public static saveFile(data: unknown, fileName: string): void {
        const blob = new Blob([JSON.stringify(data)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    public static readJSON<T = unknown>(input: HTMLInputElement): Observable<T> {
        input.type = 'file';
        input.accept = '.json';

        return new Observable<T>((observer) => {
            input.onchange = (event: Event) => {
                const input = event.target as HTMLInputElement;
                if (!input.files || input.files.length === 0) return;

                const file = input.files[0];
                const reader = new FileReader();

                reader.onload = () => {
                    let json;
                    try {
                        json = JSON.parse(reader.result as string);
                    } catch {
                        throw new Error('Parsing Failed: Invalid JSON format');
                    }

                    observer.next(json);
                };

                reader.onerror = () => {
                    throw new Error('Error reading file');
                };

                reader.readAsText(file);
            };
        });
    }
}