# Git y Pull Requests

---

## `/chained-pr` — Partir un PR grande en cadena

Un PR de 600+ líneas no recibe review real — la gente lo aprueba sin leer.
La skill lo divide en PRs que se mergean en secuencia.

### Escenario: refactor de 800 líneas en el módulo de usuarios

**Sin la skill:**
```
PR #51: refactor: módulo de usuarios — 847 changed files
[23 archivos, nadie lo reviewea bien, se mergea con "LGTM"]
```

**Invocación:**
```
/chained-pr el refactor del módulo de usuarios tiene 800+ líneas,
necesito dividirlo en partes revieweables.
```

**Qué obtienes:**
```
PR #51: refactor(users): extraer interfaces y tipos [Parte 1/3]
  → 180 líneas, solo tipos y contratos. Sin lógica. Revieweable en 10 min.

PR #52: refactor(users): reemplazar implementación con nuevos contratos [Parte 2/3]
  → 340 líneas, depende de #51. Revieweable con el contexto del PR anterior.

PR #53: refactor(users): eliminar código legacy y actualizar tests [Parte 3/3]
  → 280 líneas, limpieza final. Depende de #52.
```

Cada PR tiene en el description: "Este PR depende de #51 — revisar ese primero."

### También puedes usar chained-pr cuando:
- Mezclas feat + refactor en el mismo branch (pártelos)
- Una migración tiene DDL + código + tests (un PR cada uno)
- Un feature toca frontend y backend (separa por capa)
- Algo que empezó como "pequeño" creció durante el desarrollo

---

## `/work-unit-commits` — Planear commits como unidades revieweables

Cada commit debe pasar CI solo y tener sentido sin ver el siguiente.

### Escenario: implementaste el módulo de notificaciones, ahora hay que commitear

**Sin la skill (lo que normalmente pasa):**
```
git add .
git commit -m "notifications"
```

**Invocación:**
```
/work-unit-commits tengo implementadas las notificaciones:
servicio de email, servicio de push, sistema de templates,
tests unitarios, y la integración con el job de background.
```

**Qué obtienes:**
Plan de commits en orden:
```
1. feat(notifications): add email service with retry logic
   → solo el servicio de email y sus tests. CI pasa sin el resto.

2. feat(notifications): add push notification service
   → solo push y sus tests. No depende del email.

3. feat(notifications): add template engine with variable interpolation
   → templates y tests. Los servicios pueden usarlo ya.

4. feat(notifications): wire background job with email and push services
   → la integración. Depende de los 3 commits anteriores.
```

### También puedes usar work-unit-commits cuando:
- Trabajaste varios días en una feature y el diff es un desastre
- Mezclaste fixes con features (separarlos retroactivamente)
- Quieres que cada commit sea un punto de rollback seguro
- Preparas un branch para code review antes de abrir el PR
