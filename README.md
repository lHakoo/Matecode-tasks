# MateCode Tasks

Aplicación SPA de gestión de tareas para empleados, desarrollada para un cliente de **MateCode**. Permite registrarse, iniciar sesión, gestionar tareas propias (CRUD) con persistencia en la nube y enviarse un resumen de tareas por email.

## Descripción del proyecto

Cada usuario se registra con email y contraseña, inicia sesión y accede a un panel privado donde puede crear, editar, completar y eliminar sus propias tareas. Los datos se guardan en Cloud Firestore, filtrados por `userId`, con actualización en tiempo real de la UI. Desde el panel, el usuario puede pedir que se le envíe por email un resumen del estado de sus tareas; ese envío lo hace una Vercel Function usando AWS SES, para que las credenciales de AWS nunca lleguen al navegador.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + React Router + Tailwind CSS
- **BaaS:** Firebase Authentication (email/password) + Cloud Firestore
- **Email:** AWS SES, invocado desde una Vercel Function (`/api/send-summary`)
- **Testing:** Vitest + React Testing Library
- **Deploy:** Vercel

## Decisiones arquitectónicas

- **Separación por capas** (`components`, `pages`, `services`, `hooks`, `types`, `routes`, `utils`): la UI nunca llama directo al SDK de Firebase, siempre pasa por `services/`, para poder testear la lógica sin depender de la librería real y para poder reemplazar Firebase el día de mañana sin tocar componentes.
- **`onSnapshot` en vez de `getDocs`**: las tareas se leen con un listener en tiempo real, así la UI se actualiza sola tras cualquier operación CRUD (propia o de otra pestaña) sin refrescar manualmente.
- **AWS SES nunca en el frontend**: el envío de email vive exclusivamente en `api/send-summary.ts` (Vercel Function). El cliente solo hace `fetch('/api/send-summary')`; las credenciales de AWS son variables de entorno del servidor.
- **Autenticación con Context (`useAuth`)**: un solo listener de `onAuthStateChanged` en toda la app, expuesto vía contexto, para que `ProtectedRoute` y cualquier componente sepan el estado de sesión sin duplicar lógica.
- **Reglas de seguridad de Firestore** (no incluidas como archivo de config de Firebase, pero necesarias en el proyecto real) deben exigir `request.auth.uid == resource.data.userId` tanto para lectura como escritura, así el filtrado por usuario no depende solo del `where('userId', '==', uid)` del cliente.

## Estructura del proyecto

```
src/
├─ pages/          # LoginPage, RegisterPage, TasksPage
├─ components/      # TaskForm, TaskList, TaskItem, TaskFilters, Navbar
├─ services/        # firebase.ts, authService.ts, taskService.ts, emailService.ts
├─ routes/          # AppRouter, ProtectedRoute
├─ hooks/           # useAuth, useTasks
├─ types/           # Task, AppUser
└─ utils/           # validation.ts
api/
└─ send-summary.ts  # Vercel Function: arma y envía el email con AWS SES
tests/
├─ components/      # TaskForm.test.tsx, TaskList.test.tsx
├─ services/        # taskService.test.ts (mock del SDK de Firestore)
├─ utils/           # validation.test.ts
└─ mocks/           # firebase.mock.ts
```

## Instrucciones de instalación

1. Clonar el repo e instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y completar los valores (ver sección siguiente).
3. Correr en desarrollo:
   ```bash
   npm run dev
   ```
4. Correr los tests:
   ```bash
   npm test
   ```
5. Build de producción:
   ```bash
   npm run build
   ```

### Configurar Firebase (pendiente de hacer por el equipo del proyecto)

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilitar **Authentication → Email/Password**.
3. Crear una base de **Cloud Firestore** (modo producción).
4. Cargar las Security Rules, por ejemplo:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{taskId} {
         allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```
5. Copiar las claves del SDK web al `.env` (prefijo `VITE_FIREBASE_...`).

### Configurar AWS SES (pendiente de hacer por el equipo del proyecto)

1. Verificar un email o dominio remitente en la consola de AWS SES.
2. Si la cuenta está en modo sandbox, verificar también los emails destinatarios de prueba.
3. Crear un usuario IAM con permiso `ses:SendEmail` y generar sus credenciales.
4. Cargar `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `SES_SENDER_EMAIL` como variables de entorno **en Vercel** (Project Settings → Environment Variables), no solo en el `.env` local.

## Variables de entorno necesarias

Ver `.env.example`. Resumen:

| Variable | Dónde se usa | Secreta |
|---|---|---|
| `VITE_FIREBASE_API_KEY` y demás `VITE_FIREBASE_*` | Frontend (Firebase SDK) | No (protegidas por Security Rules) |
| `AWS_REGION` | Vercel Function | No |
| `AWS_ACCESS_KEY_ID` | Vercel Function | Sí |
| `AWS_SECRET_ACCESS_KEY` | Vercel Function | Sí |
| `SES_SENDER_EMAIL` | Vercel Function | No |

## URL de producción

https://matecode-tasks-phi.vercel.app

## Flujo de envío de emails

1. En `TasksPage`, el usuario hace clic en **"Enviar resumen por email"**.
2. `emailService.sendTaskSummaryEmail` arma un resumen (total, completadas, pendientes, títulos) y hace `POST /api/send-summary`.
3. La Vercel Function `api/send-summary.ts` valida el body, arma un HTML simple del resumen y llama a `SendEmailCommand` del SDK de AWS SES usando las credenciales de entorno del servidor.
4. La función responde `200` si SES aceptó el envío, o un error controlado (`400`/`502`) que el frontend muestra al usuario.

## Cómo integré la IA en mi proceso de trabajo

_(Sección a completar por el desarrollador con su experiencia real. Sugerencia de estructura: en qué partes fue más útil —por ejemplo scaffolding de capas, escritura de tests, o traducción de errores de Firebase a mensajes de usuario—, en qué partes hubo que corregirla a mano, y qué patrones de prompting o de revisión de código generado por IA resultaron más efectivos.)_

## Extra credit

- **Filtro de tareas** (`TaskFilters`): todas / pendientes / completadas.
- **Drag & drop para reordenar** (`dnd-kit`): cada tarea tiene un campo `order` en Firestore; al soltar una tarjeta se recalculan los índices y se persisten en un solo `writeBatch`. Solo está habilitado cuando el filtro es "Todas" y el orden es "Orden manual" (si no, arrastrar no tendría sentido visual).
- **Fechas de vencimiento y prioridad**: el formulario permite asignar prioridad (alta/media/baja) y una fecha opcional de vencimiento. Un selector de orden permite ver las tareas por prioridad o por fecha de vencimiento en vez del orden manual; las tareas vencidas y no completadas se resaltan en rojo.

> Nota: como ahora la consulta principal ordena por `order` en vez de `createdAt`, si ya tenías el índice compuesto viejo (`userId` + `createdAt`) vas a necesitar uno nuevo para `userId` + `order`. Firestore te va a mostrar el link para crearlo automáticamente la primera vez que cargue la página con este código (mismo mecanismo que la primera vez).
