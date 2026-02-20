# Scope: Implementación de AWS Cognito

## Estado: Backend implementado ✅

El backend ya incluye:
- Cognito User Pool, Client y Domain
- Autorizador JWT en todos los endpoints CRUD
- Endpoint público GET /config para que el frontend obtenga UserPoolId y ClientId

## Paso a paso detallado para registro, login y protección de endpoints

---

## FASE 1: Backend - Configuración de Cognito

### Paso 1.1: Crear User Pool en serverless.yml

**Archivo:** `serverless.yml` o `config/cognito.yml`

**Acción:** Agregar recurso CloudFormation para Cognito User Pool

```yaml
resources:
  Resources:
    CognitoUserPool:
      Type: AWS::Cognito::UserPool
      Properties:
        UserPoolName: ${self:service}-user-pool-${sls:stage}
        AutoVerifiedAttributes: [email]
        UsernameAttributes: [email]
        Schema:
          - Name: email
            Required: true
            Mutable: false
          - Name: name
            Required: false
            Mutable: true
        Policies:
          PasswordPolicy:
            MinimumLength: 8
            RequireUppercase: true
            RequireLowercase: true
            RequireNumbers: true
            RequireSymbols: false
        MfaConfiguration: OFF
        AccountRecoverySetting:
          RecoveryMechanisms:
            - Name: verified_email
              Priority: 1

    CognitoUserPoolClient:
      Type: AWS::Cognito::UserPoolClient
      Properties:
        ClientName: ${self:service}-client-${sls:stage}
        UserPoolId: !Ref CognitoUserPool
        GenerateSecret: false
        ExplicitAuthFlows:
          - ALLOW_USER_PASSWORD_AUTH
          - ALLOW_REFRESH_TOKEN_AUTH
          - ALLOW_USER_SRP_AUTH
        PreventUserExistenceErrors: ENABLED
        SupportedIdentityProviders:
          - COGNITO

    CognitoUserPoolDomain:
      Type: AWS::Cognito::UserPoolDomain
      Properties:
        Domain: ${self:service}-${sls:stage}-${aws:accountId}
        UserPoolId: !Ref CognitoUserPool

  Outputs:
    UserPoolId:
      Value: !Ref CognitoUserPool
    UserPoolClientId:
      Value: !Ref CognitoUserPoolClient
    CognitoDomain:
      Value: !Ref CognitoUserPoolDomain
```

**Nota:** El dominio de Cognito debe ser único globalmente. Usa un sufijo único si hay conflicto.

---

### Paso 1.2: Crear autorizador JWT en API Gateway

**Archivo:** `config/functions.yml` o `serverless.yml`

**Acción:** Configurar el autorizador HTTP API para usar Cognito

En `serverless.yml` (provider):

```yaml
provider:
  httpApi:
    authorizers:
      cognitoAuthorizer:
        type: jwt
        identitySource: $request.header.Authorization
        issuerUrl: https://cognito-idp.${aws:region}.amazonaws.com/${CognitoUserPoolId}
        audience:
          - ${CognitoUserPoolClientId}
```

**Problema:** Los IDs del User Pool y Client se crean en el deploy. Hay que usar referencias CloudFormation.

**Solución:** Usar `!Ref` en la sección `provider.httpApi.authorizers` no es directo. Alternativa: definir el autorizador en cada función con variables:

```yaml
# En serverless.yml - después de resources, agregar outputs y usarlos
provider:
  httpApi:
    authorizers:
      cognitoAuth:
        type: jwt
        identitySource: $request.header.Authorization
        issuerUrl: !Sub 'https://cognito-idp.${AWS::Region}.amazonaws.com/${CognitoUserPoolId}'
        audience:
          - !Ref CognitoUserPoolClient
```

**Nota:** En Serverless Framework, la referencia a recursos del mismo stack se hace con `{CognitoUserPool:}` para el ID. Revisar documentación de variables.

---

### Paso 1.3: Aplicar autorizador a los endpoints protegidos

