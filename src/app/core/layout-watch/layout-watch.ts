import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-watch',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div
      class="h-screen w-screen bg-background text-white flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-transparent"
    >
      <router-outlet></router-outlet>
    </div>
  `,
})
export class LayoutWatch {}
