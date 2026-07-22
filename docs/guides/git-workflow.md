# Git Workflow — Step-by-step guide

All changes go through a pull request. No one pushes directly to `main`, `master`,
`qa`, or `develop`. Every branch must be linked to either a **Jira ticket** or an
**SDD change** — never neither.

Two hooks installed by `baseline install` enforce this:

| Hook | What it does |
|------|-------------|
| `pre-push` | Blocks pushes to protected branches and rejects branches without a Jira key or SDD id |
| `post-commit` | After every commit, posts a comment to the linked Jira ticket (silent if no ticket or credentials) |

---

## Protected branches

| Branch | Rule |
|--------|------|
| `main` | Production — only PRs after full review |
| `master` | Same as `main` |
| `qa` | Staging — only PRs from feature branches that passed CI |
| `develop` | Integration — only PRs from feature branches |

---

## Branch naming decision tree

```
¿Tienes un ticket de Jira para este trabajo?
│
├── SÍ → feat/PROJ-123-short-description
│         fix/PROJ-456-null-pointer
│         refactor/PROJ-789-auth-layer
│
└── NO → ¿Tienes un SDD change id?
         │
         ├── SÍ → feat/sdd-<change-id>-short-description
         │         fix/sdd-<change-id>-bug-description
         │
         └── NO → Crea el SDD primero:
                   /sdd-new <descripción de lo que vas a hacer>
                   Luego usa el change-id generado.
```

**El `pre-push` hook bloquea cualquier rama que no cumpla con uno de los dos formatos.**

---

## Path A — Con ticket de Jira

### 1. Obtener o crear el ticket

```
/jira-workflow busca el ticket de webhooks en el módulo de pagos
```

```
/jira-workflow crea un ticket para agregar soporte de webhooks
```

Anota el key del ticket (p. ej. `PROJ-123`).

### 2. Crear la rama

```bash
git checkout develop && git pull origin develop
git checkout -b feat/PROJ-123-webhooks-pagos
```

### 3. Trabajar y commitear

```bash
git add <archivos>
git commit -m "feat(pagos): add webhook receiver endpoint"
```

**Al hacer el `git commit`, el hook `post-commit` agrega automáticamente un comentario
en el ticket `PROJ-123`:**

```
[baseline] Commit on `feat/PROJ-123-webhooks-pagos`

*a3f9c1b* — feat(pagos): add webhook receiver endpoint
Author: Ana García
Files: src/pagos/controllers/webhook.controller.ts, src/pagos/services/webhook.service.ts
```

Esto ocurre en silencio — si las credenciales no están configuradas o el ticket no existe,
el commit continúa sin error.

### 4. Push y PR

```bash
git push -u origin feat/PROJ-123-webhooks-pagos
/branch-pr
```

---

## Path B — Sin Jira, con SDD

### 1. Crear el SDD change

```
/sdd-new quiero agregar soporte de webhooks en el módulo de pagos
```

Esto genera `openspec/changes/<id>/proposal.md`. El `<id>` es lo que va en la rama.

### 2. Crear la rama con el SDD id

```bash
git checkout develop && git pull origin develop
git checkout -b feat/sdd-20240718-webhooks-pagos
```

Donde `20240718` es el `<id>` del change generado por `/sdd-new`.

### 3. Seguir el flujo SDD completo

```
/sdd-spec    → especificación
/sdd-design  → diseño técnico
/sdd-tasks   → lista de tareas
/sdd-apply   → implementación
/sdd-verify  → validación
```

Los commits son trazables al SDD change a través del nombre de la rama.

### 4. Push y PR

```bash
git push -u origin feat/sdd-20240718-webhooks-pagos
/branch-pr
```

---

## Commits — convención obligatoria

```
type(scope): short description
```

| Tipo | Cuándo |
|------|--------|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de bug |
| `refactor` | Reestructura sin cambio de comportamiento |
| `test` | Agregar o corregir tests |
| `chore` | Deps, config, tooling |
| `docs` | Solo documentación |
| `perf` | Mejora de rendimiento |

**Regla:** no se hace commit de código que modifica comportamiento sin tests que lo cubran.

---

## El PR

```
/branch-pr
```

El skill valida y abre el PR con:
- Título: `feat(pagos): add webhook receiver endpoint [PROJ-123]` o `feat(pagos): add webhook receiver endpoint [sdd-20240718]`
- Link al ticket Jira o al SDD change
- Summary y test plan
- Sin push directo — siempre como PR

---

## Review y merge

- Al menos un aprobador
- CI verde (tests, lint, build)
- Sin comentarios sin resolver

Para PRs de auth, pagos o multi-tenancy:

```
/judgment-day revisa este PR:
[pega el diff]
```

---

## Cierre

Después del merge:

```bash
# Limpiar la rama
git checkout develop && git pull
git branch -d feat/PROJ-123-webhooks-pagos

# Actualizar el ticket (Path A)
/jira-workflow mueve PROJ-123 a Done

# Archivar el SDD change (Path B)
/sdd-archive
```

---

## Quick reference

```bash
# Path A — con Jira
git checkout -b feat/PROJ-123-description
git commit -m "feat(scope): what you did"   # → auto-comment en PROJ-123
git push -u origin feat/PROJ-123-description
# /branch-pr

# Path B — sin Jira
# /sdd-new <descripción>   → genera change-id
git checkout -b feat/sdd-<change-id>-description
git commit -m "feat(scope): what you did"
git push -u origin feat/sdd-<change-id>-description
# /branch-pr
```

---

## Skills del workflow

| Skill | Cuándo usarlo |
|-------|--------------|
| `/jira-workflow` | Crear/buscar ticket antes de empezar (Path A) |
| `/sdd-new` | Iniciar el SDD change cuando no hay Jira (Path B) |
| `/work-unit-commits` | Planear commits antes de pushear un cambio grande |
| `/branch-pr` | Abrir el PR con todos los checks requeridos |
| `/judgment-day` | Revisión adversarial para auth, pagos o PRs grandes |
| `/sdd-archive` | Cerrar el SDD change después del merge (Path B) |
