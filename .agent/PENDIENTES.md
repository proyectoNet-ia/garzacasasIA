# 📋 Reporte de Pendientes — Garza Casas IA
**Última actualización:** 25 de Febrero 2026  
**Proyecto:** `d:\Proyecto NET\Garza Casas IA`  
**Stack:** Next.js 14 · Supabase · TypeScript · TailwindCSS · Vercel  
**Alcance geográfico:** Nacional — agentes en cualquier estado de México con datos INEGI locales

---

## ✅ ESTADO ACTUAL DEL CÓDIGO — Sesión Feb 25, 2026

### Archivos creados y listos para usar

| `src/lib/inegi/geografia.ts` | ✅ Listo | Catálogo nacional de estados y municipios (local JSON) |
| `src/lib/inegi/mexico-locations.json` | ✅ Nuevo | Base de datos local de 2,400+ municipios de México |
| `src/components/dashboard/PropertyForm.tsx` | 🚀 UX Premium | Nuevo conversor inteligente DMS/Decimal y campo único de coordenadas |
| `src/lib/inegi/client.ts` & `.env` | 🛠️ Corregido | Error de URL duplicada en DENUE (Solucionado) |
| `UPDATE_DATABASE.sql` | 🛠️ Actualizado | Incluye lat/lng (Double Precision) y municipio_clave |
### Próximos Pasos Inmediatos (Mañana)
1. **Supabase**: Ejecutar `UPDATE_DATABASE.sql` en el SQL Editor para garantizar que los nuevos campos (lat/lng/mun) se guarden.
2. **Validación de API**: Confirmar que con el parche de la URL, el error rojo en la ficha de propiedad ha desaparecido.
3. **Creación de Prueba**: Registrar una propiedad usando el nuevo campo de coordenadas único para verificar el guardado.
| `src/components/inegi/ServiciosCercanos.tsx` | ✅ Nuevo | Componente visual premium de servicios DENUE |
| `@google/generative-ai` | ✅ Instalado | Paquete npm ya en `package.json` |

---

### 🔑 Pasos exactos para activar las APIs al retomar

**Paso 1 — Token INEGI (gratis)**
- Ir a: `https://www.inegi.org.mx/app/api/denue/denue_api.aspx`
- Registrar email → llega el token al correo
- En `.env.local` descomentar y pegar:
  ```
  INEGI_API_TOKEN=tu_token_aqui
  ```

**Paso 2 — Google Gemini API key (gratis)**
- Ir a: `https://aistudio.google.com`
- Clic en "Create API Key" → copiar
- En `.env.local` descomentar y pegar:
  ```
  GOOGLE_AI_API_KEY=tu_key_aqui
  ```

**Paso 3 — Crear tabla de caché en Supabase**

Ejecutar en Supabase Dashboard → SQL Editor:
```sql
CREATE TABLE inegi_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inegi_cache_expires ON inegi_cache(expires_at);
```

**Paso 4 — Primera función a construir (empezar aquí)**
1. Crear `src/app/api/inegi/servicios/route.ts` → llama a `denue.ts`
2. Conectarla a la ficha pública `/propiedades/[id]`
3. Crear componente `src/components/inegi/ServiciosCercanos.tsx`
4. Mostrar en la ficha con datos reales del DENUE

**Paso 5 — Agregar keys a Vercel (producción)**
- Vercel Dashboard → Settings → Environment Variables
- Agregar `INEGI_API_TOKEN` y `GOOGLE_AI_API_KEY`

---


### 1. Integración de Pasarela de Pagos (Mercado Pago)
**Archivo afectado:** `src/app/dashboard/subscription/page.tsx`  
**Estado actual:** El botón "Mejorar a [Plan]" muestra un `toast.info('Próximamente: integración con Mercado Pago')`. Los planes están definidos en `subscriptions_config` de Supabase y se muestran correctamente, pero no procesan cobros.

