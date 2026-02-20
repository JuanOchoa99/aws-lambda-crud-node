# AWS Lambda CRUD API

API REST serverless con operaciones CRUD (Create, Read, Update, Delete) para gestión de autos. Construida con Serverless Framework, AWS Lambda, API Gateway HTTP API y DynamoDB.

## Autenticación (AWS Cognito)

Todos los endpoints CRUD requieren autenticación con JWT de Cognito. El frontend debe enviar el token en el header:

```
Authorization: Bearer <idToken>
```

### Endpoint público (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/config` | Obtener configuración de Cognito (UserPoolId, ClientId, region) para el frontend |

### Endpoints protegidos (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear un auto |
| GET | `/` | Listar todos los autos |
| GET | `/{id}` | Obtener un auto por ID |
| PUT | `/{id}` | Actualizar un auto |
| DELETE | `/{id}` | Eliminar un auto |

## Despliegue manual

```bash
npm install
serverless deploy
```

Para desarrollo (stage dev):
```bash
serverless deploy --stage dev
```

## CI/CD con GitHub Actions

El proyecto incluye un pipeline de CI/CD que despliega automáticamente al hacer push a las ramas `main` o `master`.

### Configuración de secrets en GitHub

1. Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Haz clic en **New repository secret**
3. Agrega los siguientes secrets:

| Secret | Descripción |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Access Key ID de tu usuario IAM de AWS |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key de tu usuario IAM de AWS |

### Crear usuario IAM para CI/CD

1. En AWS Console → IAM → Users → Create user
2. Asigna una política con permisos para: Lambda, API Gateway, DynamoDB, CloudFormation, S3, IAM, Cognito (para User Pool)
3. Crea Access Keys para el usuario
4. Usa esas credenciales como secrets en GitHub

### Flujo del pipeline

1. **Trigger**: Push a `main` o `master`
2. **Build**: Instala dependencias con `npm ci`
3. **Deploy**: Ejecuta `serverless deploy` (usa el stage por defecto: dev)

El despliegue crea/actualiza:
- Funciones Lambda (getConfig, createCar, getCars, getCar, updateCar, deleteCar)
- API Gateway HTTP API con autorizador JWT (Cognito)
- Tabla DynamoDB (CarsTable)
- Cognito User Pool (registro y login)
