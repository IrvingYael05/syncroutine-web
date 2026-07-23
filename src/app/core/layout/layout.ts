import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth/auth';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  // Implementa OnInit
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isLoading = false;

  // Variables para la interfaz
  userInitial = 'U';
  userName = 'Usuario';
  userEmail = 'usuario@correo.com';

  ngOnInit() {
    // Escuchamos al usuario actual
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userEmail = user.email || '';
        const nombreCompleto = user.user_metadata?.['nombre'] || this.userEmail;
        this.userName = nombreCompleto;
        if (nombreCompleto.length > 20) {
          this.userName = nombreCompleto.slice(0, 20) + '...';
        }
        this.userInitial = nombreCompleto.charAt(0).toUpperCase();
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  async logout() {
    this.isLoading = true;
    await this.authService.signOut();
    this.isLoading = false;
    this.toast.success('Sesión cerrada correctamente');

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 500);
  }
}
