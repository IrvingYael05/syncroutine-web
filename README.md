# SyncRoutine Web Client

SyncRoutine es un ecosistema de productividad y alto rendimiento que permite a los usuarios diseñar, gestionar y ejecutar bloques de tareas estructuradas. Este cliente web actúa como el centro de mando principal, ofreciendo creación de rutinas, análisis de métricas históricas y un puente de vinculación seguro para dispositivos IoT (Smartwatches y/o Smart TVs).

## Características Principales

- **Creador de Bloques:** Interfaz reactiva para diseñar secuencias de tareas (ordenadas o aleatorias) con tiempos objetivos precisos.
- **Device Pairing (Flujo IoT):** Sistema de vinculación de dispositivos en tiempo real mediante validación de PIN criptográfico de 6 dígitos.
- **Dashboard Analítico:** Gráficas interactivas para medir la precisión, rachas diarias y desviaciones de tiempo frente a los objetivos planificados.
- **Arquitectura Serverless Auth:** Gestión de sesiones segura impulsada por Supabase, manejando JWTs y _Refresh Tokens_ en entornos aislados.

## Stack Tecnológico

- **Framework:** Angular 18+ (Standalone Components)
- **Estilos:** Tailwind CSS (Paleta y directivas personalizadas)
- **Gráficas:** ApexCharts
- **Autenticación:** Supabase JS Client

## Configuración del Entorno

1. Clona el repositorio e instala dependencias:

   ```bash
   git clone https://github.com/IrvingYael05/syncroutine-web.git
   cd syncroutine-web
   npm install

   ```

2. Configura las variables de entorno. Duplica el archivo environment.example.ts hacia environment.ts y añade tus llaves de Supabase:

    ```TypeScript
    export const environment = {
    production: false,
    supabaseUrl: 'TU_SUPABASE_URL',
    supabaseKey: 'TU_SUPABASE_ANON_KEY',
    apiUrl: 'http://localhost:8080/api'
    };
    ```

3. Despliega el servidor de desarrollo:

    ```Bash
    ng serve
    ```
