# Revisión de código

---

## `/judgment-day` — Revisión adversarial dual

Dos jueces independientes revisan el mismo código sin conocer la opinión del otro.
Solo los hallazgos donde ambos coinciden se convierten en fixes.

### Escenario: PR con implementación de pagos con Stripe

**Invocación:**
```
/judgment-day
```

El AI toma el diff actual y corre los 4 lentes en paralelo:

| Lente | Qué revisa |
|-------|-----------|
| Risk | SQL injection, tokens expuestos, permisos incorrectos, webhooks sin validar |
| Reliability | Tests faltantes, edge cases sin cubrir, manejo de errores incompleto |
| Readability | Nombres confusos, funciones de 200 líneas, lógica imposible de seguir |
| Resilience | Sin retry en llamadas a Stripe, sin timeout, sin circuit breaker |

**Qué obtienes:**
- Findings categorizados por severidad (blocker / warning / suggestion)
- Solo los blockers que ambos jueces detectaron se aplican
- Cada fix va con evidencia del problema, no con opiniones
- Re-juicio automático después de las correcciones

**Ejemplo de finding real:**
```
[BLOCKER - Risk] Webhook de Stripe sin validar firma
El handler en /api/webhooks/stripe no valida stripe-signature.
Cualquier request POST a esa URL ejecutará el webhook.
Fix: stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_SECRET)
```

### También puedes usar judgment-day en:
- PR antes de mergear a main
- Código legacy que nadie quiere tocar
- Implementación de auth, permisos o manejo de datos sensibles
- Cualquier módulo que va a producción esta semana
- Refactors grandes donde algo puede haberse roto

---

## `/comment-writer` — Comentarios de colaboración

Convierte feedback técnico en comentarios que construyen, no que destruyen.

### Escenario: encontraste un problema en el PR de un colega

**Sin la skill** (lo que normalmente pasa):
```
Este código es una porquería. ¿Por qué estás manejando el error así?
```

**Con `/comment-writer`:**
```
/comment-writer necesito dar feedback sobre este manejo de errores:
el catch está swallowing la excepción sin loguear nada, y el caller
asume que si no hay error todo salió bien.
```

**Qué obtienes:**
```
Hey, encontré algo importante en el catch — actualmente la excepción
se descarta sin log, lo que hace que los errores silenciosos sean
difíciles de debuggear en producción.

Algo así podría ayudar:
  } catch (err) {
    logger.error('payment.process failed', { err, orderId })
    throw err  // re-throw para que el caller sepa
  }

¿Qué opinas? Puedo ayudar a ajustarlo si quieres.
```

### También puedes usar comment-writer para:
- Explicar por qué rechazas un approach sin sonar agresivo
- Dar feedback positivo específico ("esto está muy bien porque...")
- Responder comentarios en tus propios PRs
- Escribir el description de un PR que necesita contexto
- Mensajes de Slack cuando algo falla en prod y necesitas coordinar sin generar pánico
