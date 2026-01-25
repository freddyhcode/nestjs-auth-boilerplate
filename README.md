<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# NestJS Auth Boilerplate

<div align="center">

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

</div>

Boilerplate de autenticación, recuperación de cuenta basada en links de un solo uso (Stateless Links). Incluye monitoreo logs.

> [!NOTE]
> **Notas:**
>
> - **Sin Swagger:** Implementación minimalista y manual de API. No se incluye Swagger para mantener el proyecto limpio.
> - **Cookies (HttpOnly):** Los tokens se envían como cookies `HttpOnly`, `Secure` y `SameSite=Lax`, mitigando ataques de XSS y CSRF.
> - **Hashing:** Se usa para evitar el crackeo por GPU (posible en Bcrypt). Argon2 obliga a que el ataque use RAM, haciéndolo mucho más difícil y costoso.
> - **Extracción Híbrida (Auth):** La API soporta tanto el uso de Cookies (Navegador) como el header `Authorization: Bearer` (Postman).
> - **Integridad:** Transacciones manuales que aseguran que, si un cambio de clave falla, el borrado de sesiones anteriores se cancele automáticamente.
> - **Sesiones Simultáneas:** Soporta múltiples dispositivos (no se cierran sesiones al loguearse en otro).
> - **Rotación:** El `refresh_token` solo se rota si le quedan menos de 2 días de vida (Optimización de DB).
> - **Dynamic Modules:** Implementación de módulos desacoplados (Mail & Logger) usando el patrón estándar.
> - **Testing:** Infraestructura base de Jest ya está configurada. Actualmente no hay tests escritos; los tests unitarios y de integración (E2E) están planificados en el roadmap.
> - **Stress Testing:** Soporte nativo para pruebas de carga con **k6**.

---

> [!IMPORTANT]
> **Seguridad (OWASP 2025)**
>
> Se intentaron cubrir todas las OWASP posibles. Este proyecto ha sido diseñado siguiendo los estándares de **OWASP Top 10 (2025)** para garantizar una arquitectura robusta contra las vulnerabilidades más críticas.
>
> [Ver documento](docs/owasp.md)

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

#### JWT

| Variable                       | Por Defecto | Descripción                                                                      |
| :----------------------------- | :---------- | :------------------------------------------------------------------------------- |
| `JWT_SECRET`                   | -           | Clave secreta para firmar los Access Tokens de sesión corta.                     |
| `JWT_PASSWORD_RESET_SECRET`    | -           | Clave secreta dedicada exclusivamente para tokens de recuperación de contraseña. |
| `REFRESH_TOKEN_SECRET`         | -           | Clave secreta para firmar Refresh Tokens. (Cambiar en prod)                      |
| `JWT_EXPIRES_IN`               | 1h          | Duración del Access Token (formato string: 1h, 15m).                             |
| `REFRESH_TOKEN_EXPIRES_IN`     | 7d          | Duración del Refresh Token (formato string: 7d, 30d).                            |
| `REFRESH_TOKEN_THRESHOLD_DAYS` | 2           | Días restantes para autor rotación del refresh token.                            |

#### Cliente / CORS

| Variable                 | Por Defecto           | Descripción                                                               |
| :----------------------- | :-------------------- | :------------------------------------------------------------------------ |
| `FRONTEND_URL`           | http://localhost:5173 | URL del frontend (usado para links en emails).                            |
| `FRONTEND_CORS`          | http://localhost:5173 | URLs permitidas en CORS.                                                  |
| `COOKIE_SAMESITE`        | lax                   | Política SameSite para cookies (`lax`, `strict`, `none`).                 |
| `COOKIE_ACCESS_MAX_AGE`  | 3600000               | Tiempo de vida de la cookie de acceso en ms (1h).                         |
| `COOKIE_REFRESH_MAX_AGE` | 604800000             | Tiempo de vida de la cookie de refresh en ms (7d).                        |
| `COOKIE_CREDENTIALS`     | false                 | Permite el intercambio de cookies en peticiones de origen cruzado (CORS). |

#### Anti-Enumeration

| Variable              | Por Defecto   | Descripción                                                                                                                                                                      |
| :-------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DUMMY_HASH_PASSWORD` | (Argon2 Hash) | Hash utilizado para mitigar Timing Attacks. Debe generarse con los mismos parámetros de Argon2 que las contraseñas reales para igualar la carga de CPU en usuarios inexistentes. |

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

#### Infraestructura y Red

| Variable      | Por Defecto | Descripción                                                                                  |
| :------------ | :---------- | :------------------------------------------------------------------------------------------- |
| `TRUST_PROXY` | 0           | Número de saltos de confianza (Hops). Vital para obtener la IP real tras proxies/Cloudflare. |

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

**Cambiar Contraseña (Con Token de Recuperación)**

```http
POST /auth/change-password
Authorization: Bearer {reset_token_from_email}

