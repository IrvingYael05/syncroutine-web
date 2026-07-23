import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4"
    >
      <div
        *ngFor="let toast of toastService.toasts()"
        class="pointer-events-auto flex gap-3 px-4 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 animate-fade-in-down border bg-surface"
        [ngClass]="{
          'items-center': toast.type !== 'confirm',
          'items-start': toast.type === 'confirm',
          'border-primary/40': toast.type === 'success',
          'border-danger/40': toast.type === 'error',
          'border-yellow-500/40': toast.type === 'warning',
          'border-blue-500/40': toast.type === 'confirm',
        }"
      >
        <svg
          *ngIf="toast.type === 'success'"
          class="w-6 h-6 text-primary flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <svg
          *ngIf="toast.type === 'error'"
          class="w-6 h-6 text-danger flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <svg
          *ngIf="toast.type === 'warning'"
          class="w-6 h-6 text-yellow-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <svg
          *ngIf="toast.type === 'confirm'"
          class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>

        <div class="flex-1 flex flex-col justify-center">
          <span
            class="font-medium text-sm text-textMain"
            [ngClass]="{ 'mt-1': toast.type === 'confirm' }"
            >{{ toast.message }}</span
          >

          <div *ngIf="toast.type === 'confirm'" class="flex gap-3 mt-4 mb-1">
            <button
              (click)="toast.onCancel?.()"
              class="px-4 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="toast.onConfirm?.()"
              class="px-4 py-1.5 text-xs font-bold bg-danger hover:bg-danger-hover text-white rounded-lg transition-colors shadow-lg shadow-danger/20 border border-danger/50"
            >
              Sí, eliminar
            </button>
          </div>
        </div>

        <button
          *ngIf="toast.type !== 'confirm'"
          (click)="toastService.remove(toast.id)"
          class="text-textMuted hover:text-white transition-colors p-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .animate-fade-in-down {
        animation: fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `,
  ],
})
export class Toast {
  toastService = inject(ToastService);
}
