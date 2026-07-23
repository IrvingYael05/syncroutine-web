import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ActividadesService, Actividad } from '../../core/services/actividades/actividades';
import { BloquesService, Bloque } from '../../core/services/bloques/bloques';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './actividades.html',
})
export class Actividades implements OnInit {
  private actividadesService = inject(ActividadesService);
  private bloquesService = inject(BloquesService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  actividades: Actividad[] = [];
  bloqueId: string = '';
  bloqueName: string = '';
  isLoading = true;
  isSubmitting = false;

  // Variables del Modal
  isModalOpen = false;
  editingId: string | null = null;

  // Formulario amigable para el usuario (Minutos y Segundos)
  actividadForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    minutos: [0, [Validators.min(0)]],
    segundos: [0, [Validators.min(0), Validators.max(59)]],
  });

  ngOnInit() {
    // Capturamos el ID del bloque de la URL
    this.bloqueId = this.route.snapshot.paramMap.get('bloqueId') || '';
    if (this.bloqueId) {
      this.loadActividades();
    }
  }

  loadActividades() {
    this.bloquesService.getById(this.bloqueId).subscribe({
      next: (bloque: Bloque) => {
        this.bloqueName = bloque.nombre;
      },
      error: () => {
        this.toast.error('Error al cargar el bloque');
      },
    });

    this.actividadesService.getByBloqueId(this.bloqueId).subscribe({
      next: (data) => {
        this.actividades = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error al cargar las actividades');
        this.isLoading = false;
      },
    });
  }

  // --- Utilidades de Tiempo ---
  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m > 0 ? m + 'm ' : ''}${s}s`;
  }

  // --- Control del Modal ---
  openModal(actividad?: Actividad) {
    this.isModalOpen = true;
    if (actividad) {
      this.editingId = actividad.id!;
      const minutos = Math.floor(actividad.tiempoObjetivoSegundos / 60);
      const segundos = actividad.tiempoObjetivoSegundos % 60;

      this.actividadForm.patchValue({
        nombre: actividad.nombre,
        minutos: minutos,
        segundos: segundos,
      });
    } else {
      this.editingId = null;
      this.actividadForm.reset({ minutos: 0, segundos: 0 });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingId = null;
    this.actividadForm.reset({ minutos: 0, segundos: 0 });
  }

  // --- CRUD ---
  onSubmit() {
    if (this.actividadForm.invalid) {
      this.actividadForm.markAllAsTouched();
      return;
    }

    const { nombre, minutos, segundos } = this.actividadForm.value;

    // Verificamos que al menos haya 1 segundo de actividad
    const totalSegundos = minutos * 60 + segundos;
    if (totalSegundos <= 0) {
      this.toast.warning('La actividad debe durar al menos 1 segundo.');
      return;
    }

    this.isSubmitting = true;
    const actividadData: Actividad = {
      bloqueId: this.bloqueId,
      nombre: nombre,
      tiempoObjetivoSegundos: totalSegundos,
    };

    if (this.editingId) {
      this.actividadesService.update(this.editingId, actividadData).subscribe({
        next: () => {
          this.toast.success('Actividad actualizada');
          this.loadActividades();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.toast.error('Error al actualizar');
          this.isSubmitting = false;
        },
      });
    } else {
      this.actividadesService.create(actividadData).subscribe({
        next: () => {
          this.toast.success('Actividad creada');
          this.loadActividades();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.toast.error('Error al crear');
          this.isSubmitting = false;
        },
      });
    }
  }

  async deleteActividad(id: string) {
    const confirmado = await this.toast.confirm('¿Eliminar esta actividad?');
    if (confirmado) {
      this.actividadesService.delete(id).subscribe({
        next: () => {
          this.toast.success('Actividad eliminada');
          this.loadActividades();
        },
        error: () => this.toast.error('Error al eliminar'),
      });
    }
  }
}
