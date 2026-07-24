import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NgIf, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  isMenuOpen = false;
  isTermsOpen = false;
  isPrivacyOpen = false;
  isTouch = false;

  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  // Formulario de contacto
  contactForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mensaje: ['', Validators.required],
  });

  onMouseEnter() {
    if (!this.isTouch) this.isMenuOpen = true;
  }
  onMouseLeave() {
    if (!this.isTouch) this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Solución al problema del scroll
  scrollTo(sectionId: string) {
    this.isMenuOpen = false; // Cerramos el menú de hamburguesa
    const element = document.getElementById(sectionId);
    if (element) {
      // Scroll suave y preciso hasta el inicio de la sección
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Controladores de Modales
  openTerms() {
    this.isTermsOpen = true;
  }
  closeTerms() {
    this.isTermsOpen = false;
  }

  openPrivacy() {
    this.isPrivacyOpen = true;
  }
  closePrivacy() {
    this.isPrivacyOpen = false;
  }

  // Acción del botón de contacto
  submitContact() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    // Simulamos el envío (En el futuro podrías conectarlo a un servicio como Resend o EmailJS)
    this.toast.success('Mensaje enviado. Nos pondremos en contacto pronto.');
    this.contactForm.reset();
  }
}
