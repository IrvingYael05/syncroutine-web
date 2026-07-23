import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerfilService } from '../../core/services/perfil/perfil';
import { ToastService } from '../../core/services/toast/toast.service';
import { AuthService } from '../../core/services/auth/auth';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isLoading = false;
  showPassword = false;
  currentUserId: string | null = null;

  perfilForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.minLength(3)]],
    password: ['', [Validators.pattern(/^(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~-]).{7,}$/)]],
  });

  async ngOnInit() {
    // Al cargar la página, obtenemos el ID del usuario y pre-llenamos su nombre (desde Supabase metadata)
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      const nombreActual = user.user_metadata?.['nombre'] || '';
      this.perfilForm.patchValue({ nombre: nombreActual });
    }
  }

  normalizeName(event: Event) {
    const input = event.target as HTMLInputElement;
    const words = input.value.split(' ');
    const normalized = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    this.perfilForm.get('nombre')?.setValue(normalized, { emitEvent: false });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      this.toast.warning('Revisa los campos del formulario.');
      return;
    }

    if (!this.currentUserId) return;

    this.isLoading = true;
    const { nombre, password } = this.perfilForm.value;

    // Verificamos qué quiere actualizar el usuario
    const quiereActualizarNombre = nombre && this.perfilForm.get('nombre')?.dirty;
    const quiereActualizarPassword = password && password.length > 0;

    if (!quiereActualizarNombre && !quiereActualizarPassword) {
      this.toast.warning('No hay cambios para guardar.');
      this.isLoading = false;
      return;
    }

    try {
      // 1. Si hay contraseña nueva, le decimos a Supabase
      if (quiereActualizarPassword) {
        const { error } = await this.authService.updatePassword(password);
        if (error) throw error;
      }

      // 2. Si hay nombre nuevo, le decimos a Spring Boot y a la metadata de Supabase
      if (quiereActualizarNombre) {
        await lastValueFrom(this.perfilService.actualizarNombre(this.currentUserId, nombre));
        // También actualizamos la metadata en Supabase para que el Menú reaccione rápido
        await this.authService.supabaseClient.auth.updateUser({ data: { nombre: nombre } });
      }

      this.toast.success('¡Perfil actualizado con éxito!');
      this.perfilForm.get('password')?.reset();
      this.perfilForm.markAsPristine(); // Reiniciamos el estado del formulario
    } catch (error: any) {
      console.error(error);
      this.toast.error('Ocurrió un error al actualizar.');
    } finally {
      this.isLoading = false;
    }
  }
}
