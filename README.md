# Electron Dependency Injection (Electron DI)

Este proyecto proporciona un sistema de inyección de dependencias y manejo de controladores IPC para aplicaciones construidas con Electron y TypeScript.

## Estructura del Proyecto

- `constants.ts`: Define constantes utilizadas en el proyecto.
- `decorators.ts`: Contiene decoradores para facilitar la inyección de dependencias y el manejo de IPC en Electron.
- `container.ts`: Implementa el contenedor de dependencias y la resolución de módulos.
- `bootstrap.ts`: Configura y registra los módulos y controladores IPC en la aplicación Electron.
- `utils.ts`: Proporciona funciones auxiliares y gestión de errores.
- `types.ts`: Define los tipos utilizados en el sistema de inyección de dependencias.

## Instalación

* En tu aplicacion de electron:
   ```sh
   npm install electron-di
   ```

## Uso

Puedes utilizar los decoradores y la inyección de dependencias en tu aplicación Electron de la siguiente manera:

```typescript
import { Injectable, Controller, Inject, Module, Bootstrap, OnInvoke } from "electron-di";

@Injectable()
export class AppRepository {
    rendomName() {
        const names = ['John', 'Jane', 'Jack', 'Jill', 'Bob', 'Bill', 'Steve', 'Tom'];
        return names[Math.floor(Math.random() * names.length)];
    }
}

@Injectable()
export class AppService {
    constructor(
        @Inject(AppRepository) private readonly appRepository: AppRepository
    ) {}

    getAppInfo() {
        return {
            name: this.appRepository.rendomName(),
            version: '0.0.0'
        };
    }
}

@Controller('app')
export class AppController {
    constructor(
        @Inject(AppService) private readonly appService: AppService,
    ) {}

    @OnInvoke('randomInfo')
    async getAppInfo() {
        return this.appService.getAppInfo();
    }

    @OnInvoke('fixedValue')
    async fixed() {
        return "valor fijo";
    }
}

@Module({
    providers: [AppService, AppRepository],
    controllers: [AppController]
})
export class AppModule {}

Bootstrap(AppModule);
```

### Un ejemplo de codigo completo
```typescript
import { OnInvoke, Injectable, Inject, Controller as Ctrl, Module, Middleware as Mdlw, CanActivate } from 'electron-di'

abstract class Repository {
    abstract findAll(): Promise<any[]>
}

@Injectable()
class Middleware implements CanActivate {
    constructor(@Inject(Repository) private repository: Repository) { }
    async execute() {
        console.log('Middleware', await this.repository.findAll())
        return true
    }
}

@Injectable()
class Service {
    constructor(@Inject(Repository) private repository: Repository) { }

    async doSomething() {
        const data = await this.repository.findAll()
        return data
    }
}

@Ctrl()
class Controller {
    constructor(@Inject(Service) private service: Service) { }

    @Mdlw(Middleware)
    @OnInvoke('test')
    async test() {
        const data = await this.service.doSomething()
        return data
    }
}

@Injectable()
class RepositoryImpl implements Repository {
    async findAll() {
        return [1, 2, 3]
    }
}

@Module({
    providers: [
        { provide: Repository, useClass: RepositoryImpl },
        Service,
        Middleware,
    ],
    controllers: [Controller],
})
export class ExampleModule {}
```

## Contribuciones

Si deseas contribuir a este proyecto, por favor sigue estos pasos:
1. Haz un fork del repositorio.
2. Crea una nueva rama con tu funcionalidad (`git checkout -b mi-nueva-funcionalidad`).
3. Realiza tus cambios y confirma los commits (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube los cambios (`git push origin mi-nueva-funcionalidad`).
5. Abre un Pull Request en el repositorio original.

Asegúrate de seguir las guías de estilo y estándares de código definidos en el archivo `CONTRIBUTING.md`.

## Licencia

Este proyecto está bajo la licencia ISC. Consulta el archivo `LICENSE` para más detalles.

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue en el repositorio o contactar al equipo de desarrollo a través de <ajorgenmarten35@gmail.com>.

