# 📋 Estado y Pendientes del Proyecto — Garza Casas
**Última actualización:** 6 de Noviembre de 2026  
**Dominio Producción:** `https://www.garzacasas.com`  
**Stack:** Next.js 16 · React 19 · Supabase · PayPal API v2 · Gemini IA · INEGI DENUE/SHF · Vercel  

---

## ✅ BLOQUES COMPLETADOS Y LISTOS PARA PRODUCCIÓN

### 🔐 Bloque 1: Seguridad, Middleware, PayPal y Vigencia Automática (Completado)
- [x] **Middleware SSR activo (`src/middleware.ts`):** Protege `/admin/*` y `/dashboard/*` con matcher optimizado.
- [x] **Pasarela única PayPal API v2 blindada:** Creación de orden, captura con verificación de propiedad/monto y Webhook verificado criptográficamente (`PAYPAL_WEBHOOK_ID`) + validación OAuth2 servidor-a-servidor.
- [x] **Módulo Admin de Paquetes Dinámicos y Ventas:** Gestión en vivo de límites en `/admin/packages` y panel de ingresos en `/admin/sales`.
- [x] **SQL Consolidado e Idempotente (`20261106_consolidated_paypal_packages_security.sql`):** Aplicado en Supabase con RLS estricto, anti-IDOR en funciones `SECURITY DEFINER`, *Lazy Expiration* en tiempo real y Cron diario (`/api/cron/expire-subscriptions`).
- [x] **Variables de entorno configuradas en Vercel y local.**

### 🎨 Bloque 2: Conversión, Legal/Cookies, Eficiencia BD y UX (Completado)
- [x] **Contacto y Redes Dinámicos:** `Contact.tsx`, `contacto/page.tsx` y `Footer.tsx` conectados a `site_settings` sin consultas duplicadas (incluyendo WhatsApp directo y LinkedIn).
- [x] **Formulario de Contacto Funcional (`/api/contact`):** Integrado con Resend.
- [x] **Directorio y Perfil de Agentes:** Conectado a `profiles` con selección explícita de columnas (sin `select=*`), `<Skeleton />` loaders y edición de perfil en `/dashboard/profile`.
- [x] **Sistema de Soporte / Tickets:** Operativo en `/dashboard/support` y `/admin/support`.
- [x] **Cumplimiento Legal y Privacidad (LFPDPPP):** Páginas `/privacidad` y `/terminos` activas + `CookieConsentBanner.tsx` flotante que condiciona el registro analítico en `src/lib/analytics.ts`.
- [x] **Tipado Base de Datos (`supabase_types.ts`):** Definiciones TypeScript generadas.

---

## ⭐ BLOQUE 3: ROADMAP POST-LANZAMIENTO (EXPANSIÓN PRO / PLATINO & SEO)

### 🛠️ Herramientas Avanzadas Dashboard Agente
- [ ] **Comparador de zonas nacional (Plan Pro):** Comparativa entre 2 municipios/colonias por precio/m², crecimiento y densidad DENUE.
- [ ] **Alerta semanal de mercado (Plan Pro):** Resumen automatizado por correo (Resend + Cron) de movimientos en zonas donde opera el agente.
- [ ] **Reporte de Zona en PDF (Plan Platino):** Exportación descargable con datos INEGI + branding del agente para presentar a clientes compradores.
- [ ] **Mapa de calor nacional (Plan Platino):** Visualización interactiva por precio/m² y plusvalía.
- [ ] **Simulador de ROI y CRM ligero de prospectos (Plan Platino):** Cálculo de cap-rate/rentabilidad y seguimiento de leads dentro de `/dashboard`.

### 🌐 Crecimiento Orgánico Sitio Público (SEO Programático)
- [ ] **Guía Pública de Zonas (`/zonas` y `/zonas/[municipio]`):** Páginas indexables por Google generadas con datos SHF/DENUE + resumen ejecutivo IA.
- [ ] **Motor de Blog SEO (`/blog` y `/blog/[slug]`):** Tabla `blog_posts` en Supabase conectada al generador ya existente en `src/lib/gemini/client.ts`.

### 🔧 Configuración Operativa Menor
- [ ] **Plantillas HTML en Supabase Auth:** Pegar diseños de `docs/email-templates` en *Supabase Dashboard → Authentication → Email Templates*.
- [ ] **Paso a modo `live` en PayPal:** Cuando terminen las pruebas en `sandbox`, cambiar `PAYPAL_MODE=live`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` y crear el Webhook equivalente en la pestaña **Live** de PayPal Developer.
