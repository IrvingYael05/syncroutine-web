import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  isLoginMode = true;
  isLoading = false;
  showPassword = false;

  authForm: FormGroup = this.fb.group({
    nombre: [''],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~-]).{7,}$/),
      ],
    ],
  });

  normalizeName(event: Event) {
    const input = event.target as HTMLInputElement;
    const words = input.value.split(' ');
    const normalized = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    this.authForm.get('nombre')?.setValue(normalized, { emitEvent: false });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    this.showPassword = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.toast.warning('Por favor, revisa los campos en rojo.');
      return;
    }

    if (!this.isLoginMode && !this.authForm.get('nombre')?.value) {
      this.authForm.get('nombre')?.setErrors({ required: true });
      this.toast.warning('El nombre es obligatorio para registrarse.');
      return;
    }

    this.isLoading = true;
    const { email, password, nombre } = this.authForm.value;

    try {
      if (this.isLoginMode) {
        const { error } = await this.authService.signIn(email, password);
        if (error) throw error;
        this.toast.success('¡Bienvenido de vuelta!');
      } else {
        const { error } = await this.authService.signUp(email, password, nombre);
        if (error) throw error;
        this.toast.success('¡Cuenta creada con éxito!');
      }

      this.router.navigate(['/bloques']);
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        this.toast.error('Correo o contraseña incorrectos.');
      } else if (error.message.includes('User already registered')) {
        this.toast.error('Este correo ya está registrado.');
      } else {
        this.toast.error('Ocurrió un error. Intenta de nuevo.');
      }
    } finally {
      this.isLoading = false;
    }
  }
}
