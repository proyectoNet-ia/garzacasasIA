# 📊 Sistema de Analíticas y Estadísticas - Garza Casas IA

## Resumen del Sistema Implementado

Este documento describe el sistema completo de analíticas y tracking implementado en la plataforma Garza Casas IA.

---

## 🗄️ Base de Datos

### Tablas Creadas

#### 1. `property_views`
Registra cada visualización de una propiedad.

**Campos:**
- `id` - UUID único
- `property_id` - Referencia a la propiedad
- `agent_id` - Referencia al agente propietario
- `session_id` - ID de sesión del visitante (anónimo)
- `ip_address` - IP del visitante
- `user_agent` - Navegador/dispositivo
- `referrer` - Página de origen
- `viewed_at` - Timestamp de la vista

#### 2. `property_interactions`
Registra interacciones específicas con propiedades.

**Campos:**
- `id` - UUID único
- `property_id` - Referencia a la propiedad
- `agent_id` - Referencia al agente propietario
- `interaction_type` - Tipo de interacción:
  - `whatsapp_click` - Click en WhatsApp
  - `phone_click` - Click en teléfono
  - `email_click` - Click en email
  - `share` - Compartir propiedad
  - `favorite` - Marcar como favorito
  - `compare_add` - Añadir a comparación
- `session_id` - ID de sesión
- `ip_address` - IP del visitante
- `metadata` - Datos adicionales (JSONB)
- `created_at` - Timestamp

#### 3. `agent_stats_cache`
Caché de estadísticas agregadas por agente.

**Campos:**
- `agent_id` - ID del agente (PK)
- `total_properties` - Total de propiedades activas
- `total_views` - Total de vistas
- `total_whatsapp_clicks` - Total de clicks en WhatsApp
- `total_phone_clicks` - Total de clicks en teléfono
- `total_favorites` - Total de favoritos
- `avg_views_per_property` - Promedio de vistas por propiedad
- `last_updated` - Última actualización

### Seguridad (RLS)

- ✅ **Inserción pública**: Cualquiera puede registrar vistas e interacciones (tracking anónimo)
- ✅ **Lectura restringida**: Los agentes solo pueden ver sus propias estadísticas
- ✅ **Acceso admin**: Los administradores tienen acceso completo a todas las estadísticas

### Función SQL

**`refresh_agent_stats_cache(agent_id)`**
- Recalcula y actualiza las estadísticas en caché de un agente específico
- Se puede llamar manualmente o programar para ejecución automática

---

## 📚 Librería de Utilidades (`src/lib/analytics.ts`)

### Funciones Disponibles

#### `trackPropertyView(propertyId, agentId)`
Registra una vista de propiedad.
```typescript
await trackPropertyView(property.id, property.agent_id)
```

#### `trackPropertyInteraction(propertyId, agentId, type, metadata?)`
Registra una interacción específica.
```typescript
await trackPropertyInteraction(
    property.id, 
    property.agent_id, 
    'whatsapp_click'
)
```

#### `getAgentStats(agentId)`
Obtiene las estadísticas en caché de un agente.
```typescript
const stats = await getAgentStats(user.id)
// Retorna: { total_views, total_whatsapp_clicks, ... }
```

#### `refreshAgentStats(agentId)`
Fuerza la actualización del caché de estadísticas.
```typescript
await refreshAgentStats(user.id)
```

#### `getPropertyAnalytics(propertyId)`
Obtiene analíticas detalladas de una propiedad específica.
```typescript
const analytics = await getPropertyAnalytics(propertyId)
// Retorna: { totalViews, interactions, recentViews }
```

#### `getTopProperties(agentId, limit)`
Obtiene las propiedades más vistas de un agente.
```typescript
const topProps = await getTopProperties(user.id, 5)
```

---

## 🎯 Tracking Automático

### Implementado en:

#### 1. Página de Detalles (`/propiedades/[id]`)
- ✅ **Vista automática**: Se registra cuando se carga la página
- ✅ **Click en WhatsApp**: Se registra al hacer click en el botón
- ✅ **Click en teléfono**: Se registra al hacer click en llamar

#### 2. Catálogo de Propiedades (`FeaturedProperties.tsx`)
- ✅ **Click en "Contactar"**: Se registra el click en WhatsApp desde las tarjetas

