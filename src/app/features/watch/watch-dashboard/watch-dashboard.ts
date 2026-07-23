import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BloquesService, Bloque } from '../../../core/services/bloques/bloques';
import { AuthService } from '../../../core/services/auth/auth';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-watch-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watch-dashboard.html'
})
export class WatchDashboard implements OnInit {
  private bloquesService = inject(BloquesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  bloques: Bloque[] = [];
  isLoading = true;
  isLoggingOut = false;
  currentIndex = 0; 

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.bloquesService.getByUserId(user.id).subscribe({
        next: (data) => {
          this.bloques = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.router.navigate(['/watch/pin']);
    }
  }

  nextRoutine() {
    if (this.currentIndex < this.bloques.length - 1) {
      this.currentIndex++;
    }
  }

  prevRoutine() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  iniciarBloque(bloqueId: string) {
    this.router.navigate(['/watch/player', bloqueId]);
  }

  async logout() {
    this.isLoggingOut = true;
    await this.authService.signOut();
    this.toast.success('Sesión del reloj cerrada');
    this.router.navigate(['/watch/pin']);
  }
}