**Archivo:** `config/functions.yml`

**Acción:** Agregar `authorizer: cognitoAuth` a cada endpoint que deba estar protegido

```yaml
# Endpoints PROTEGIDOS (requieren login)
createCar:
  handler: src/createCar.addCar
  events:
    - httpApi:
        path: /
        method: post
        authorizer:
          name: cognitoAuth

getCars:
  handler: src/getCars.getCars
  events:
    - httpApi:
        path: /
        method: get
        authorizer:
          name: cognitoAuth

getCar:
  handler: src/getCar.getCar
  events:
    - httpApi:
        path: /{id}
        method: get
        authorizer:
          name: cognitoAuth

updateCar:
  handler: src/updateCar.updateCar
  events:
    - httpApi:
        path: /{id}
        method: put
        authorizer:
          name: cognitoAuth

deleteCar:
  handler: src/deleteCar.deleteCar
  events:
    - httpApi:
        path: /{id}
        method: delete
        authorizer:
          name: cognitoAuth
```

---

### Paso 1.4: Exponer User Pool ID y Client ID al frontend

**Acción:** Los Outputs de CloudFormation (UserPoolId, UserPoolClientId) deben estar disponibles. El frontend los necesita como variables de entorno o en un archivo de config.

**Opciones:**
- Crear endpoint público `GET /config` que retorne `{ userPoolId, clientId, region }` (sin datos sensibles)
- O hardcodear en el frontend después del primer deploy (menos flexible)

---

### Paso 1.5: Actualizar CORS para incluir Authorization

**Archivo:** `serverless.yml`

**Acción:** Ya tienes `Authorization` en `allowedHeaders`. Verificar que esté presente.

---

## FASE 2: Frontend - Páginas de Auth

### Paso 2.1: Instalar dependencias

```bash
npm install amazon-cognito-identity-js
# o
npm install aws-amplify
```

**Recomendación:** `amazon-cognito-identity-js` es más ligero. Amplify ofrece más features pero más peso.

---

### Paso 2.2: Crear servicio de autenticación

**Archivo:** `src/auth/cognitoService.js` (o similar)

**Acción:** Implementar funciones para:
- `signUp(email, password, name)` - Registro
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getCurrentUser()` - Obtener usuario actual
- `getSession()` - Obtener tokens (idToken, accessToken)
- `isAuthenticated()` - Verificar si hay sesión válida

**Ejemplo de estructura:**

```javascript
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-1_xxxxx',
  ClientId: 'xxxxxxxxxxxxxxxxxx',
};

const userPool = new CognitoUserPool(poolData);

export const signUp = (email, password, name) => { ... };
export const signIn = (email, password) => { ... };
export const signOut = () => { ... };
export const getCurrentUser = () => { ... };
export const getSession = () => { ... };
```

---

### Paso 2.3: Crear página de Registro

**Archivo:** `pages/register.html` o componente React/Vue

**Campos:**
- Email
- Contraseña
- Confirmar contraseña
- Nombre (opcional)

**Flujo:**
1. Usuario llena formulario
2. Llamar `signUp(email, password, name)`
3. Cognito puede requerir confirmación por email
4. Si éxito → redirigir a login o a página principal
5. Si error → mostrar mensaje (email ya existe, contraseña débil, etc.)

---

### Paso 2.4: Crear página de Login

**Archivo:** `pages/login.html` o componente

**Campos:**
- Email
- Contraseña

**Flujo:**
1. Usuario llena formulario
2. Llamar `signIn(email, password)`
3. Cognito retorna tokens (idToken, accessToken, refreshToken)
4. Guardar tokens (localStorage o sessionStorage)
5. Redirigir a página principal
6. Si error → mostrar mensaje (credenciales incorrectas, usuario no confirmado, etc.)

---

### Paso 2.5: Proteger rutas/páginas

**Acción:** En cada carga de página protegida (o en el router):

```javascript
if (!isAuthenticated()) {
  window.location.href = '/login.html';
  return;
}
```

**Alternativa con router (React/Vue/Svelte):**
- Crear componente/hook `ProtectedRoute`
- Verificar `isAuthenticated()` antes de renderizar
- Si no autenticado → redirigir a `/login`

**Páginas públicas (sin protección):**
- `/login.html`
- `/register.html`

**Páginas protegidas:**
- Todas las demás (listado de autos, detalle, crear, editar, etc.)

---

### Paso 2.6: Agregar token a las llamadas API

**Acción:** En cada `fetch` o en un interceptor:

```javascript
const session = await getSession();
const idToken = session.getIdToken().getJwtToken();