**Lo que falta implementar:**
- Crear API Route: `src/app/api/payments/create-preference/route.ts` que llame a la API de Mercado Pago para generar una preferencia de pago
- Crear API Route: `src/app/api/payments/webhook/route.ts` para recibir notificaciones de Mercado Pago cuando un pago se aprueba y actualizar `profiles.subscription_plan` en Supabase
- En `subscription/page.tsx`: Reemplazar el toast por una redirección al checkout de Mercado Pago
- Variables de entorno necesarias: `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`
- En Supabase: Agregar columna `profiles.subscription_expires_at` (timestamp) para controlar vigencia
- Crear un cron job (Vercel Cron o Supabase Edge Function) que baje el plan a "Gratis" cuando expire

**Notas:**
- Los precios ya están en la tabla `subscriptions_config` (Gratis: $0, Pro: $499/mes, Platino: $999/mes)
- El campo `profiles.is_unlimited = true` ya existe para cuentas de admin que no pagan

---

### 2. Formulario de Contacto Funcional
**Archivo afectado:** `src/components/marketing/Contact.tsx`  
**Estado actual:** El formulario tiene inputs y botón "Enviar Mensaje" pero el `<form>` no tiene `onSubmit` — no envía nada.

**Lo que falta implementar:**
- Crear API Route: `src/app/api/contact/route.ts`
- Opciones de envío de email: Resend (recomendado, gratuito hasta 3k/mes) o Nodemailer con SMTP
- Variables de entorno: `RESEND_API_KEY`, `CONTACT_EMAIL_TO`
- Agregar estado de `loading`, validación de campos, y feedback al usuario
- Opcional: Guardar los mensajes en una tabla `contact_messages` de Supabase para historial en el admin

**Estructura sugerida del API route:**
```typescript
// src/app/api/contact/route.ts
import { Resend } from 'resend'
export async function POST(req: Request) {
  const { name, email, message } = await req.json()
  // Enviar email al cliente y confirmación al usuario
}
```

---

### 3. Sección de Agentes — Conectar a Datos Reales
**Archivo afectado:** `src/components/marketing/Agents.tsx`  
**Estado actual:** Tiene 3 agentes hardcodeados (Sofía Garza, Ricardo Casas, Elena Marín) con datos e imágenes de placeholder.

**Lo que falta decidir con el cliente:**
- Opción A: Los agentes se muestran automáticamente desde `profiles` donde `role = 'agent'` y `is_public = true` (hay que agregar campo `is_public` a `profiles`)
- Opción B: El admin selecciona manualmente qué agentes aparecen en el sitio público (requiere tabla `featured_agents`)
- Agregar a `profiles`: `bio`, `specialty`, `photo_url`, `social_instagram`, `social_linkedin`, campos que el agente llena desde su dashboard

---

## 🟡 IMPORTANTE — Afecta la imagen y el negocio

### 4. Plantillas de Correo Personalizadas en Supabase
**Ubicación:** Supabase Dashboard → Authentication → Email Templates  
**Estado actual:** Los emails de verificación y recuperación llegan con el diseño genérico de Supabase (logo de Supabase, texto en inglés en partes).

