# Lineamientos de Arquitectura

La skill `/architecture-guidelines` tiene dos modos: guiar dónde va el código nuevo,
y validar que el código existente o propuesto cumple las reglas del equipo.

---

## `/architecture-guidelines` — Guiar placement de archivos

### Escenario: crear un servicio de notificaciones por email

**Invocación:**
```
/architecture-guidelines quiero crear un servicio que envíe emails cuando
se procese un pago exitoso. ¿Dónde va cada archivo?
```

**Qué obtienes:**
```
src/notifications/
├── infrastructure/email.client.ts   ← adaptador a AWS SES (no lógica de negocio)
├── services/notification.service.ts ← orquesta cuándo y qué enviar
├── domain/notification.entity.ts    ← entidad con reglas puras (templates, tipos)
└── controllers/                     ← no aplica, esto es evento-driven

Regla aplicada: la llamada a SES va en infrastructure/ porque es un adaptador
de salida. El servicio en services/ orquesta pero no sabe que existe SES.
```

### También puedes preguntar:
- ¿Dónde va la lógica de validación de un cupón de descuento?
- ¿Este hook de React debería ser un container o un presentational?
- ¿Esta función de cálculo de impuestos va en domain/ o services/?
- ¿Creo un Lambda o un NestJS endpoint para este webhook de Stripe?

---

## `/architecture-guidelines` — Validar código antes de commitear

### Escenario: revisar un PR antes de que entre a main

**Invocación:**
```
/architecture-guidelines valida este código antes de que lo mergee:
[pega el diff o describe los archivos]
```

**Ejemplo de violations que detecta:**

```
❌ BLOCKER [Regla 1] src/services/order.service.ts:47
   process.env.STRIPE_SECRET_KEY comparado contra el string hardcodeado.
   → Mover a una variable de configuración via ConfigService de NestJS.

❌ BLOCKER [Regla 3] src/controllers/user.controller.ts:112
   console.log(user) — expone PII en logs.
   → Reemplazar con this.logger.debug('user fetched', { userId: user.id }).

❌ BLOCKER [Regla 4] src/services/payment.service.ts:89
   Query a la tabla orders sin filtro de tenant_id.
   → Agregar .where('order.tenantId = :tenantId', { tenantId: ctx.tenantId }).

⚠ SRP [Regla 7] src/controllers/product.controller.ts:34
   El controller accede directo al repositorio (this.productRepo.find()).
   → Delegar a ProductService — el controller no debe saber del ORM.
```

### También puedes validar:
- Un módulo completo antes de hacer deploy a producción
- El código de un dev nuevo antes de que abra su primer PR
- Una feature que toca auth o pagos (alta sensibilidad)
- Cualquier archivo que nadie del equipo ha tocado en meses

---

## Reglas que bloquean CI/CD automáticamente

Estas 7 reglas son non-negotiable. La skill las verifica siempre:

| # | Regla | Ejemplo incorrecto | Correcto |
|---|-------|--------------------|----------|
| 1 | Sin hardcode de env vars | `const key = "sk_live_..."` | `process.env.STRIPE_KEY` |
| 2 | Sin catch vacíos | `catch (e) {}` | `catch (e) { logger.error(e) }` |
| 3 | Sin `console.log` en prod | `console.log(user)` | `this.logger.debug(...)` |
| 4 | Sin logs de PII | `logger.info(JSON.stringify(user))` | `logger.info({ userId: user.id })` |
| 5 | Queries con tenant_id | `repo.find()` | `repo.find({ where: { tenantId } })` |
| 6 | Sin SQL crudo | `queryRunner.query('SELECT...')` | Usar QueryBuilder de TypeORM |
| 7 | Controllers sin lógica de negocio | `controller.findAll()` llama al repo | Delegar a service |

---

## Lo que no está limitado a estos ejemplos

- Validar arquitectura de un monorepo completo
- Guiar la estructura de un microservicio nuevo desde cero
- Decidir si algo merece ser un Lambda o un NestJS module
- Revisar que un módulo de terceros no viola la separación de capas
- Aplicar las reglas a proyectos React Native además de React web
- Detectar fugas de tenant en queries complejas con joins
