<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# NestJS Auth Boilerplate

[![NestJS](https://img.shields.io/badge/NestJS-Framework-red?style=flat-square&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue?style=flat-square)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-ORM-red?style=flat-square)](https://typeorm.io/)
[![Zod](https://img.shields.io/badge/Zod-Validation-blueviolet?style=flat-square)](https://zod.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=flat-square)](https://jwt.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue?style=flat-square)](https://www.docker.com/)
[![Mermaid](https://img.shields.io/badge/Mermaid-Diagrams-orange?style=flat-square)](https://mermaid.js.org/)
[![Winston](https://img.shields.io/badge/Winston-Logging-67a139?style=flat-square)](https://github.com/winstonjs/winston)
[![MailDev](https://img.shields.io/badge/MailDev-SMTP--Testing-blue?style=flat-square)](https://github.com/maildev/maildev)
[![k6](https://img.shields.io/badge/k6-Stress--Testing-black?style=flat-square&logo=k6)](https://k6.io/)

Boilerplate de autenticación, recuperación de cuenta basada en links de un solo uso (Stateless Links). Incluye monitoreo logs.

> [!IMPORTANT]
> **Notas:**
>
> - **Sin Swagger:** Implementación minimalista y manual de API. No se incluye Swagger para mantener el proyecto limpio.
> - **Cookies (HttpOnly):** Los tokens se envían como cookies `HttpOnly`, `Secure` y `SameSite=Lax`, mitigando ataques de XSS y CSRF.
> - **Extracción Híbrida (Auth):** La API soporta tanto el uso de Cookies (Navegador) como el header `Authorization: Bearer` (Postman).
> - **Integridad:** Transacciones manuales que aseguran que, si un cambio de clave falla, el borrado de sesiones anteriores se cancele automáticamente.
> - **Sesiones Simultáneas:** Soporta múltiples dispositivos (no se cierran sesiones al loguearse en otro).
> - **Rotación:** El `refresh_token` solo se rota si le quedan menos de 2 días de vida (Optimización de DB).
> - **Dynamic Modules:** Implementación de módulos desacoplados (Mail & Logger) usando el patrón estándar.
> - **Testing:** Infraestructura base de Jest ya está configurada. Actualmente no hay tests escritos; los tests unitarios y de integración (E2E) están planificados en el roadmap.
> - **Stress Testing:** Soporte nativo para pruebas de carga con **k6**.

---

## Documentación

Para una comprensión de la arquitectura y flujos:

- [Flujo de Identidad (JWT)](./docs/jwt-auth.md)
- [Flujo de Recuperación (Stateless)](./docs/password-reset.md)
- [Flujo de Autorización (RBAC)](./docs/roles-flow.md)
- [Arquitectura de Módulos](./docs/architecture.md)
- [Integración del Sistema](./docs/integration.md)
- [Modelo de Datos (ERD)](./docs/database.md)

---

## Configuración y Ejecución Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/froddodev/nest-auth-boilerplate.git
cd nest-auth-boilerplate
```

### 2. Variables de Entorno

Copia el archivo `.env.example` (o `.env.template`) a un nuevo archivo `.env`:

```bash
cp .env.example .env
```

#### General

| Variable         | Por Defecto | Descripción                                         |
| :--------------- | :---------- | :-------------------------------------------------- |
| `NODE_ENV`       | development | Entorno de ejecución (`development`, `production`). |
| `PROJECT_PREFIX` | api/v1      | Prefijo global de la API.                           |
| `PROJECT_PORT`   | 3000        | Puerto donde corre la aplicación.                   |

#### Base de Datos (PostgreSQL)

| Variable       | Por Defecto    | Descripción                                                  |
| :------------- | :------------- | :----------------------------------------------------------- |
| `DB_HOST`      | localhost      | Host de la base de datos.                                    |
| `DB_PORT`      | 5432           | Puerto de PostgreSQL.                                        |
| `DB_NAME`      | nest_auth_link | Nombre de la base de datos.                                  |
| `DB_USERNAME`  | postgres       | Usuario de la base de datos.                                 |
| `DB_PASSWORD`  | postgres       | Contraseña de la base de datos.                              |
| `TYPEORM_SYNC` | true           | Sincronización automática de entidades (Desactivar en prod). |

#### Seguridad (JWT)

| Variable                       | Por Defecto | Descripción                                                 |
| :----------------------------- | :---------- | :---------------------------------------------------------- |
| `JWT_SECRET`                   | -           | Clave secreta para firmar Access Tokens. (Cambiar en prod)  |
| `REFRESH_TOKEN_SECRET`         | -           | Clave secreta para firmar Refresh Tokens. (Cambiar en prod) |
| `JWT_EXPIRES_IN`               | 1h          | Duración del Access Token (formato string: 1h, 15m).        |
| `REFRESH_TOKEN_EXPIRES_IN`     | 7d          | Duración del Refresh Token (formato string: 7d, 30d).       |
| `REFRESH_TOKEN_THRESHOLD_DAYS` | 2           | Días restantes para autor rotación del refresh token.       |

#### Email (SMTP)

| Variable          | Por Defecto            | Descripción                                  |
| :---------------- | :--------------------- | :------------------------------------------- |
| `MAIL_HOST`       | localhost              | Servidor SMTP (ej. MailDev).                 |
| `MAIL_PORT`       | 1025                   | Puerto SMTP.                                 |
| `MAIL_SECURE`     | false                  | Uso de SSL/TLS.                              |
| `MAIL_IGNORE_TLS` | true                   | Ignorar certificados TLS (útil en dev).      |
| `MAIL_FROM`       | noreply@nestauth.local | Remitente por defecto.                       |
| `MAIL_USER`       | -                      | Usuario SMTP (si requiere autenticación).    |
| `MAIL_PASS`       | -                      | Contraseña SMTP (si requiere autenticación). |

#### Cliente / CORS

| Variable                 | Por Defecto           | Descripción                                               |
| :----------------------- | :-------------------- | :-------------------------------------------------------- |
| `FRONTEND_URL`           | http://localhost:5173 | URL del frontend (usado para links en emails).            |
| `FRONTEND_CORS`          | http://localhost:5173 | URLs permitidas en CORS.                                  |
| `COOKIE_SAMESITE`        | lax                   | Política SameSite para cookies (`lax`, `strict`, `none`). |
| `COOKIE_ACCESS_MAX_AGE`  | 3600000               | Tiempo de vida de la cookie de acceso en ms (1h).         |
| `COOKIE_REFRESH_MAX_AGE` | 604800000             | Tiempo de vida de la cookie de refresh en ms (7d).        |

#### Rate Limiting

| Variable         | Por Defecto | Descripción                           |
| :--------------- | :---------- | :------------------------------------ |
| `THROTTLE_TTL`   | 60000       | Ventana de tiempo por endpoint en ms. |
| `THROTTLE_LIMIT` | 20          | Peticiones máximas por endpoint.      |

#### Logging

| Variable      | Por Defecto | Descripción                                 |
| :------------ | :---------- | :------------------------------------------ |
| `LOG_CONSOLE` | true        | Habilitar logs en consola.                  |
| `LOG_LOCAL`   | false       | Guardar logs en archivos locales (`logs/`). |

### 3. Iniciar Base de Datos

El proyecto incluye configuración de Docker para levantar los servicios necesarios.

```bash
docker-compose up -d
```

Esto levantará **PostgreSQL** (puerto 5432), **Adminer** (puerto 8082) y **MailDev** (SMTP: 1025, Web: 1080).

### 5. Iniciar Aplicación

```bash
yarn install
yarn start:dev
```

---

## Referencia de API

### Base URL

```
http://localhost:3000/api/v1
```

### Resumen de Endpoints

| Método | Endpoint                 | Descripción                       |
| :----- | :----------------------- | :-------------------------------- |
| POST   | `/auth/register`         | Registro de nuevos usuarios       |
| POST   | `/auth/login`            | Login y generación de tokens      |
| POST   | `/auth/refresh`          | Rotación de Refresh Token         |
| POST   | `/auth/forgot-password`  | Solicitar link de recuperación    |
| POST   | `/auth/change-password`  | Cambiar clave usando Scoped JWT   |
| PATCH  | `/users/update-password` | Cambiar clave usuario autenticado |
| GET    | `/users/profile`         | Perfil del usuario autenticado    |
| GET    | `/users/admin`           | Solo acceso para administradores  |

---

### Detalle de Endpoints

#### 1. Autenticación Pública

**Registro**

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Nombre Completo"
}
```

_Respuesta exitosa (201)_: Datos del usuario creado (Rol `user` por defecto).

> [!NOTE]
> Por seguridad, el rol `admin` solo se puede asignar mediante migraciones de base de datos.

**Login**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

_Respuesta exitosa (200)_: Datos del usuario y tokens (Enviados también como **HttpOnly Cookies**).

> [!TIP]
> **Compatibilidad**: Aunque se prefieren cookies, para clientes Postman, puedes seguir enviando el token en el header.

**Refresh Token**

```http
POST /auth/refresh
Content-Type: application/json

{
  "token": "refresh_token"
}
```

_Respuesta exitosa (200)_: Cookies actualizadas automáticamente.

> [!NOTE]
> **Hybrid Auth**: La API acepta el token tanto en el cuerpo de la petición (`token`) como en la cookie `refresh_token`.

**Solicitar Recuperación de Contraseña**

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

_Respuesta exitosa (200)_: Correo de recuperación enviado.

#### 2. Endpoints Protegidos

Los decoradores y los guards detectan automáticamente al usuario ya sea por **Cookie** o por **Bearer Token**.

**Obtener Perfil**

```http
GET /users/profile
Authorization: Bearer {access_token}
```

_Respuesta exitosa (200)_: Datos del perfil del usuario autenticado.

**Acceso Admin (Prueba de Roles)**

```http
GET /users/admin
Authorization: Bearer {access_token_admin_role}
```

_Respuesta exitosa (200)_: Mensaje de confirmación de acceso.

**Actualizar Contraseña (Usuario Autenticado)**

```http
PATCH /users/update-password
Authorization: Bearer {access_token}

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

_Respuesta exitosa (200)_: Contraseña actualizada y todas las sesiones invalidadas.

**Cambiar Contraseña (Con Token de Recuperación)**

```http
POST /auth/change-password
Authorization: Bearer {reset_token_from_email}

{
  "newPassword": "newpassword123"
}
```

_Respuesta exitosa (200)_: Contraseña restablecida correctamente.

---

## Limitación de Peticiones (Rate Limiting)

Para proteger los servicios de abusos y ataques de fuerza bruta, el sistema implementa **limitación de peticiones**.

_Respuesta (429)_: Superar el límite de 20 peticiones/min por endpoint bloquea el acceso temporalmente.

## Pruebas de Correo

Si usas la configuración por defecto (MailDev), puedes visualizar los correos enviados accediendo a [http://localhost:1080](http://localhost:1080).

## Rendimiento y Pruebas de Carga (k6)

Para asegurar la resiliencia del sistema bajo carga, ataques de fuerza bruta o picos de tráfico, se incluye soporte para **Stress Testing** con k6.

### Comandos de Pruebas

Puedes ejecutar diferentes suites de pruebas según el módulo:

| Comando                   | Descripción                                                   |
| :------------------------ | :------------------------------------------------------------ |
| `yarn k6:login`           | Suite completa de estrés para el endpoint de login.           |
| `yarn k6:register`        | Suite completa de estrés para el endpoint de register.        |
| `yarn k6:forgot-password` | Suite completa de estrés para el endpoint de forgot-password. |
| `yarn k6:change-password` | Suite completa de estrés para el endpoint de change-password. |

> _Nota: Cada comando ejecuta escenarios de **Load**, **Stress**, **Spike** y **Smoke**._

### Instalación de k6

Para ejecutar las pruebas de carga, es necesario tener instalado **k6**, las instrucciones detalladas aquí: [Guía de instalación de k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

### Configuración

Las pruebas utilizan su propio archivo de configuración:

- **Archivo**: `test/stress/config/default.k6.json`
- **Variables**: `base_url`, `user`, `password`, `full_name`, `access_token`, `purpose_token`.

### Resultados de Referencia (Auth Login)

| Escenario   | Usuarios Concurrentes | Latencia P95 | Éxito (%) |
| :---------- | :-------------------: | :----------: | :-------: |
| Load Test   |           2           |   < 100ms    |   100%    |
| Stress Test |           5           |   < 150ms    |   100%    |
| Spike Test  |          10           |   < 500ms    |   ~90%    |
| Smoke Test  |           1           |   < 200ms    |   100%    |

> [!NOTE]
> Los fallos (429) durante el `Spike Test` son producto del **Throttler** protegiendo los recursos (comportamiento esperado). Se permite un margen de error del 10% en este escenario.

---

## Posibles Implementaciones

Implementar cambios o nuevas funciones en la lógica de negocio es sumamente sencillo gracias a la organización del código. Algunas mejoras propuestas:

1.  **OTP (One-Time Password):** Cambiar los links de recuperación por códigos de 6 dígitos.
2.  **Prevención de Fuerza Bruta:** Bloqueo temporal de cuentas tras intentos fallidos.

---

> [!NOTE]
> **Nota del Desarrollador:**
> Este boilerplate es de uso totalmente libre para que lo uses como base en cualquier proyecto. El código está diseñado para ser limpio y desacoplado, así que implementar Unit Tests o E2E será un proceso muy fluido si decides escalarlo. Úsalo bajo tu propia responsabilidad; no me hago cargo de fallos técnicos o de seguridad en implementaciones externas.
>
> "Oye, pero ya eres un León en una selva de gatitos." 🦁
>
> Espero te sirva, éxito!

---

## Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).
