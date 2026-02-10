# 🏠 Garza Casas IA - Plataforma Inmobiliaria con IA

Plataforma inmobiliaria premium con inteligencia artificial para Monterrey y área metropolitana.

## 📊 Estado del Proyecto: **95% Completo**

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

#### 👨‍💼 **Dashboard de Administrador** 
- [x] Overview con KPIs en tiempo real
- [x] Gestión de Agentes
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

#### 🗄️ **Base de Datos**
- [x] Schema completo de propiedades
- [x] Sistema de perfiles con roles
- [x] Configuración de suscripciones
- [x] Tabla de site_settings para CMS
- [x] Storage buckets (properties, site-assets)
- [x] Políticas RLS de producción

---

### 🚧 Pendiente (5%)

#### 🔴 **Crítico - Antes de Producción**
1. **Aplicar Migraciones de Base de Datos**
   - [ ] Ejecutar `20240209_dual_dashboard_roles.sql` (roles y is_unlimited)
   - [ ] Ejecutar `20240209_cms_site_settings.sql` (tabla site_settings)
   - [ ] Ejecutar `20240209_production_rls_final.sql` (políticas de seguridad)

2. **Autenticación Real**
   - [ ] Reemplazar mock data con auth real de Supabase
   - [ ] Configurar flujo de login/registro
   - [ ] Implementar recuperación de contraseña

#### 🟡 **Importante - Post-Lanzamiento**
3. **Integración de Pagos**
   - [ ] Configurar Mercado Pago
   - [ ] Webhooks para actualización de suscripciones
   - [ ] Página de checkout

4. **Analytics Reales**
   - [ ] Conectar gráficos con datos reales
   - [ ] Implementar tracking de visitas
   - [ ] Dashboard de conversiones

5. **Optimizaciones**
   - [ ] Configurar CDN para imágenes
   - [ ] Implementar caché de propiedades
   - [ ] Optimizar queries de Supabase

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Shadcn UI
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Autenticación**: Supabase Auth
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
```

### Instalación
```bash
# Clonar repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar servidor de desarrollo
npm run dev
```

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (marketing)/          # Páginas públicas
│   ├── admin/                 # Dashboard Admin
│   ├── dashboard/             # Dashboard Agente
│   └── propiedades/           # Catálogo público
├── components/
│   ├── admin/                 # Componentes del admin
│   ├── dashboard/             # Componentes del agente
│   ├── marketing/             # Componentes públicos
│   ├── layout/                # Header, Footer, etc.
│   └── ui/                    # Componentes base (Shadcn)
├── hooks/                     # Custom hooks
├── lib/                       # Utilidades
└── providers/                 # Context providers

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

## 🎯 Próximos Pasos Inmediatos

1. **Aplicar migraciones** en Supabase SQL Editor
2. **Configurar autenticación** real
3. **Probar flujo completo** Admin → Agente → Público
4. **Configurar dominio** y desplegar en Vercel

---

## 📞 Soporte

Para dudas o problemas, revisar:
- Documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs
- Guía de Shadcn UI: https://ui.shadcn.com

---

**Última actualización**: 9 de febrero de 2026
**Versión**: 0.95.0 (Pre-producción)