---

## 📊 Dashboards Implementados

### 1. Dashboard del Agente (`/dashboard/stats`)

**Métricas Principales:**
- 📈 Total de vistas
- 💬 Clicks en WhatsApp
- 📞 Llamadas telefónicas
- ❤️ Propiedades favoritas

**Análisis:**
- Tasa de conversión (vistas → contactos)
- Promedio de vistas por propiedad
- Top 5 propiedades más vistas
- Última actualización de datos

**Funcionalidades:**
- Botón de actualización manual
- Visualización de tendencias
- Lista detallada de propiedades top con miniaturas

### 2. Dashboard del Admin (`/admin/analytics`)

**Estadísticas Globales:**
- 👥 Total de agentes
- 🏢 Propiedades totales
- 👁️ Vistas totales
- 📞 Contactos generados

**Ranking de Agentes:**
- Ordenamiento por:
  - Vistas totales
  - Tasa de engagement
  - Número de propiedades
- Badges de posición (🥇 🥈 🥉)
- Estadísticas individuales por agente

**Insights de Plataforma:**
- Top 3 agentes del mes
- Tasa de conversión global
- Promedio de propiedades por agente
- Vistas promedio por propiedad

---

## 🚀 Flujo de Datos

```
Usuario visita propiedad
    ↓
trackPropertyView() registra en property_views
    ↓
Usuario hace click en WhatsApp
    ↓
trackPropertyInteraction() registra en property_interactions
    ↓
Agente/Admin accede al dashboard
    ↓
Se consulta agent_stats_cache
    ↓
Si necesita actualización → refresh_agent_stats_cache()
    ↓
Se muestran estadísticas actualizadas
```

---

## 📁 Archivos del Sistema

### Migraciones
- `supabase/migrations/20240209_property_analytics.sql`

### Utilidades
- `src/lib/analytics.ts`

### Componentes
- `src/app/dashboard/stats/page.tsx` - Dashboard del agente
- `src/app/admin/analytics/page.tsx` - Dashboard del admin

### Integración
- `src/app/propiedades/[id]/page.tsx` - Tracking en detalles
- `src/components/marketing/FeaturedProperties.tsx` - Tracking en catálogo

---

## 🔧 Configuración Requerida

### 1. Aplicar Migración
```bash
# Ejecutar en Supabase SQL Editor
supabase/migrations/20240209_property_analytics.sql
```

### 2. Verificar RLS
Asegurarse de que las políticas de Row Level Security estén activas.

### 3. Probar Tracking
1. Visitar una propiedad
2. Hacer click en WhatsApp
3. Verificar en `/dashboard/stats` que se registró

---

## 📈 Métricas Clave

### Para Agentes
- **Vistas**: Cuántas personas vieron tus propiedades
- **Engagement**: % de vistas que se convirtieron en contacto
- **Top Properties**: Tus propiedades más populares

### Para Administradores
- **Rendimiento Global**: Estadísticas de toda la plataforma
- **Ranking de Agentes**: Quiénes son los más efectivos
- **Salud del Sistema**: Métricas de conversión y actividad

---

## 🎨 Características de Diseño

- ✅ **UI Premium**: Diseño moderno con gradientes y animaciones
- ✅ **Responsive**: Funciona en móvil, tablet y desktop
- ✅ **Tiempo Real**: Datos actualizables manualmente
- ✅ **Visual**: Iconos, badges y colores para facilitar lectura
- ✅ **Accesible**: Tooltips y descripciones claras

---

## 🔮 Mejoras Futuras Sugeridas

1. **Gráficas Temporales**: Mostrar evolución de vistas en el tiempo
2. **Exportación de Datos**: Permitir descargar reportes en PDF/Excel
3. **Notificaciones**: Alertas cuando una propiedad recibe mucha actividad
4. **Comparación de Períodos**: Ver cambios mes a mes
5. **Heatmaps**: Visualizar qué propiedades reciben más atención
6. **A/B Testing**: Probar diferentes descripciones/imágenes

---

## 📞 Soporte

Para preguntas sobre el sistema de analíticas, consultar:
- Documentación de Supabase: https://supabase.com/docs
- Código fuente en: `src/lib/analytics.ts`
