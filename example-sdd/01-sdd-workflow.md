# Flujo SDD completo

El flujo SDD (Spec-Driven Development) son 8 fases ordenadas. Cada skill cubre una fase.
Nunca saltes fases — la propuesta va antes del spec, el spec antes del diseño, el diseño antes del código.

```
explore → propose → spec → design → tasks → apply → verify → archive
```

---

## Ejemplo: agregar autenticación JWT a una API Express

### Fase 1 — Exploración

**Skill:** `/sdd-explore`

**Qué le dices al AI:**
```
/sdd-explore necesito agregar autenticación JWT a nuestra API Express.
Los endpoints actuales no tienen auth. Tenemos usuarios en PostgreSQL.
```

**Qué obtienes:**
- Análisis del estado actual de la API
- Comparación de enfoques: JWT stateless vs sesiones, refresh tokens vs no
- Identificación de endpoints que necesitan protección
- Dependencias existentes que pueden reutilizarse
- Riesgos y preguntas sin responder

**También puedes explorar:**
- Migrar de REST a GraphQL
- Evaluar si cambiar de ORM
- Analizar un bug de performance antes de proponer un fix

---

### Fase 2 — Propuesta

**Skill:** `/sdd-propose`

**Qué le dices al AI:**
```
/sdd-propose autenticación JWT con refresh tokens para la API Express.
Usar la exploración anterior como base.
```

**Qué obtienes:**
Un archivo `openspec/changes/auth-jwt/proposal.md` con:
- Qué se va a construir y por qué
- Alcance (qué entra, qué no)
- Enfoque técnico elegido
- Criterios de éxito

**También puedes proponer:**
- Migración de base de datos con rollback plan
- Extracción de un módulo a un microservicio
- Cambio de arquitectura de una feature existente

---

### Fase 3 — Especificación

**Skill:** `/sdd-spec`

**Qué le dices al AI:**
```
/sdd-spec usando la propuesta de auth-jwt, escribe los specs.
```

**Qué obtienes:**
`openspec/changes/auth-jwt/specs/auth.md` con:
- Requisitos funcionales en formato Given/When/Then
- Contratos de API (endpoints, payloads, status codes)
- Casos de error (token expirado, inválido, ausente)
- Invariantes de seguridad

**También puedes especificar:**
- Comportamiento de rate limiting
- Permisos granulares por rol
- Flujo de recuperación de contraseña

---

### Fase 4 — Diseño técnico

**Skill:** `/sdd-design`

**Qué le dices al AI:**
```
/sdd-design para auth-jwt. Usamos Express, Prisma, TypeScript, Redis disponible.
```

**Qué obtienes:**
`openspec/changes/auth-jwt/design.md` con:
- Estructura de archivos y módulos
- Decisiones de arquitectura con justificación (ej: por qué Redis para blacklist)
- Contratos de interfaces TypeScript
- Diagrama de flujo de tokens
- Estrategia de testing

**También puedes diseñar:**
- Sistema de colas con Bull
- Caching layer con invalidación
- Estrategia de feature flags

---

### Fase 5 — Tasks

**Skill:** `/sdd-tasks`

**Qué le dices al AI:**
```
/sdd-tasks para auth-jwt. Divide en unidades que pasen code review independientemente.
```

**Qué obtienes:**
`openspec/changes/auth-jwt/tasks.md` con checklist ordenado:
```
- [ ] 1. Instalar dependencias: jsonwebtoken, bcrypt, ioredis
- [ ] 2. Crear middleware de autenticación con tests
- [ ] 3. Endpoint POST /auth/login con hash de password
- [ ] 4. Endpoint POST /auth/refresh con validación de refresh token
- [ ] 5. Proteger rutas existentes con el middleware
- [ ] 6. Blacklist de tokens en Redis con TTL
- [ ] 7. Tests de integración para el flujo completo
```

---

### Fase 6 — Implementación

**Skill:** `/sdd-apply`

**Qué le dices al AI:**
```
/sdd-apply implementa el task 2: middleware de autenticación con tests.
```

**Qué obtienes:**
- Código siguiendo exactamente el diseño y el spec
- Tests escritos primero (strict TDD mode activo)
- Cada task marcado como completado al terminar
- Sin código extra que no esté en los tasks

**También puedes aplicar:**
- Un task a la vez para revisión granular
- Todos los tasks en secuencia si confías en el spec
- Con contexto de archivos existentes que debe respetar

---

### Fase 7 — Verificación

**Skill:** `/sdd-verify`

**Qué le dices al AI:**
```
/sdd-verify para auth-jwt. Valida que la implementación cumple specs y design.
```

**Qué obtienes:**
- Comparación punto a punto entre spec y código
- Lista de desvíos encontrados (si los hay)
- Cobertura de los casos de error especificados
- Veredicto: PASS o FAIL con qué falta

---

### Fase 8 — Archive

**Skill:** `/sdd-archive`

**Qué le dices al AI:**
```
/sdd-archive auth-jwt. La verificación pasó.
```

**Qué obtienes:**
- Delta specs mergeados a `openspec/specs/`
- Carpeta `openspec/changes/auth-jwt/` movida a `openspec/archive/`
- El proyecto queda con specs actualizados para el próximo desarrollador

---

## Atajo: arrancar directo

Si quieres que el AI maneje todo el inicio de ciclo:

```
/sdd-new agregar autenticación JWT con refresh tokens a la API Express
```

Esto corre explore → propose automáticamente y te deja en el spec listo para revisar.

---

## Lo que no está limitado a este ejemplo

- Cualquier feature de producto (pagos, notificaciones, reportes)
- Refactors de arquitectura (monolito → módulos, REST → GraphQL)
- Bugs complejos que necesitan análisis antes del fix
- Migraciones de datos con rollback
- Integraciones con terceros (Stripe, Twilio, AWS S3)
- Extracción de servicios compartidos
