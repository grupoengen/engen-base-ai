# Diseño y Frontend

---

## `/frontend-design` — Interfaces web con alta calidad visual

Genera componentes y páginas production-ready que evitan la estética genérica de AI.
Funciona con React, Vue, o HTML/CSS puro.

### Escenario: página de login para una app SaaS B2B

**Invocación:**
```
/frontend-design página de login para app de gestión de inventario B2B.
Stack: React + TypeScript + Tailwind. Debe verse profesional, no startup genérica.
Brand color: #1B4FD8 (azul oscuro).
```

**Qué obtienes:**
- Componente React con TypeScript completo
- Manejo de estado del form (loading, error, success)
- Validación client-side con mensajes útiles
- Diseño con jerarquía visual clara, no un formulario centrado genérico
- Responsive sin media queries complicadas
- Accesibilidad: labels, aria, focus visible

**Ejemplo del tipo de output que genera:**
No un form con un botón azul centrado. Sino: layout dividido con branding a la izquierda,
formulario a la derecha, mensajes de error inline, skeleton de carga en el submit,
y tipografía que comunica seriedad sin ser aburrida.

### También puedes pedir:
- Landing page de producto con hero, features y CTA
- Onboarding step-by-step con progress indicator
- Tabla de precios con comparación de planes
- Página 404 que no haga perder al usuario
- Email template HTML (compatible con clientes de email)
- Componentes de UI: dropdowns, modals, toasts, date pickers

---

## `/interface-design` — Dashboards, panels y herramientas internas

Especializado en interfaces de producto: dashboards de datos, admin panels,
configuración de usuario, herramientas internas. No landing pages.

### Escenario: dashboard de métricas de e-commerce para el equipo de operaciones

**Invocación:**
```
/interface-design dashboard de operaciones para e-commerce.
Métricas: órdenes del día, revenue, tasa de conversión, stock crítico.
Stack: React + Recharts + Tailwind. Usuarios: equipo de ops, no técnicos.
```

**Qué obtienes:**
- Layout de dashboard con sidebar de navegación
- Cards de KPI con comparación vs período anterior (↑ 12% vs ayer)
- Gráfico de órdenes por hora (área chart, no pie chart)
- Tabla de stock crítico con alertas visuales por nivel
- Filtros de fecha que funcionan (hoy, esta semana, este mes, custom)
- Estados vacíos y de carga manejados, no pantallas en blanco

### También puedes pedir:
- Panel de administración de usuarios con roles
- Vista de configuración de organización (billing, team, integrations)
- Tabla de datos con sort, filter, y paginación
- Timeline de actividad (audit log)
- Kanban board de tareas
- Formulario de configuración compleja con secciones colapsables
- Monitor de jobs en background con estado en tiempo real

---

## `/tailwind-design-system` — Sistema de diseño con Tailwind CSS v4

Crea un sistema de diseño coherente: tokens, componentes base, y patrones responsive.
La diferencia con frontend-design: aquí construyes el sistema, no una página específica.

### Escenario: design system para una suite de productos internos

**Invocación:**
```
/tailwind-design-system necesitamos un design system para 3 apps internas
que se vean consistentes. Paleta de colores: azul corporativo #003087,
gris neutro, verde de éxito, rojo de error. React + Tailwind v4.
```

**Qué obtienes:**
- `tailwind.config.ts` con tokens semánticos (colores, spacing, tipografía)
- Componentes base: Button (variantes: primary, secondary, ghost, danger)
- Input, Select, Checkbox, Radio con estados (default, focus, error, disabled)
- Badge, Tag, Alert con variantes semánticas
- Card, Modal, Dropdown con comportamiento accesible
- Documentación de uso de cada componente

### También puedes pedir:
- Sistema de iconos integrado con la librería que ya usas
- Variantes dark mode automáticas con CSS variables
- Sistema de tipografía con escala modular
- Grid y layout helpers específicos para tu tipo de app
- Animaciones y transiciones consistentes
- Guía de cuándo usar cada variante de cada componente
