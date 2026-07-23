import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VinculacionService } from '../../../core/services/vinculacion/vinculacion';
import { AuthService } from '../../../core/services/auth/auth';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-watch-pin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center w-full p-4 text-center">
      <svg class="w-8 h-8 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        ></path>
      </svg>

      <p class="text-textMuted text-xs font-bold uppercase tracking-widest mb-2">
        Código de Enlace
      </p>

      <div *ngIf="isLoading" class="py-4">
        <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <!-- El PIN en tamaño gigante adaptado para relojes -->
      <h1 *ngIf="pin" class="text-5xl font-black tracking-[0.2em] text-white font-mono mb-4">
        {{ pin }}
      </h1>

      <p *ngIf="pin" class="text-[10px] text-textMuted leading-tight px-2">
        Ingresa este código en tu PC o celular para sincronizar.
      </p>

      <div *ngIf="hasError" class="text-danger text-xs font-bold mt-4">
        Error de conexión.<br />Reinicia la app.
      </div>
    </div>
  `,
})
export class WatchPin implements OnInit, OnDestroy {
  private vinculacionService = inject(VinculacionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  pin: string = '';
  isLoading = true;
  hasError = false;
  private pollingSub?: Subscription;

  async ngOnInit() {
    // 1. Verificar si ya tiene sesión iniciada (de un uso anterior)
    const isAuth = await this.authService.isAuthenticated();
    if (isAuth) {
      // Ya estaba vinculado, saltamos directo al Dashboard del reloj (Fase 4)
      this.router.navigate(['/watch/dashboard']);
      return;
    }

    // 2. Si no tiene sesión, pedir un PIN al backend
    this.vinculacionService.generarPin().subscribe({
      next: (res) => {
        this.pin = res.pin;
        this.isLoading = false;
        this.iniciarPolling();
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
      },
    });
  }

  iniciarPolling() {
    // Preguntar al backend cada 3 segundos (3000 ms)
    this.pollingSub = interval(3000).subscribe(() => {
      this.vinculacionService.consultarEstado(this.pin).subscribe({
        next: async (estado) => {
          if (estado.status === 'PAIRED' && estado.token && estado.refreshToken) {
            // ¡VINCULACIÓN EXITOSA! Detenemos el polling
            this.pollingSub?.unsubscribe();

            // Guardamos los tokens permanentemente en Supabase (En el localStorage del reloj)
            await this.authService.supabaseClient.auth.setSession({
              access_token: estado.token,
              refresh_token: estado.refreshToken,
            });

            // Redirigimos a sus rutinas
            this.router.navigate(['/watch/dashboard']);
          } else if (estado.status === 'EXPIRED') {
            this.hasError = true;
            this.pollingSub?.unsubscribe();
          }
        },
      });
    });
  }

  ngOnDestroy() {
    // Evitar fugas de memoria si cambia de pantalla
    this.pollingSub?.unsubscribe();
  }
}