**Lo que falta:**
- Editar en el dashboard de Supabase las plantillas: `Confirm Signup`, `Reset Password`, `Magic Link`
- Diseño propuesto: fondo oscuro (#0f0f0f), azul (#2563EB), logo de Garza Casas IA, texto en español
- El `redirectTo` ya está correctamente configurado en el código para apuntar a `/auth/callback`

---

### 5. Datos de Contacto Reales en el Sitio
**Archivos afectados:** `src/components/marketing/Contact.tsx`, `src/components/layout/Footer.tsx`  
**Estado actual:** Teléfono (+52 81 1234 5678) y email (hola@garzacasas.ia) son de placeholder.

**Solución:** Mover estos datos a `site_settings` en Supabase y exponerlos mediante el CMS del admin. Ya existe la tabla — solo agregar columnas `contact_phone`, `contact_email`, `contact_address` y leerlos desde el componente.

---

### 6. Links de Redes Sociales Reales
**Archivos afectados:** CMS Admin (`/admin/cms`), `Navbar.tsx`, `SecondaryNavbar.tsx`, `Footer.tsx`  
**Estado actual:** Los campos del CMS para redes sociales están vacíos. El cliente los debe llenar.

**Nota técnica:** El WhatsApp del contacto general ya se lee desde `site_settings.contact_whatsapp` en `contactConfig`. Solo hace falta que el cliente ingrese las URLs reales desde el panel.

---

## 🟢 INTEGRACIÓN INEGI — Feature Premium ⭐

### 7. API del INEGI para Agentes Premium

**✅ Investigación completada (Feb 25, 2026):** Los datos 2025-2026 SÍ están disponibles en tiempo real.

---

**Datos reales disponibles HOY para Michoacán / Morelia:**

| Indicador | Valor | Fuente / Actualización |
|---|---|---|
| Precio m² casas Morelia (Feb 2026) | **$23,233 MXN/m²** | Properstar Feb 2026 |
| Precio m² departamentos Morelia (Feb 2026) | **$20,842 MXN/m²** | Properstar Feb 2026 |
| Precio m² casas Morelia (Ene 2026) | **$21,539 MXN/m²** | Lamudi Ene 2026 |
| Precio promedio casa en venta (2024) | **$3,384,072 MXN** | Vivanuncios 2024 |
| Precio promedio departamento en venta (2024) | **$2,165,132 MXN** | Vivanuncios 2024 |
| Demanda residencial Morelia 2024 | **+8.3% anual** | CBAméricas 2024 |
| Población Michoacán (Censo 2020) | **4,748,846 hab** | INEGI 2020 |
| Crecimiento poblacional 2010-2020 | **+9.14%** | INEGI |
| PIB Michoacán | **13° lugar nacional** | Michoacán.gob 2025 |
| Exportaciones Q2 2025 | **US$1,706M** | SE México |
| DENUE establecimientos disponibles | **6,058,548 (Censos 2024)** | INEGI Nov 2024 |
| UMA 2026 | **Activa desde 1 Feb 2026** | INEGI |

**Zonas de mayor plusvalía en Morelia identificadas:**
- 🏆 **Altozano** — fraccionamiento exclusivo, precio más alto de la ciudad
- 🏆 **Club Campestre** — residencial premium, casas desde $4M+
- 📈 **Zona Sur** — mayor plusvalía proyectada, infraestructura nueva
- 📚 **Corredores universitarios** (UNAM Campus Morelia, Tec de Monterrey) — alta demanda constante
- 🎨 **Centro Histórico / Chapultepec** — rehabilitación para nómadas digitales, turismo cultural

**Factores de plusvalía confirmados 2025-2026:**
- Teleférico de Morelia (detonante de valor en zonas adyacentes)
- Nuevos pasos elevados y vialidades
- Barrios Históricos 4.0 (casonas coloniales convertidas)
- Expo Tu Casa y Construcción Morelia 2025 (oct 2025)

---

**APIs del INEGI confirmadas y disponibles:**

**1. DENUE API** ← El más útil para "servicios cercanos a la propiedad"
- URL: `https://www.inegi.org.mx/app/api/denue/`
- 6+ millones de establecimientos, datos Censos 2024
- Consulta por lat/lng + radio
- Token gratuito: registrarse en `inegi.org.mx/app/api/denue/denue_api.aspx`

**2. Banco de Indicadores API** ← Para el "score económico de zona"
- URL: `https://www.inegi.org.mx/app/api/indicadores/`
- Incluye INPC (inflación), IGAE, PIB, UMA 2026, Índice precios vivienda
- Datos a nivel nacional, estatal y municipal
- Token gratuito: mismo registro que DENUE

**3. Índice de Precios de Vivienda (SHF-INEGI)**
- Actualización trimestral
- Q3 2025 disponible (+16.5% variación anual NL)
- Q4 2025 se publica ~marzo 2026
- Clave de indicador: buscar en el Query Builder del Banco de Indicadores
- Variable de entorno necesaria: `INEGI_API_TOKEN`

---

**Objetivo:** Dar a los agentes Pro y Platino acceso a datos socioeconómicos y demográficos del INEGI directamente en su dashboard y en las fichas de propiedades, posicionando la plataforma como la única en México que integra datos oficiales de gobierno al análisis inmobiliario.

---

**⚠️ NOTA: Estado anterior de planes reemplazado — ver especificación oficial abajo.**

---

## ✅ ESPECIFICACIÓN OFICIAL DE PLANES — Aprobada por cliente (Feb 25, 2026)

> Cada plan incluye TODAS las funciones del plan anterior (modelo acumulativo).

---

### 🆓 Plan Gratis — $0/mes
*Para empezar a usar la plataforma*

| # | Función | Descripción |
|---|---|---|
| 1 | **Calculadora de precio/m²** | Compara precio de su propiedad contra el promedio real de Morelia ($23,233 casas / $20,842 deptos) |
| 2 | **Estimador de precio de venta** | Sugerencia de rango de precio según zona, m² y tipo de propiedad |
| 3 | **Link de agente personalizado** | `garzacasas.ia/agente/nombre` para compartir en WhatsApp y redes |
| 4 | **Estadísticas básicas** | Vistas y clics en WhatsApp por propiedad |
| — | **Límites** | 5 propiedades activas · 3 imágenes c/u · Soporte básico |

---

### 💼 Plan Pro — $499/mes
*Todo lo de Gratis +*

| # | Función | API/Fuente |
|---|---|---|
| 5 | **Servicios cercanos en ficha pública** | DENUE — escuelas, hospitales, bancos, supermercados en X metros |
| 6 | **Badge de plusvalía de zona** | SHF-INEGI — semáforo 🟢🟡🔴 calculado con datos oficiales |
| 7 | **Comparador de zonas** | INEGI — compara 2 colonias/municipios de cualquier estado por precio, crecimiento y servicios |
| 8 | **Alerta de mercado semanal** | Resumen de movimientos de precio en las zonas donde opera el agente |
| — | **Límites** | 50 propiedades activas · 15 imágenes c/u · Soporte normal |

---

### 👑 Plan Platino — $999/mes
*Todo lo de Pro +*

| # | Función | API/Fuente |
|---|---|---|
| 9 | **Reporte de zona en PDF** | DENUE + INEGI — documento profesional para compartir con clientes |
| 10 | **Mapa de calor nacional** | SHF-INEGI — precio/m² en los 2,469 municipios de México, el mapa se centra en las zonas donde opera el agente |
| 11 | **Análisis de plusvalía histórica** | INEGI — gráfica de crecimiento de precios en los últimos años por zona |
| 12 | **Perfil del comprador ideal por zona** | Censo INEGI — ingreso, escolaridad y composición familiar de la colonia |
| 13 | **Descripción con IA + INEGI** | **Gemini 1.5 Flash** + INEGI — genera texto de venta profesional con datos reales de la zona |
| 14 | **🧠 Análisis de insights de zona (IA)** | **Gemini 1.5 Flash** + INEGI — interpreta todos los datos de la zona y entrega: oportunidad de precio, potencial de inversión, perfil del comprador ideal, consideraciones de mercado y argumento de cierre sugerido |
| 15 | **Simulador de ROI** | Cálculo de rentabilidad estimada para propiedades de inversión |
| 16 | **CRM de prospectos** | Seguimiento de clientes interesados directamente en el dashboard |
| — | **Límites** | Propiedades ilimitadas · 30 imágenes c/u · Soporte prioritario |

---

### 📊 Tabla comparativa completa

| Función | Gratis | Pro | Platino |
|---|:---:|:---:|:---:|
| Calculadora precio/m² | ✅ | ✅ | ✅ |
| Estimador precio venta | ✅ | ✅ | ✅ |
| Link agente personalizado | ✅ | ✅ | ✅ |
| Estadísticas básicas | ✅ | ✅ | ✅ |
| Propiedades activas | **5** | **50** | **∞** |
| Imágenes por propiedad | **3** | **15** | **30** |
| Servicios cercanos (DENUE) | ❌ | ✅ | ✅ |
| Badge plusvalía de zona | ❌ | ✅ | ✅ |
| Comparador de zonas (nacional) | ❌ | ✅ | ✅ |
| Alerta mercado semanal | ❌ | ✅ | ✅ |
| Reporte PDF con INEGI | ❌ | ❌ | ✅ |
| Mapa de calor nacional | ❌ | ❌ | ✅ |
| Análisis plusvalía histórica | ❌ | ❌ | ✅ |
| Perfil comprador ideal | ❌ | ❌ | ✅ |
| Descripción con IA + INEGI | ❌ | ❌ | ✅ |
| 🧠 Análisis de insights de zona (IA) | ❌ | ❌ | ✅ |
| Simulador ROI | ❌ | ❌ | ✅ |
| CRM de prospectos | ❌ | ❌ | ✅ |
| Soporte | Básico | Normal | Prioritario |

---

**Arquitectura técnica sugerida:**

```
src/
├── lib/
│   └── inegi/
│       ├── client.ts          ← Cliente HTTP + caché Supabase
│       ├── denue.ts           ← Servicios cercanos por lat/lng
│       ├── indicadores.ts     ← INPC, IGAE, UMA 2026, Índice precios vivienda
│       └── tipos.ts           ← Types de respuesta INEGI
├── app/
│   └── api/
│       └── inegi/
│           ├── zona-score/route.ts     ← GET ?lat=&lng=
│           ├── servicios/route.ts      ← GET ?lat=&lng=&radio=500
│           └── plusvalia/route.ts      ← GET ?municipio_clave=19032
└── components/
    └── premium/
        ├── ZonaScore.tsx              ← Badge de score + precio/m² actual
        ├── ServiciosCercanos.tsx      ← Lista servicios DENUE
        ├── ComparativaPrecios.tsx     ← Precio propiedad vs promedio municipal
        ├── MapaCalorValor.tsx         ← Heatmap con Leaflet/Mapbox
        └── ReportePDF.tsx             ← PDF con datos INEGI + logo cliente
```

**Caché sugerido:** Los datos DENUE cambian poco. Guardar en Supabase con TTL de 7 días.

```sql
-- Tabla de caché para datos INEGI
CREATE TABLE inegi_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,  -- e.g. "denue_19_032_25.6820_-100.3161_500"
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Limpiar caché expirado automáticamente
CREATE INDEX idx_inegi_cache_expires ON inegi_cache(expires_at);
```

**Variables de entorno necesarias:**
```env
INEGI_API_TOKEN=          # Token gratuito de inegi.org.mx
INEGI_DENUE_BASE_URL=https://www.inegi.org.mx/app/api/denue/v1
INEGI_INDICADORES_BASE_URL=https://www.inegi.org.mx/app/api/indicadores/series
```

---

## 🔵 MEJORAS TÉCNICAS PENDIENTES

### 8. Perfil de Agente — Campos Faltantes
**Archivo:** `src/app/dashboard/` — no existe aún `profile/page.tsx`  
El agente no tiene una página para editar su bio, foto, especialidad y redes sociales. Hay que crearla.

**Campos a agregar en `profiles`:**
```sql
ALTER TABLE profiles ADD COLUMN bio TEXT;
ALTER TABLE profiles ADD COLUMN specialty TEXT; -- 'ventas', 'renta', 'comercial', 'residencial'
ALTER TABLE profiles ADD COLUMN photo_url TEXT;
ALTER TABLE profiles ADD COLUMN social_instagram TEXT;
ALTER TABLE profiles ADD COLUMN social_linkedin TEXT;
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
```

---

### 9. Galería de Imágenes en Propiedades
**Estado actual:** Existe la migración `20240224_add_images_gallery.sql` pero no está confirmado si el `PropertyForm.tsx` ya permite subir múltiples imágenes o solo una.  
**Verificar:** Que `PropertyForm` permita hasta N imágenes según el plan del agente.

---

### 10. WhatsApp del Sitio en el CMS
**Archivo:** `src/app/admin/settings/page.tsx` y `src/app/admin/cms/page.tsx`  
**Estado:** El CMS tiene Facebook, Instagram, LinkedIn — pero le falta campo para WhatsApp de la empresa (número de contacto general, diferente al de cada agente).

---

### 11. LinkedIn en el CMS de Redes Sociales
**Archivo:** `src/app/admin/cms/page.tsx` línea 402  
**Estado:** LinkedIn ya aparece en el CMS pero no está conectado al `contactConfig` que usan los componentes del sitio (Navbar, SecondaryNavbar). Verificar que se esté leyendo correctamente.

---

## 📊 RESUMEN EJECUTIVO

| # | Tarea | Prioridad | Estimado |
|---|-------|-----------|----------|
| 1 | Pasarela de pago (Mercado Pago) | 🔴 Crítico | 2-3 días |
| 2 | Formulario de contacto funcional | 🔴 Crítico | 4 horas |
| 3 | Agentes desde base de datos | 🔴 Crítico | 1 día |
| 4 | Plantillas de email Supabase | 🟡 Importante | 2 horas |
| 5 | Datos de contacto en CMS | 🟡 Importante | 3 horas |
| 6 | Redes sociales reales | 🟡 Importante | 30 min (cliente) |
| 7 | Integración INEGI (Pro/Platino) | ⭐ Premium | 1-2 semanas |
| 8 | Perfil editable del agente | 🔵 Técnico | 1 día |
| 9 | Galería múltiple de imágenes | 🔵 Técnico | 4 horas |
| 10 | WhatsApp empresa en CMS | 🔵 Técnico | 1 hora |
| 11 | LinkedIn en contactConfig | 🔵 Técnico | 30 min |

---

## 🔑 Variables de Entorno Pendientes de Configurar

```env
# Mercado Pago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=

# Email (Resend recomendado)
RESEND_API_KEY=
CONTACT_EMAIL_TO=

# INEGI
INEGI_API_TOKEN=          # Gratis en inegi.org.mx/app/api/denue/denue_api.aspx

# IA — Google Gemini (GRATIS: 1,500 req/día · 1M tokens/día)
GOOGLE_AI_API_KEY=        # Gratis en aistudio.google.com

# Ya configuradas ✅
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🌐 VISIÓN SITIO PÚBLICO — Enriquecido con INEGI + IA

> **Objetivo estratégico:** Transformar el sitio de un catálogo de propiedades a la referencia inmobiliaria de México con datos oficiales del gobierno. Ningún competidor (Lamudi, Inmuebles24, Vivanuncios) hace esto.

---

### 1. Ficha pública de cada propiedad — enriquecida automáticamente

**Sección nueva debajo de las fotos:**
```
🏘️ Datos de la Zona (Fuente: INEGI 2026)
─────────────────────────────────────────
📈 Plusvalía anual: +8.3%
🏷️ Precio promedio m²: $23,233
👥 Perfil: Familias nivel medio-alto

📍 Servicios cercanos
🏫 3 escuelas  🏥 1 hospital  🏦 2 bancos  🛒 4 supermercados

🧠 Análisis IA: "Propiedad 7% por debajo del promedio de zona.
Alta demanda histórica en este perfil de colonia."
```
- Datos cargados automáticamente al publicar la propiedad
- Badge *"Verificado con datos INEGI"* para generar confianza
- El análisis IA aparece en versión resumida (el completo es para el agente)

---

### 2. Sección pública "Guía de Zonas" — nueva página

**URL:** `/zonas` o `/explora`

El visitante elige municipio o colonia → el sitio genera:
- Precio promedio/m² actual (SHF-INEGI)
- Plusvalía histórica con gráfica
- Servicios disponibles (DENUE)
- Perfil socioeconómico (Censo INEGI)
- Párrafo generado por IA: resumen ejecutivo de la zona

**Impacto SEO:** Páginas únicas por cada zona con datos reales → Google las indexa. Nadie más tiene este contenido.

---

### 3. Bloque "Mercado Hoy" en el Home — datos en vivo

**Sección nueva en la página principal**, actualizada mensualmente vía INEGI:

```
📊 El mercado inmobiliario hoy — Datos INEGI
─────────────────────────────────────────────
$23,233/m²     +8.3%        $3,384,072
Precio casa    Plusvalía    Precio promedio
Morelia/Feb26  anual        de venta

Fuente: INEGI / SHF — Actualizado mensualmente
```

Da **autoridad y credibilidad** inmediata al visitante.

---

### 4. Buscador de propiedades — filtros con datos INEGI

Filtros nuevos que ningún portal en México tiene:
- ✅ *"Solo zonas con plusvalía > X% anual"*
- ✅ *"Con escuelas a menos de 500m"*
- ✅ *"Nivel socioeconómico: medio / medio-alto / alto"*
- ✅ *"Municipios en crecimiento"*

**Implementación:** Los datos INEGI de cada propiedad se almacenan en caché en Supabase al publicarla → los filtros consultan la DB, no la API en cada búsqueda.

---

### 5. Blog automático con SEO — artículos generados con INEGI + IA

**Gemini + datos INEGI generan artículos automáticamente:**

- *"Mejores zonas para invertir en Morelia en 2026 — con datos INEGI"*
- *"Precio del m² en Uruapan: análisis del mercado actual"*
- *"¿Conviene comprar en Altozano? Datos oficiales 2026"*
- *"Colonias de Michoacán con mayor plusvalía histórica"*

Cada artículo es único, contiene datos reales y es indexable por Google. Generación: 1 artículo por zona/mes sin intervención manual.

**Tabla en Supabase necesaria:**
```sql
CREATE TABLE blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  zona TEXT,                    -- municipio/colonia que trata
  inegi_data JSONB,             -- datos INEGI usados
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. Mapa de calor público

Versión simplificada del mapa Platino visible para todos los visitantes:
- Colorea zonas por precio/m² (escala de colores)
- Al hacer clic en una zona → muestra precio promedio + propiedades disponibles
- Librería: **Leaflet.js** (open source, gratuita) + datos SHF-INEGI

---

### 📈 Impacto esperado por área del sitio

| Área | Sin INEGI | Con INEGI |
|---|---|---|
| Ficha de propiedad | Fotos + datos básicos | + Zona, servicios, análisis IA |
| Home | Texto estático | Indicadores de mercado en vivo |
| Buscador | Filtros básicos | + Filtros INEGI (plusvalía, servicios) |
| Página de zonas | No existe | Guía completa generada con IA |
| Blog | Vacío | Artículos auto-generados datos reales |
| SEO | Genérico | Contenido único con datos INEGI |
| Credibilidad | Portal de anuncios | Plataforma de inteligencia inmobiliaria |

---

### 🗂️ Componentes nuevos a crear (sitio público)

```
src/components/
├── inegi/
│   ├── ZonaDataCard.tsx         ← Badge datos INEGI en ficha propiedad
│   ├── ServiciosCercanos.tsx    ← Lista íconos servicios DENUE
│   ├── PlusvaliaBadge.tsx       ← Semáforo plusvalía
│   ├── MercadoHoyBlock.tsx      ← Bloque home con stats en vivo
│   └── MapaCalorPublico.tsx     ← Leaflet mapa público
src/app/
├── zonas/
│   ├── page.tsx                 ← Índice de zonas
│   └── [municipio]/page.tsx    ← Página por municipio (SSG/ISR)
├── blog/
│   ├── page.tsx                 ← Listado de artículos
│   └── [slug]/page.tsx         ← Artículo individual
```

---

*Documento generado el 25 Feb 2026 — Para uso interno del equipo de desarrollo.*
