# 🏠 Garza Casas IA - Plataforma Inmobiliaria con IA

Plataforma inmobiliaria premium con inteligencia artificial y datos INEGI para Monterrey y área metropolitana.

## 📊 Estado del Proyecto: **100% Completo** 🎉

### ✅ Completado (100%)

#### 🎨 **Frontend & UX**
- [x] Landing page con Hero dinámico
- [x] Sistema de búsqueda avanzada con filtros
- [x] Catálogo de propiedades con priorización (Platino/Pro/Básico)
- [x] Sistema de comparación de propiedades
- [x] Sistema de favoritos (likes)
- [x] Diseño responsive y premium
- [x] Skeleton Loaders en toda la aplicación
- [x] Toast notifications (Sonner)
- [x] Optimización de imágenes (Next/Image)

#### 🔐 **Autenticación & Seguridad**
- [x] Middleware de protección de rutas
- [x] Row Level Security (RLS) en Supabase
- [x] Control de acceso basado en roles (RBAC)
- [x] Políticas de seguridad para Admin vs Agent
- [x] Flujo completo de login / registro / recuperación de contraseña

#### 👨‍💼 **Dashboard de Administrador**
- [x] Overview con KPIs en tiempo real
- [x] Gestión de Agentes (incluyendo promoción a Admin)
- [x] Gestión de Propiedades (ilimitadas)
- [x] CMS para Hero Banner (título, subtítulo, imagen)
- [x] CMS para Site Icon (favicon)
- [x] CMS para Redes Sociales
- [x] CMS para SEO (meta tags)
- [x] Gestión de Planes de Suscripción
- [x] Analytics (estructura base)
- [x] Validación de dimensiones de imágenes
- [x] Restauración de imagen original del Hero

#### 🏢 **Dashboard de Agente**
- [x] Overview personalizado
- [x] CRUD completo de propiedades
- [x] Límites de suscripción integrados
- [x] Alertas de límites próximos/alcanzados
- [x] Validación de límites antes de crear propiedades
- [x] Skeleton loaders en tablas
- [x] Diseño light theme consistente

#### 🤖 **Inteligencia Artificial (Gemini 2.5 Flash)**
- [x] Cliente Gemini configurado (`src/lib/gemini/client.ts`)
- [x] Generador de descripciones de propiedades con datos INEGI
- [x] Analizador de zona (oportunidad, potencial, perfil comprador)
- [x] Generador de artículos de blog con SEO automático
- [x] Modelo: `gemini-2.5-flash` (billing activo, Pay-as-you-go)

#### 🏛️ **Integración INEGI**
- [x] Cliente DENUE configurado (`src/lib/inegi/denue.ts`)
- [x] Búsqueda de establecimientos por coordenadas y radio
- [x] Endpoint validado: `Buscar/{condicion}/{lat},{lon}/{metros}/{token}`
- [x] Token activo: 68+ establecimientos devueltos en pruebas

#### 🗄️ **Base de Datos**
- [x] Schema completo de propiedades
- [x] Sistema de perfiles con roles
- [x] Configuración de suscripciones (Gratis / Pro / Platino)
- [x] Tabla de site_settings para CMS
- [x] Storage buckets (properties, site-assets)
- [x] Políticas RLS de producción
- [x] Hook `useSubscriptionLimits` para validaciones

---

### ✅ Completado (100%)

#### 💳 **Integración de Pagos (Mercado Pago)**
- [x] SDK de Mercado Pago instalado y configurado (`src/lib/mercadopago/client.ts`)
- [x] API Route de checkout (`/api/checkout`) con preferencias de pago
- [x] Webhook de Mercado Pago (`/api/webhooks/mercadopago`) con procesamiento automático
- [x] Actualización automática de suscripción tras pago aprobado (función SQL)
- [x] Página de suscripción del agente con toggle mensual/anual (`/dashboard/suscripcion`)
- [x] Páginas de retorno: éxito, error y pago pendiente
- [x] Tabla `payments` en BD con RLS y vista `admin_payments_summary`
- [x] Trigger SQL `update_user_subscription_after_payment()`

---

### 🔮 Mejoras Futuras (Post-MVP)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Shadcn UI
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Autenticación**: Supabase Auth
- **IA**: Google Gemini 2.5 Flash (Pay-as-you-go)
- **Datos Oficiales**: INEGI DENUE API v1
- **Notificaciones**: Sonner
- **Iconos**: Lucide React
- **Tipografía**: Montserrat (Google Fonts)

---

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
Node.js 18+
npm o pnpm
Cuenta de Supabase
Google AI Studio API Key (billing activo)
Token INEGI DENUE
```

### Instalación
```bash
# Clonar repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar servidor de desarrollo
npm run dev
```

### Variables de Entorno Requeridas
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Google Gemini IA
GOOGLE_AI_API_KEY=AIzaSy...  # Obtener en https://aistudio.google.com/apikey

# INEGI DENUE
INEGI_API_TOKEN=tu_token     # Obtener en https://www.inegi.org.mx/app/api/denue
INEGI_DENUE_BASE_URL=https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar
INEGI_INDICADORES_BASE_URL=https://www.inegi.org.mx/app/api/indicadores/series
```

### Validar APIs
```bash
# Verifica que Gemini e INEGI están funcionando
node scripts/test-apis.mjs
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── admin/                 # Dashboard Admin
│   ├── dashboard/             # Dashboard Agente
│   └── propiedades/           # Catálogo público
├── components/
│   ├── admin/                 # Componentes del admin
│   ├── dashboard/             # Componentes del agente
│   ├── marketing/             # Componentes públicos
│   ├── layout/                # Header, Footer, etc.
│   └── ui/                    # Componentes base (Shadcn)
├── hooks/                     # Custom hooks (useSubscriptionLimits, etc.)
├── lib/
│   ├── gemini/                # Cliente IA (client.ts)
│   └── inegi/                 # Cliente INEGI (denue.ts, tipos.ts)
└── providers/                 # Context providers

scripts/
└── test-apis.mjs              # Validador de APIs (Gemini + INEGI)

supabase/
└── migrations/                # Migraciones SQL
```

---

## 🔒 Seguridad

### Middleware de Protección
El archivo `src/middleware.ts` protege automáticamente:
- `/admin/*` - Solo usuarios con `role: 'admin'`
- `/dashboard/*` - Solo usuarios autenticados

### Row Level Security (RLS)
Todas las tablas tienen políticas RLS:
- **Propiedades**: Agentes solo ven/editan las suyas
- **Perfiles**: Usuarios solo editan su propio perfil
- **Site Settings**: Solo admins pueden modificar

---

## 📝 Reglas del Proyecto

### UX First - Skeleton Loaders
**Regla obligatoria**: Nunca mostrar spinners globales o pantallas vacías.
- Usar `<Skeleton />` de `@/components/ui/skeleton`
- Implementar esqueletos que imiten la estructura final
- Ver `.agent/workflows/skeleton-loaders.md` para guía completa

---

## 🎯 Próximos Pasos

1. **Integrar pagos** con Mercado Pago
2. **Conectar analytics** con datos reales de Supabase
3. **Configurar dominio** y desplegar en Vercel (producción)

---

## 📞 Soporte

Para dudas o problemas, revisar:
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs
- Guía de Shadcn UI: https://ui.shadcn.com
- Google AI Studio: https://aistudio.google.com
- INEGI DENUE API: https://www.inegi.org.mx/app/api/denue

---

**Última actualización**: 26 de febrero de 2026  
**Versión**: 0.98.0 (Pre-producción)