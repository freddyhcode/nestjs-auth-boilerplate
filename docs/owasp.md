# OWASP Top 10

[Más información en el sitio oficial de OWASP (2025)](https://owasp.org/Top10/2025/)

[x] A01:2025 – Broken Access Control (Guards, RBAC, Admin no asignable vía API solo migraciones)
[x] A02:2025 – Security Misconfiguration (Parcial: Depende de usar HTTPS y claves)
[!] A03:2025 – Software Supply Chain Failures (Parcial: Falta integración de escaneo de dependencias ejemplo: GitHub Action)
[x] A04:2025 – Cryptographic Failures (JWT secretos separados, Refresh Token en DB, Cookies HttpOnly)
[x] A05:2025 – Injection (DTOs + class-validator, Zod, TypeORM)
[x] A06:2025 – Insecure Design (Arquitectura modular, transacciones manuales)
[x] A07:2025 – Authentication Failures (Rate limiting, Rotación de tokens, Invalidación de sesiones)
[x] A08:2025 – Software or Data Integrity Failures (Uso de transacciones para asegurar coherencia de datos)
[x] A09:2025 – Logging & Alerting Failures (Winston estructurado en JSON listo)
[x] A10:2025 – Mishandling of Exceptional Conditions (Global Filter para manejo seguro de errores y uso de errores genericos donde se debe)
