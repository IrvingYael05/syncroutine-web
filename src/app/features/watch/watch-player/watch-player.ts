import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadesService, Actividad } from '../../../core/services/actividades/actividades';
import { BloquesService, Bloque } from '../../../core/services/bloques/bloques';
import { HistorialService, CrearHistorialDto } from '../../../core/services/historial/historial';
import { AuthService } from '../../../core/services/auth/auth';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-watch-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watch-player.html',
})
export class WatchPlayer implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bloquesService = inject(BloquesService);
  private actividadesService = inject(ActividadesService);
  private historialService = inject(HistorialService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  userId: string = '';
  bloqueId: string = '';

  actividades: Actividad[] = [];
  currentIndex = 0;

  // Estados de la UI
  isLoading = true;
  isFinished = false;
  isSaving = false;

  // Variables del Cronómetro
  tiempoSegundos = 0;
  isRunning = false;
  private timerInterval: any;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/watch/pin']);
      return;
    }
    this.userId = user.id;
    this.bloqueId = this.route.snapshot.paramMap.get('bloqueId') || '';

    if (this.bloqueId) {
      this.cargarRutina();
    }
  }

  cargarRutina() {
    // 1. Obtener el bloque para saber si es aleatorio
    this.bloquesService.getById(this.bloqueId).subscribe({
      next: (bloque) => {
        // 2. Obtener las actividades
        this.actividadesService.getByBloqueId(this.bloqueId).subscribe({
          next: (acts) => {
            if (acts.length === 0) {
              this.toast.warning('Este bloque no tiene actividades.');
              this.router.navigate(['/watch/dashboard']);
              return;
            }

            // Si es aleatorio, desordenamos el arreglo (Algoritmo Fisher-Yates)
            if (bloque.esAleatorio) {
              for (let i = acts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [acts[i], acts[j]] = [acts[j], acts[i]];
              }
            }

            this.actividades = acts;
            this.isLoading = false;
          },
        });
      },
      error: () => this.toast.error('Error al cargar la rutina'),
    });
  }

  get actividadActual(): Actividad | undefined {
    return this.actividades[this.currentIndex];
  }

  // --- CONTROLES DEL CRONÓMETRO ---
  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      this.tiempoSegundos++;
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // --- TERMINAR ACTIVIDAD ---
  siguienteActividad() {
    if (!this.actividadActual) return;

    this.pauseTimer();
    this.isSaving = true;

    const registro: CrearHistorialDto = {
      userId: this.userId,
      actividadId: this.actividadActual.id!,
      tiempoRealSegundos: this.tiempoSegundos,
    };

    // Enviamos el historial al Backend
    this.historialService.registrarHistorial(registro).subscribe({
      next: () => {
        this.tiempoSegundos = 0; // Reiniciamos el cronómetro
        this.isSaving = false;

        // Pasamos a la siguiente o mostramos pantalla final
        if (this.currentIndex < this.actividades.length - 1) {
          this.currentIndex++;
        } else {
          this.isFinished = true;
        }
      },
      error: () => {
        this.toast.error('Error al guardar el tiempo.');
        this.isSaving = false;
      },
    });
  }

  finalizarRutina() {
    this.router.navigate(['/watch/dashboard']);
  }

  // --- UTILIDADES ---
  formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    if (h > 0) return `${h}:${mStr}:${sStr}`;
    return `${mStr}:${sStr}`;
  }

  ngOnDestroy() {
    this.pauseTimer(); // Limpiar memoria al salir
  }
}
