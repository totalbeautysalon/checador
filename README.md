# Total Beauty - Checador de Asistencia 📸

Sistema de registro y control de asistencias para el personal de **Total Beauty Salón y Academia**, diseñado con Next.js, Tailwind CSS, NextAuth y Firebase (Authentication + Firestore).

---

## ✨ Características Principales

- **📸 Checador Fotográfico**: Captura de fotografía de seguridad en tiempo real al registrar entrada y salida de cada trabajadora.
- **🔐 Firebase Authentication & Firestore**: Validación directa contra usuarios y contraseñas registrados en la consola de Firebase.
- **📊 Autogestión de Horas**: Las trabajadoras pueden consultar sus horas acumuladas de la quincena actual y su meta quincenal de horas.
- **👑 Panel Administrativo de Gerencia**:
  - Supervisión y aprobación de asistencias de la quincena actual.
  - Historial y filtros por quincenas anteriores.
  - Configuración de metas de horas por colaboradora.
- **🛡️ Aislamiento de Sesión**: Corre en el puerto `3333` con perfiles de navegador aislados para evitar conflictos con el sistema de Recepción o Intranet.
- **🖥️ Modo Aplicación de Escritorio**: Scripts de arranque (`Arrancar_Checador.bat` y `Checador_Invisible.vbs`) para abrir directamente como ventana de software independiente con pantalla de precarga.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Autenticación**: [NextAuth.js](https://next-auth.js.org/) + Google Identity Toolkit (Firebase Auth REST)
- **Base de Datos**: [Google Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Notificaciones**: [React Hot Toast](https://react-hot-toast.com/)

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) v18.17 o superior.
- Navegador moderno compatible con MediaDevices API (Microsoft Edge / Google Chrome).
- Cámara web conectada y funcional.

---

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/<TU_USUARIO>/Total_Beauty_Checador.git
   cd Total_Beauty_Checador
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   copy .env.example .env
   ```
   Asegúrate de que contenga:
   ```env
   NEXTAUTH_URL="http://localhost:3333"
   NEXTAUTH_SECRET="super-secret-key-change-me-in-production"
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

4. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3333](http://localhost:3333) en tu navegador.

5. **Compilar para producción**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🖥️ Uso como Software de Escritorio en Windows

El proyecto incluye archivos listos para usar en la computadora del salón:
- **`Arrancar_Checador.bat`**: Inicia el servidor de Next.js en segundo plano (si no está encendido) y abre Microsoft Edge en modo aplicación maximizada sin barras de navegación.
- **`Cargando_Checador.html`**: Pantalla de carga inteligente que verifica la disponibilidad del servidor antes de redirigir al login.
- **`Checador_Invisible.vbs`**: Ejecuta el archivo batch de manera silenciosa sin mostrar ventanas negras de consola (CMD).

---

## 📄 Licencia

Uso exclusivo de **Total Beauty Salón y Academia**.
