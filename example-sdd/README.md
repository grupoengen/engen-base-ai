# Ejemplos de skills

Este directorio muestra escenarios concretos de cómo usar cada skill instalada por baseline.

Los ejemplos son puntos de partida — cada skill puede manejar casos mucho más complejos que los que aparecen aquí. Lo que ves es suficiente para entender qué hace, no un límite de lo que puede hacer.

## Cómo invocar una skill

Dentro de tu herramienta AI (Claude Code, OpenCode, Kiro), escribe:

```
/nombre-de-la-skill
```

O con contexto directo:

```
/nombre-de-la-skill descripción de lo que necesitas
```

---

## Índice de ejemplos

| Archivo | Categoría |
|---------|-----------|
| [01-sdd-workflow.md](./01-sdd-workflow.md) | Flujo completo SDD — del idea al archive |
| [02-review.md](./02-review.md) | Revisión de código — judgment-day, comment-writer |
| [03-git-workflow.md](./03-git-workflow.md) | Git y PRs — branch-pr, chained-pr, work-unit-commits |
| [04-design.md](./04-design.md) | Diseño y frontend |
| [05-docs-testing-github.md](./05-docs-testing-github.md) | Documentación, testing y GitHub issues |
| [06-architecture.md](./06-architecture.md) | Lineamientos de arquitectura — NestJS, Lambda, React Query, multi-tenancy |
| [07-project-migration.md](./07-project-migration.md) | Migrar un proyecto existente al stack del equipo |
| [08-git-jira-workflow.md](./08-git-jira-workflow.md) | Git workflow con Jira (Path A) y sin Jira via SDD (Path B) — hooks, commits, PRs |

---

## Regla de oro

> Ningún código se escribe antes de que exista `openspec/changes/<change-id>/proposal.md`.
>
> Tu primera salida ante cualquier pedido de feature es la propuesta — no el código.