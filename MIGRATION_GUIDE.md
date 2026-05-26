# 🗄️ Guía de Aplicación de Migraciones

## ⚠️ IMPORTANTE: Aplicar en Orden

Estas migraciones deben aplicarse **en orden secuencial** para evitar errores de dependencias.

---

## 📋 Migraciones Pendientes

### 1️⃣ **Dual Dashboard Roles** (CRÍTICO)
**Archivo:** `20240209_dual_dashboard_roles.sql`

**Qué hace:**
- Agrega columna `role` a la tabla `profiles` (valores: 'admin' o 'agent')
- Agrega columna `is_unlimited` para planes ilimitados
- Establece valores por defecto

**Cómo aplicar:**
1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido completo del archivo
3. Ejecuta (Run)

---

### 2️⃣ **CMS Site Settings** (CRÍTICO)
**Archivo:** `20240209_cms_site_settings.sql`

**Qué hace:**
- Crea tabla `site_settings` para el CMS
- Crea bucket de storage `site-assets`
- Inserta valores por defecto (Hero, SEO, etc.)
- Configura políticas RLS

**Cómo aplicar:**
1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido completo del archivo
3. Ejecuta (Run)

---

### 3️⃣ **Production RLS Final** (CRÍTICO)
**Archivo:** `20240209_production_rls_final.sql`

**Qué hace:**
- Elimina políticas de desarrollo (acceso abierto)
- Implementa RLS estricto para producción
- Protege: `site_settings`, `profiles`, `properties`, `subscriptions_config`
- Protege storage buckets: `properties`, `site-assets`

**Cómo aplicar:**
1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido completo del archivo
3. Ejecuta (Run)

---

## ✅ Verificación Post-Migración

Después de aplicar las 3 migraciones, verifica:

### 1. Tabla `profiles` tiene nuevas columnas:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('role', 'is_unlimited');
```

**Resultado esperado:**
```
role          | text
is_unlimited  | boolean
```

### 2. Tabla `site_settings` existe:
```sql
SELECT * FROM site_settings WHERE id = 1;
```

**Resultado esperado:** 1 fila con valores por defecto del Hero

### 3. Bucket `site-assets` existe:
```sql
SELECT * FROM storage.buckets WHERE id = 'site-assets';
```

**Resultado esperado:** 1 fila con `public = true`

### 4. Políticas RLS están activas:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('site_settings', 'profiles', 'properties');
```

**Resultado esperado:** Múltiples políticas con nombres como "Public Read Settings", "Admin CRUD Settings", etc.

---

## 🚨 Solución de Problemas

### Error: "relation already exists"
**Causa:** La tabla ya fue creada previamente.
**Solución:** Puedes ignorar este error o usar `CREATE TABLE IF NOT EXISTS`

### Error: "column already exists"
**Causa:** La columna ya existe.
**Solución:** Puedes ignorar o usar `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`

### Error: "policy already exists"
**Causa:** La política RLS ya existe.
**Solución:** Primero elimina la política antigua:
```sql
DROP POLICY IF EXISTS "nombre_de_la_politica" ON nombre_tabla;
```

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard/project/wcsscjydecukdgzihcsm
- **SQL Editor:** https://supabase.com/dashboard/project/wcsscjydecukdgzihcsm/sql
- **Storage:** https://supabase.com/dashboard/project/wcsscjydecukdgzihcsm/storage/buckets

---

## 📞 Soporte

Si encuentras errores durante la migración:
1. Copia el mensaje de error completo
2. Verifica que aplicaste las migraciones en orden
3. Revisa la sección de "Solución de Problemas" arriba
