import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BloquesService, Bloque } from '../../core/services/bloques/bloques';
import { AuthService } from '../../core/services/auth/auth';
import { ToastService } from '../../core/services/toast/toast.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bloques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './bloques.html',
})
export class Bloques implements OnInit {
  private bloquesService = inject(BloquesService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  bloques: Bloque[] = [];
  bloquesBusqueda: Bloque[] = [];
  isLoading = true;
  isSubmitting = false;
  currentUserId: string | null = null;

  // Variables para controlar el Modal
  isModalOpen = false;
  editingId: string | null = null;

  bloqueForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    esAleatorio: [false],
  });

  // Variables para el buscador
  searchTerm: string = '';
  resultadosBusqueda: any[] = [];

  private http = inject(HttpClient);
  private searchApiUrl = 'https://syncroutine-buscador.onrender.com/search';

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.loadBloques();
    }
  }

  loadBloques() {
    if (!this.currentUserId) return;
    this.isLoading = true;
    this.bloquesService.getByUserId(this.currentUserId).subscribe({
      next: (data) => {
        this.bloques = data;
        this.bloquesBusqueda = [...data];
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error al cargar tus bloques de rutina');
        this.isLoading = false;
      },
    });
  }

  openModal(bloque?: Bloque) {
    this.isModalOpen = true;
    if (bloque) {
      this.editingId = bloque.id!;
      this.bloqueForm.patchValue({
        nombre: bloque.nombre,
        esAleatorio: bloque.esAleatorio,
      });
    } else {
      this.editingId = null;
      this.bloqueForm.reset({ esAleatorio: false });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingId = null;
    this.bloqueForm.reset({ esAleatorio: false });
  }

  onSubmit() {
    if (this.bloqueForm.invalid) {
      this.bloqueForm.markAllAsTouched();
      return;
    }

    if (!this.currentUserId) return;

    this.isSubmitting = true;
    const formValue = this.bloqueForm.value;

    const bloqueData: Bloque = {
      userId: this.currentUserId,
      nombre: formValue.nombre,
      esAleatorio: formValue.esAleatorio,
    };

    if (this.editingId) {
      this.bloquesService.update(this.editingId, bloqueData).subscribe({
        next: () => {
          this.toast.success('Bloque actualizado');
          this.loadBloques();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.toast.error('Error al actualizar el bloque');
          this.isSubmitting = false;
        },
      });
    } else {
      this.bloquesService.create(bloqueData).subscribe({
        next: () => {
          this.toast.success('Bloque creado con éxito');
          this.loadBloques();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.toast.error('Error al crear el bloque');
          this.isSubmitting = false;
        },
      });
    }
  }

  async deleteBloque(id: string) {
    const confirmado = await this.toast.confirm(
      '¿Estás seguro de eliminar este bloque? Se borrarán sus actividades.',
    );

    if (confirmado) {
      this.bloquesService.delete(id).subscribe({
        next: () => {
          this.toast.success('Bloque eliminado correctamente');
          this.loadBloques();
        },
        error: () => this.toast.error('Error al eliminar el bloque'),
      });
    }
  }

  buscarEnElastic() {
    if (this.searchTerm.trim() === '') {
      this.bloquesBusqueda = [...this.bloques];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    const url = `${this.searchApiUrl}?q=${this.searchTerm}&user_id=${this.currentUserId}`;

    this.http.get<any[]>(url).subscribe({
      next: (resultados) => {
        this.bloquesBusqueda = resultados;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error buscando en Elasticsearch:', err);
        this.isLoading = false;
      },
    });
  }
}
