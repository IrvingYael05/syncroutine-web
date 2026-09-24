import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VinculacionService, VincularRequest } from '../../core/services/vinculacion/vinculacion';
import { AuthService } from '../../core/services/auth/auth';
import { ToastService } from '../../core/services/toast/toast.service';
import { RouterLink } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-vinculacion',
  standalone: true,
  imports: [CommonModule, RouterLink, QRCodeComponent],
  templateUrl: './vinculacion.html',
})
export class Vinculacion implements OnInit, OnDestroy {
  private vinculacionService = inject(VinculacionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  qrCodeData: string = '';
  isLoading = true;
  private refreshInterval: any;

  ngOnInit() {
    this.prepararVinculacion();

    this.refreshInterval = setInterval(() => {
      this.isLoading = true;
      this.prepararVinculacion();
    }, 600000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async prepararVinculacion() {
    try {
      const user = await this.authService.getCurrentUser();
      const session = await this.authService.getFullSession();

      if (!user || !session) {
        this.toast.error('No se pudo verificar tu sesión.');
        this.isLoading = false;
        return;
      }

      this.vinculacionService.generarPin().subscribe({
        next: (status) => {
          const pinGenerado = status.pin;
          const request: VincularRequest = {
            pin: pinGenerado,
            userId: user.id,
            token: session.access_token,
            refreshToken: session.refresh_token,
          };

          this.vinculacionService.vincular(request).subscribe({
            next: () => {
              this.qrCodeData = pinGenerado;
              this.isLoading = false;
            },
            error: () => {
              this.toast.error('Error al asociar la sesión al código QR.');
              this.isLoading = false;
            },
          });
        },
        error: () => {
          this.toast.error('No se pudo generar el código de vinculación.');
          this.isLoading = false;
        },
      });
    } catch (error) {
      this.toast.error('Error interno al preparar la vinculación.');
      this.isLoading = false;
    }
  }
}
