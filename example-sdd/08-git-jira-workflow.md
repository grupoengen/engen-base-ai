# Git workflow con Jira y SDD

Antes de crear una rama, necesitas un trabajo referenciado:
**un ticket de Jira** o **un SDD change**. Nunca los dos, nunca ninguno.

Los ejemplos muestran casos reales — no son los únicos casos posibles.
Cada equipo adapta el naming, el alcance y las herramientas a su contexto.

---

## `/jira-workflow` — Gestionar tickets desde el AI tool

Crea, actualiza y vincula tickets de Jira sin salir de tu herramienta AI.
Cada commit en una rama vinculada agrega automáticamente un comentario en el ticket.

Requiere `baseline mcp jira` configurado.

---

### Escenario A: tienes asignado un ticket y quieres revisarlo antes de empezar

**Invocación:**
```
/jira-workflow busca el ticket PAGOS-47 y muéstrame su descripción
y criterios de aceptación
```

**Qué obtienes:**
```
PAGOS-47 — Agregar receptor de webhooks de Stripe
Status: In Progress
Asignado a: Ana García

Descripción:
  Implementar endpoint que reciba eventos de Stripe, valide la firma
  y persista el evento en webhook_events con tenant_id.

Criterios de aceptación:
  - POST /webhooks/pagos recibe eventos
  - Valida firma con STRIPE_WEBHOOK_SECRET
  - Persiste con tenant_id obligatorio
  - Retorna 200 en < 500ms
```

---

### Escenario B: no existe el ticket todavía, lo creas desde el AI

**Invocación:**
```
/jira-workflow crea un ticket para agregar soporte de webhooks
en el módulo de pagos — el receptor debe validar la firma de Stripe
y persistir el evento con tenant_id
```

**Qué obtienes:**
```
✔ Ticket creado: PAGOS-47
  https://your-org.atlassian.net/browse/PAGOS-47

  Epic: Módulo de Pagos
  Story: Agregar receptor de webhooks de Stripe
  Status: To Do
```

---

### Escenario C: commit automático → comentario en el ticket

Una vez que tu rama incluye el key del ticket (p. ej. `feat/PAGOS-47-webhooks`),
cada `git commit` agrega automáticamente este comentario en PAGOS-47:

```
[baseline] Commit on `feat/PAGOS-47-webhooks`

*a3f9c1b* — feat(pagos): add webhook receiver endpoint
Author: Ana García
Files: src/pagos/controllers/webhook.controller.ts, src/pagos/services/webhook.service.ts
```

No necesitas hacer nada — el hook `post-commit` lo hace en silencio.

---

### Escenario D: mover el ticket cuando abres el PR o terminas

**Al abrir el PR:**
```
/jira-workflow mueve PAGOS-47 a In Review y agrega el link del PR
```

**Al mergear:**
```
/jira-workflow mueve PAGOS-47 a Done
```

---

### También puedes usar `/jira-workflow` para:
- Agregar criterios de aceptación a un ticket que está incompleto
- Crear un Epic con Stories para cada fase SDD de una migración grande
- Buscar todos los tickets de un sprint y priorizarlos
- Vincular dos tickets relacionados (`PAGOS-47 blocks PAGOS-52`)
- Agregar un comentario de decisión técnica al ticket ("Decidimos usar Stripe webhooks v3 porque...")
- Actualizar el ticket con el link al SDD change cuando no hay Jira originalmente

---

## `/branch-pr` — Crear el PR vinculado al trabajo

Valida que el branch esté listo, que el trabajo esté referenciado
(ticket Jira o SDD change), y abre el PR con el formato del equipo.

---

### Escenario A: PR con ticket de Jira

Tu rama es `feat/PAGOS-47-webhooks`. Todo está commiteado.

**Invocación:**
```
/branch-pr
```

**Qué hace:**
1. Detecta el ticket `PAGOS-47` en el nombre del branch
2. Verifica que el ticket existe y está en progreso
3. Revisa commits: todos siguen convención `type(scope): description`
4. Detecta que hay tests en el diff
5. Crea el PR:

