# Migrar un proyecto existente

Este ejemplo muestra cómo usar las skills de baseline para migrar un proyecto existente
al stack y estándares del equipo, manteniendo trazabilidad y sin perder contexto.

---

## Escenario: migrar una API Express a NestJS

El equipo tiene una API Express con lógica mezclada en rutas, sin capas claras y sin
multi-tenancy. Quieren migrar a NestJS con la arquitectura definida por el equipo.

---

## Paso 1 — Explorar el estado actual

```
/sdd-explore quiero migrar esta API de Express a NestJS.
Analiza la arquitectura actual, identifica qué capas están mezcladas,
qué lógica de negocio está en las rutas y cuántos endpoints hay.
```

**Qué hace la skill:**
- Lee el árbol de archivos del proyecto
- Identifica patrones problemáticos (lógica en rutas, queries directas en controllers, etc.)
- Compara el estado actual contra la arquitectura objetivo del equipo
- Propone una estrategia de migración (incremental vs big-bang)

**Output típico:**
```
Hallazgos:
- 23 rutas en src/routes/ — mezclan validación, lógica y acceso a DB
- 0 separación de capas (no existe services/, domain/, infrastructure/)
- 4 consultas SQL raw con string templates
- Sin filtro de tenant_id en 18 de las 23 rutas
- Sin manejo de errores centralizado

Recomendación: migración incremental por módulo
Módulos identificados: auth, users, orders, products, payments
```

---

## Paso 2 — Proponer el plan de migración

```
/sdd-propose
```

Genera `openspec/changes/<id>/proposal.md` con:
- Alcance de la migración (qué módulos, en qué orden)
- Approach elegido (incremental, convive Express+NestJS temporalmente)
- Riesgos y criterios de done por módulo

> **Regla de oro**: ningún código de migración se toca sin este archivo aprobado.

---

## Paso 3 — Especificar los contratos que cambian

```
/sdd-spec
```

Para cada módulo a migrar, documenta en `openspec/changes/<id>/specs/`:
- Contratos de API que permanecen igual (compatibilidad hacia atrás)
- Contratos que cambian (con migration guide)
- Requisitos de multi-tenancy: qué queries necesitan filtro `tenant_id`
- Comportamientos eliminados o renombrados

---

## Paso 4 — Diseñar la estructura NestJS

```
/sdd-design
```

Produce el diseño técnico con la estructura de carpetas por módulo:

```
src/
├── auth/
│   ├── controllers/auth.controller.ts
│   ├── services/auth.service.ts
│   ├── domain/auth.entity.ts
│   └── infrastructure/jwt.adapter.ts
├── orders/
│   ├── controllers/orders.controller.ts
│   ├── services/orders.service.ts
│   ├── domain/order.entity.ts
│   └── infrastructure/orders.repository.ts
```

También define las decisiones de ADR: ORM elegido, manejo de errores, guards de auth.

---

## Paso 5 — Validar arquitectura en cada PR de migración

Antes de mergear cada módulo migrado:

```
/architecture-guidelines valida este diff — estamos migrando el módulo de orders de Express a NestJS:
[pega el diff del PR]
```

**Detecta automáticamente:**
```
❌ BLOCKER [Regla 5] src/orders/controllers/orders.controller.ts:34
   repo.find() sin filtro de tenantId.
   → Agregar .where({ tenantId: ctx.tenantId })

❌ BLOCKER [Regla 7] src/orders/controllers/orders.controller.ts:67
   El controller hace this.ordersRepo.save(order) — acceso directo al repo.
   → Mover la lógica a OrdersService.

⚠ SRP src/orders/services/orders.service.ts:89
   El service calcula impuestos inline.
   → Extraer a domain/tax-calculator.ts
```

---

## Paso 6 — Commits de migración ordenados

```
/work-unit-commits
```

Planea los commits para que cada módulo sea revieweable de forma independiente:

```
feat(auth): migrate auth module from Express to NestJS
  - AuthController with guards
  - AuthService (no more inline logic in routes)
  - JwtAdapter in infrastructure/

feat(orders): migrate orders module — add tenant_id filtering
  - OrdersController delegates to OrdersService
  - OrdersService uses TypeORM QueryBuilder (no raw SQL)
  - tenant_id filter on every query

test(orders): add integration tests for migrated orders module
```

---

## Paso 7 — Revisar PRs críticos de migración

Para PRs que tocan auth o pagos, usa revisión adversarial:

```
/judgment-day revisa este PR de migración del módulo de pagos:
[pega el diff]
```

Dos jueces independientes revisan el código. Solo los issues confirmados por ambos bloquean el merge.

---

## Paso 8 — Verificar y cerrar la migración

```
/sdd-verify
```

Valida que la implementación cumple las specs:
- Todos los endpoints migrados responden igual (mismos contratos)
- Todos los queries tienen filtro `tenant_id`
- Sin SQL raw
- Cobertura de tests por módulo

```
/sdd-archive
```

Cierra la migración: mergea los delta-specs en los specs principales, mueve el change a archive y genera el reporte final.

---

## Jira integrado con el flujo

Si el equipo trabaja con Jira, la skill `/jira-workflow` conecta el flujo SDD con los tickets:

```
/jira-workflow crea los tickets para la migración del módulo de orders
```

Crea automáticamente:
- Epic: Migración Express → NestJS
- Stories por módulo: una por cada fase SDD (explore, design, apply, verify)
- Subtareas para los criterios de done del equipo

---

## Lo que no está limitado a este ejemplo

- Migrar de JavaScript a TypeScript manteniendo trazabilidad por módulo
- Migrar de monolito a microservicios con un change SDD por servicio
- Agregar multi-tenancy a un proyecto existente que no lo tiene
- Migrar ORM (TypeORM a Prisma, o raw SQL a cualquier ORM)
- Migrar frontend de Pages Router a App Router en Next.js
