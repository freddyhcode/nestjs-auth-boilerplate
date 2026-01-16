### Arquitectura de Módulos

```mermaid
flowchart TD
    AppModule --> CoreModule
    AppModule --> AuthModule
    AppModule --> UserModule
    AppModule --> ServicesModule

    CoreModule --> ConfigModule
    CoreModule --> LoggerModule
    ServicesModule --> MailModule
```