```
PR #89: feat(pagos): add webhook receiver endpoint [PAGOS-47]

Closes PAGOS-47
https://your-org.atlassian.net/browse/PAGOS-47

## Summary
- Endpoint POST /webhooks/pagos valida firma HMAC de Stripe
- Persiste evento en webhook_events con tenant_id obligatorio
- Retorna 200 en < 200ms, DLQ para fallos

## Test plan
- [x] Signature válida → 200 + evento persistido
- [x] Signature inválida → 401
- [x] Sin tenant_id → error antes de persistir
- [x] Evento duplicado (idempotency key) → 200 sin duplicar
```

---

### Escenario B: PR con SDD change (sin Jira)

Tu rama es `refactor/sdd-20240718-auth-migration`.

**Invocación:**
```
/branch-pr
```

**Qué hace:**
1. Detecta el SDD id `20240718` en el nombre del branch
2. Lee `openspec/changes/20240718-auth-migration/` para el contexto
3. Verifica que `/sdd-verify` pasó antes de abrir el PR
4. Crea el PR con link al SDD change:

```
PR #90: refactor(auth): migrate auth module to NestJS Guards [sdd-20240718]

SDD Change: openspec/changes/20240718-auth-migration/
Proposal: openspec/changes/20240718-auth-migration/proposal.md

## Summary
- AuthGuard reemplaza middleware Express de autenticación
- JwtStrategy en infrastructure/, AuthService en services/
- 0 lógica de negocio en controllers

## Test plan
- [x] Login válido → access + refresh token
- [x] Token expirado → 401 con mensaje claro
- [x] Rutas sin guard → acceso denegado en QA
```

---

### También puedes usar `/branch-pr` para:
- PRs de hotfix con ticket de producción: `fix/OPS-12-null-session`
- PRs de chore sin Jira: `chore/sdd-20240719-upgrade-node-20`
- PRs de documentación: `docs/sdd-20240720-api-guide`
- PRs que tienen tanto Jira como SDD: el PR linkea a ambos

---

## Hooks instalados por `baseline install`

No son skills — son git hooks globales que corren automáticamente.

---

### `pre-push` — Bloquea lo que no debería llegar al remote

**Caso 1 — push directo a rama protegida:**
```bash
git push origin main
```
```
  baseline: direct push to 'main' is not allowed.

  Protected branches: main master qa develop
  All changes must go through a pull request.

  Start from a Jira ticket or SDD change:
    git checkout -b feat/PROJ-123-description
    git checkout -b feat/sdd-<change-id>-description

  Then open a PR with: /branch-pr
```

**Caso 2 — rama sin referencia a trabajo:**
```bash
git checkout -b mi-feature-nueva
git push -u origin mi-feature-nueva
```
```
  baseline: branch 'mi-feature-nueva' is not linked to any work item.

  Every branch must reference either:
    feat/PROJ-123-description        ← Jira ticket key
    feat/sdd-<change-id>-description ← SDD change (no Jira)

  Rename your branch:
    git branch -m feat/PROJ-123-description
```

**Solución rápida si no tienes Jira:**
```
/sdd-new [descripción de lo que vas a hacer]
```
El AI genera el change id. Lo usas en el nombre del branch.

---

### `post-commit` — Actualiza el ticket en cada commit

No necesitas invocarlo. Funciona en silencio después de cada `git commit`.

**Qué detecta:** el key del ticket en el nombre del branch actual.
**Qué postea:** hash, mensaje del commit, autor, y archivos modificados.
**Cuándo no hace nada:** si no hay key en el branch, o si las credenciales no están configuradas.

---

## Lo que no está limitado a estos ejemplos

Los ejemplos muestran los casos más comunes — no son una restricción.

- Puedes usar **Linear, GitHub Issues, Notion** en lugar de Jira — el naming de la rama es libre mientras incluya una referencia identificable; el `post-commit` solo postea a Jira si las credenciales están configuradas
- Puedes tener un ticket de Jira **Y** un SDD change para el mismo trabajo — el PR linkea a ambos
- Puedes **desactivar el `post-commit`** en un repo específico configurando `core.hooksPath` local con Husky: `git config core.hooksPath .husky`
- Puedes **forzar que todo pase por SDD** antes de abrir la rama, aunque haya ticket de Jira — es una convención del equipo, no una restricción técnica
- Múltiples devs en el mismo ticket: `feat/PAGOS-47-webhooks-backend` y `feat/PAGOS-47-webhooks-frontend` — ambos postean comentarios en PAGOS-47
- El `pre-push` se puede extender con más validaciones: cobertura mínima, linting, build local — edita `~/.baseline/hooks/pre-push`
