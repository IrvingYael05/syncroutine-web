import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VinculacionService, VincularRequest } from '../../core/services/vinculacion/vinculacion';
import { AuthService } from '../../core/services/auth/auth';
import { ToastService } from '../../core/services/toast/toast.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vinculacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vinculacion.html',
})
export class Vinculacion {
  private fb = inject(FormBuilder);
  private vinculacionService = inject(VinculacionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isSubmitting = false;

  pinForm: FormGroup = this.fb.group({
    pin: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], // Exactamente 6 dígitos
  });

  // Utilidad para que el input solo acepte números
  onInput(event: any) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, ''); // Borra cualquier letra
    this.pinForm.get('pin')?.setValue(input.value);
  }

  async onSubmit() {
    if (this.pinForm.invalid) {
      this.pinForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const pin = this.pinForm.value.pin;

    try {
      // 1. Obtenemos al usuario y la sesión actual
      const user = await this.authService.getCurrentUser();
      const session = await this.authService.getFullSession();

      if (!user || !session) {
        this.toast.error('No se pudo verificar tu sesión.');
        this.isSubmitting = false;
        return;
      }

      // 2. Preparamos el paquete de datos
      const request: VincularRequest = {
        pin: pin,
        userId: user.id,
        token: session.access_token,
        refreshToken: session.refresh_token,
      };

      // 3. Enviamos a Spring Boot
      this.vinculacionService.vincular(request).subscribe({
        next: (response) => {
          this.toast.success('¡Reloj vinculado con éxito!');
          this.pinForm.reset();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toast.error('PIN inválido o expirado. Genera uno nuevo en tu reloj.');
          this.isSubmitting = false;
        },
      });
    } catch (error) {
      this.toast.error('Error interno al vincular.');
      this.isSubmitting = false;
    }
  }
}
