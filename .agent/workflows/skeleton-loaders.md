---
description: Guía de implementación de Skeleton Loaders (Esqueletos de Carga)
---

# Regla de Oro: UX First con Skeleton Loaders

En este proyecto, NO se deben usar spinners globales (Loader2) o dejar pantallas vacías mientras se cargan datos de la base de datos o APIs. Se debe proporcionar un feedback visual inmediato mediante Skeleton Loaders.

## Directrices de Implementación

1. **Uso del Componente Base**: Utilizar siempre `@/components/ui/skeleton` para mantener la coherencia en las animaciones y colores.
2. **Mimetismo**: El esqueleto debe imitar lo más fielmente posible la estructura del contenido final (número de columnas, altura de las filas, avatares, etc.).
3. **Persistencia**: Todos los dashboards (Admin y Agente) deben implementar esqueletos para:
    - Tablas de datos.
    - Gráficos de analíticas.
    - Formularios de configuración.
    - Tarjetas de resumen (KPIs).
4. **Animación**: Asegurarse de que el componente skeleton incluya la clase `animate-pulse` para indicar actividad.

## Ejemplo de Uso en Tablas

```tsx
{loading ? (
    <ListingSkeleton /> // Componente dedicado que imita la tabla
) : (
    <DataTable data={data} />
)}
```

## Ejemplo de Uso en KPIs

```tsx
<div className="grid grid-cols-4 gap-4">
    {loading ? (
        <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            {/* ... */}
        </>
    ) : (
        <>
            <StatCard title="Total" value={100} />
            {/* ... */}
        </>
    )}
</div>
```