{
  "newPassword": "newpassword123"
}
```

_Respuesta exitosa (200)_: Contraseña restablecida correctamente.

#### 2. Endpoints Usuario

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

_Respuesta exitosa (200)_: Contraseña actualizada correctamente.

---

## Mitigación de Timing Attacks

Para evitar la **enumeración de usuarios** (que un atacante sepa qué correos están registrados), este boilerplate implementa una defensa de doble capa en los flujos de autenticación.

### 1. Estrategia de "Dummy Hash"

Garantiza que el servidor realice el mismo esfuerzo computacional independientemente de si el usuario existe o no. Si el email no se encuentra en la base de datos, el sistema verifica un "hash fantasma" para que el uso de CPU (Argon2id) sea idéntico al de una sesión real.

```bash
# Comando para generar este hash (password de 128 caracteres, alta entropía):
node -e "require('argon2').hash('tu_password_enerada',{ memoryCost: 65536, timeCost: 3, parallelism: 4, type: 0 }).then(console.log)"
# Ejemplo de salida:: DUMMY_HASH_PASSWORD=$argon2id$v=19$m=65536,t=3,p=4$6Q...
```

> [!IMPORTANT]
> El parámetro `type: 0` asegura que sea **Argon2id**.

### 2. Estrategia de "Tiempo Constante" (Protección de Red)

Incluso con el mismo trabajo de CPU, tareas como la firma de JWT o el envío de correos añaden pequeñas variaciones de tiempo. Utilizamos un mecanismo de **Normalización de latencia** en los endpoints de `login` y `forgot-password`.

- **Funcionamiento:** Se calcula el tiempo de ejecución y se aplica un retardo dinámico para alcanzar un umbral mínimo (ejemplo: 207ms - 310ms).
- **Resultado:** La respuesta del servidor es estadísticamente indistinguible para un observador externo, neutralizando los **Timing Attacks**.

| Escenario         | Trabajo de CPU | Latencia de Red | Resultado Externo |
| :---------------- | :------------- | :-------------- | :---------------- |
| **Usuario Real**  | Argon2 Real    | Normalizado     | ~207ms            |
| **Usuario Falso** | Argon2 Dummy   | Normalizado     | ~209ms            |

- [Flujo de Mitigación de Timing Attacks (Nivelación de Latencia)](./docs/timing-attack-protection.md)

> [!NOTE]
> Imagina que, baja dios y le da el password de 128 caracteres a un atacante. Cuando lo envíe a la API, la validación criptográfica será **verdadera** (porque el password coincide con el dummy hash), pero el usuario seguirá siendo **nulo** (porque el email no existe en la base de datos), por lo que el sistema lo echa de inmediato por falta de identidad.
>
> El `DUMMY_HASH_PASSWORD` es solo un señuelo para gastar CPU y tiempo. Es una puerta que no lleva a ninguna parte.
>
> El uso del `DUMMY_HASH_PASSWORD`, como dijo Dumbledore: _“Es un hechizo simple pero inquebrantable.”_

---

## Infraestructura: Real IP & Trust Proxy

Es crítico que la API identifique correctamente la dirección IP real del cliente. Sin esto, los sistemas de seguridad como Throttling (Rate Limiting), bloqueando al proxy en lugar del atacante.

### El Problema del "IP Masking"

Cuando la API corre detrás de proxies reversos (Nginx, Dokploy/Traefik, Cloudflare), NestJS ve por defecto la IP interna del contenedor, perdiendo la IP original del usuario.

### Solución: Configuración Dinámica de `TRUST_PROXY`

El boilerplate implementa una lógica para confiar en la cabecera `X-Forwarded-For`.

| Valor | Escenario Típico        | Explicación                                                             |
| :---- | :---------------------- | :---------------------------------------------------------------------- |
| `0`   | **Localhost**           | (Default) Desarrollo local. La API recibe la conexión directa.          |
| `1`   | **Docker / VPS**        | Un solo proxy delante (ej. Nginx o Traefik). Confía en el último salto. |
| `2`   | **Cloudflare + Docker** | Arquitectura de doble capa. Confía en los últimos 2 saltos.             |

### Entendiendo los Saltos (Hops)

El número en `TRUST_PROXY` indica cuántos servidores "de confianza" debe saltar NestJS hacia atrás para encontrar la IP real.

- [Escenario: Cloudflare + Dokploy](./docs/docs/trust-proxy-guide.md)

> [!WARNING]
> Aviso de Seguridad Nunca actives TRUST_PROXY (ni pongas un número > 0) si tu API está expuesta directamente a internet sin un proxy delante. Esto permitiría a un atacante suplantar su identidad (IP Spoofing) enviando una cabecera X-Forwarded-For falsa, bypasseando tus límites de seguridad.

---

## Control de Tráfico (Rate Limiting)

Para proteger la disponibilidad del sistema y mitigar ataques de Fuerza Bruta o DoS, estrategia de limitación de peticiones (Throttling) en dos niveles.

### Niveles de Protección

| Capa         | Alcance                                       | Configuración            | Propósito                                                                 |
| :----------- | :-------------------------------------------- | :----------------------- | :------------------------------------------------------------------------ |
| **Default**  | Toda la API                                   | (`THROTTLE_LIMIT`)       | Evitar el abuso general de recursos y scraping masivo.                    |
| **Estricta** | Auth (`login`, `register`, `forgot-password`) | Hardcoded: 5 req / 1 min | Bloquear ataques de diccionarios y enumeración de usuarios (hardcodeado). |

> [!NOTE]
> Utiliza la IP real del cliente para el conteo de peticiones, gracias a la integración con `TRUST_PROXY`.
> **Detrás de Proxy:** Si un atacante usa un proxy, el Throttler detecta la IP original en el header `X-Forwarded-For`.
> **Aislamiento:** Un bloqueo a un atacante no afectará a otros usuarios legítimos.
> Respuesta de Error (429), Cuando se excede el límite, la API responde con el estándar.

---

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

## Pruebas de Correo

Si usas la configuración por defecto (MailDev), puedes visualizar los correos enviados accediendo a [http://localhost:1080](http://localhost:1080).

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
