import { Injectable, inject } from '@angular/core';
import { User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from '../supabase/supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public supabaseClient = inject(SupabaseService).supabase;

  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    // Escuchar cambios de sesión (login, logout)
    this.supabaseClient.auth.onAuthStateChange((event, session: Session | null) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  // Obtener el estado actual del usuario como Observable
  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  // Verifica si hay una sesión activa de forma síncrona
  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.supabaseClient.auth.getSession();
    return !!data.session;
  }

  // Método para iniciar sesión
  async signIn(email: string, password: string) {
    return await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
  }

  // Método para registrarse pasando el "nombre" como meta-data
  async signUp(email: string, password: string, nombre: string) {
    return await this.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre, // Esto dispara un Trigger en PostgreSQL
        },
      },
    });
  }

  // Obtener la sesión completa del usuario
  async getFullSession() {
    const { data, error } = await this.supabaseClient.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // Obtener el usuario actual
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabaseClient.auth.getUser();
    return data.user;
  }

  // Actualizar la contraseña en Supabase
  async updatePassword(newPassword: string) {
    return await this.supabaseClient.auth.updateUser({ password: newPassword });
  }

  // Cerrar sesión
  async signOut() {
    return await this.supabaseClient.auth.signOut();
  }
}
