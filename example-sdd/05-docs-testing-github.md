# Documentación, Testing y GitHub

---

## `/changelog-generator` — Release notes desde commits de git

Transforma commits técnicos en notas de release que los usuarios entienden.
No requiere que los commits ya estén bien escritos — los analiza y los mejora.

### Escenario: preparar el release de la versión 2.1.0

**Invocación:**
```
/changelog-generator v2.0.0..HEAD, preparando release 2.1.0
```

**Input (commits en el repo):**
```
fix: null pointer en user.getOrders cuando no hay sesión
feat: agregar filtro por fecha en listado de productos
chore: actualizar node a 20.x
feat: integración con Stripe para pagos con tarjeta
fix: race condition en el checkout cuando hay stock < 2
refactor: extraer lógica de descuentos a DiscountService
```

**Output que obtienes:**

```markdown
## v2.1.0 — 2026-07-18

### New
- **Payments with credit card** — Stripe integration now live.
  Supports Visa, Mastercard, and Amex.
- **Date filter on product listings** — Filter your catalog by
  creation date or last update.

### Fixed
- Checkout no longer fails when an item has low stock (< 2 units).
- Session-less users no longer trigger a server error on order history.

### Internal
- Discount logic extracted to a dedicated service (no user impact).
- Node.js runtime updated to v20.
```

### También puedes pedir:
- Changelog por área (API, UI, Admin) si el repo es un monorepo
- Release notes en formato Keep a Changelog
- Resumen ejecutivo de una línea para slack/email al equipo
- Notas de migración cuando hay breaking changes
- Generar `CHANGELOG.md` desde cero con toda la historia del repo

---

## `/cognitive-doc-design` — Documentación que reduce carga cognitiva

No solo escribe docs — los diseña para que un lector nuevo pueda ejecutar, no solo leer.

### Escenario: README para un microservicio nuevo

**Invocación:**
```
/cognitive-doc-design README para el servicio de notificaciones.
Es un microservicio Node.js que envía emails y push notifications.
Audiencia: devs del equipo que nunca lo tocaron.
```

**Qué obtienes:**
Un README con estructura progresiva:
1. **Qué hace** — una oración, sin jerga
2. **Cómo correrlo en 3 minutos** — comandos copy-paste que funcionan
3. **Variables de entorno requeridas** — tabla con descripción y ejemplo
4. **Arquitectura en un párrafo** — lo suficiente para navegar el código
5. **Cómo deployar** — checklist ordenado
6. **Troubleshooting** — los 3 errores más comunes con solución

Sin secciones de "Introducción" ni "Visión general" que nadie lee.

### También puedes pedir:
- RFC para una decisión de arquitectura que necesita buy-in del equipo
- Guía de onboarding para devs que entran al proyecto
- Documentación de API interna (para que otros equipos la usen)
- ADR (Architecture Decision Record) para una decisión importante
- Guía de contribución para un repo open source
- Runbook de operaciones para el equipo de on-call

---

## `/go-testing` — Patrones de testing para Go

Aplica patrones de testing idiomáticos en Go: table-driven tests, golden files,
mocks con interfaces, y testing de UIs de terminal con teatest.

### Escenario: testear un handler de gRPC con dependencias externas

**Invocación:**
```
/go-testing handler OrderService.CreateOrder en internal/order/handler.go.
Depende de PaymentClient (gRPC) y InventoryRepo (Postgres).
Necesito cubrir: éxito, pago fallido, stock insuficiente, timeout de pago.
```

**Qué obtienes:**
```go
func TestOrderHandler_CreateOrder(t *testing.T) {
    tests := []struct {
        name        string
        req         *pb.CreateOrderRequest
        mockPayment func(*MockPaymentClient)
        mockRepo    func(*MockInventoryRepo)
        wantErr     codes.Code
    }{
        {
            name: "success",
            // ...
        },
        {
            name: "payment declined",
            mockPayment: func(m *MockPaymentClient) {
                m.EXPECT().Charge(gomock.Any(), gomock.Any()).
                    Return(nil, status.Error(codes.FailedPrecondition, "declined"))
            },
            wantErr: codes.FailedPrecondition,
        },
        // ... resto de casos
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) { /* ... */ })
    }
}
```

### También puedes pedir:
- Tests con golden files para validar output de CLI commands
- Tests de integración con `testcontainers-go` (Postgres real, Redis real)
- Benchmarks para código de performance crítico
- Tests de UI de terminal con `bubbletea/teatest`
- Fuzzing para parsers o validadores de input
- Coverage report con identificación de paths sin testear

---

## `/issue-creation` — GitHub issues con contexto completo

Crea issues que tienen todo lo que alguien necesita para trabajar en ellos,
sin ir a buscar contexto adicional.

### Escenario: reportar un bug de producción

**Invocación:**
```
/issue-creation bug: los usuarios con plan Free ven el dashboard de Analytics
que debería ser solo para Pro. Pasó desde el deploy de ayer a las 18:00.
```

**Qué obtienes:**
```markdown
**Bug: Free plan users can access Pro Analytics dashboard**

## Summary
Users on the Free plan can navigate to /analytics and see full Pro-tier data.
This appears to have been introduced in the 2026-07-17 18:00 deploy.

## Steps to reproduce
1. Log in with a Free plan account
2. Navigate to /analytics directly via URL
3. Dashboard loads with full data visible

## Expected behavior
Free plan users should be redirected to /upgrade or see a paywall.

## Actual behavior
Full analytics dashboard is visible with no restriction.

## Impact
- Severity: High (billing/access control breach)
- Affected users: all Free plan accounts (~2,400 users)
- Revenue impact: potential conversion loss if Pro users notice

## Context
- Introduced in: commit abc1234 (deploy 2026-07-17 18:00 UTC)
- Related code: src/middleware/plan-guard.ts, src/pages/analytics/index.tsx
```

### También puedes pedir:
- Feature request con criterios de aceptación ya incluidos
- Issue de deuda técnica con estimación de impacto
- Issue de seguridad (con flag de confidencialidad)
- Epic con breakdown de sub-issues
- Issue de performance con métricas actuales vs objetivo
