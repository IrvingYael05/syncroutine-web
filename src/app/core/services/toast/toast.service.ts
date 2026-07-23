import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' = 'success', duration = 4000) {
    const id = this.idCounter++;
    const newToast: Toast = { id, message, type };

    this.toasts.update((currentToasts) => [...currentToasts, newToast]);
    setTimeout(() => this.remove(id), duration);
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const id = this.idCounter++;

      const newToast: Toast = {
        id,
        message,
        type: 'confirm',
        onConfirm: () => {
          this.remove(id);
          resolve(true);
        },
        onCancel: () => {
          this.remove(id);
          resolve(false);
        },
      };

      this.toasts.update((currentToasts) => [...currentToasts, newToast]);
    });
  }

  remove(id: number) {
    this.toasts.update((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }

  success(message: string) {
    this.show(message, 'success');
  }
  error(message: string) {
    this.show(message, 'error');
  }
  warning(message: string) {
    this.show(message, 'warning');
  }
}