fetch(API_URL + '/', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
  },
  // ...
});
```

**Recomendación:** Crear función helper `apiRequest(url, options)` que añada automáticamente el token.

---

### Paso 2.7: Manejar refresh de token

**Acción:** Los tokens de Cognito expiran (~1 hora). Implementar:
- Verificar si el token está por expirar antes de cada request
- Usar `refreshToken` para obtener nuevos tokens
- O redirigir a login si el refresh falla

---

### Paso 2.8: Logout

**Acción:** En botón "Cerrar sesión":
1. Llamar `signOut()`
2. Limpiar localStorage/sessionStorage
3. Redirigir a `/login`

---

## FASE 3: Ajustes y Consideraciones

### Paso 3.1: Confirmación de email

**Opciones en Cognito:**
- **Auto-verify:** Cognito envía email de confirmación automáticamente
- **Admin confirm:** Requiere que un admin confirme usuarios (menos común para registro público)

**Flujo típico:** Usuario se registra → recibe email con código → ingresa código en la app para confirmar.

---

### Paso 3.2: Recuperación de contraseña

**Acción:** Implementar "¿Olvidaste tu contraseña?":
- `forgotPassword(email)` - Cognito envía código
- `confirmPassword(email, code, newPassword)` - Usuario ingresa código y nueva contraseña

---

### Paso 3.3: Obtener datos del usuario en Lambda (opcional)

**Acción:** Si necesitas el email o sub del usuario en las Lambdas:
- El JWT viene en `event.requestContext.authorizer.jwt.claims`
- Ejemplo: `event.requestContext.authorizer.jwt.claims.sub` (user id), `email`

---

## FASE 4: Despliegue y Pruebas

### Paso 4.1: Orden de deploy

1. Deploy inicial sin autorizador (para crear el User Pool)
2. Anotar UserPoolId y ClientId de los Outputs
3. Actualizar `serverless.yml` con las referencias correctas al autorizador
4. Deploy con autorizador
5. Actualizar frontend con UserPoolId y ClientId
6. Probar registro → confirmación → login → llamadas API

---

### Paso 4.2: Pruebas manuales

- [ ] Registro con email nuevo
- [ ] Confirmación de email (si aplica)
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Acceso a API sin token → 401
- [ ] Acceso a API con token válido → 200
- [ ] Acceso a página protegida sin login → redirige a login
- [ ] Logout → limpia sesión y redirige

---

## Resumen de archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `serverless.yml` o `config/resources.yml` | Agregar Cognito User Pool, Client, Domain |
| `serverless.yml` | Configurar autorizador JWT |
| `config/functions.yml` | Agregar `authorizer` a cada endpoint |
| `src/auth/cognitoService.js` | Crear servicio de auth (frontend) |
| `login.html` / componente | Crear página login |
| `register.html` / componente | Crear página registro |
| Router o script de rutas | Proteger rutas, redirección |
| Llamadas API | Agregar header Authorization |
| `GET /config` (opcional) | Endpoint para exponer config al frontend |

---

## Tiempo estimado por fase

| Fase | Tiempo |
|------|--------|
| Fase 1: Backend Cognito | 2-3 horas |
| Fase 2: Frontend Auth | 4-6 horas |
| Fase 3: Ajustes | 1-2 horas |
| Fase 4: Pruebas | 2-3 horas |
| **Total** | **9-14 horas** |
