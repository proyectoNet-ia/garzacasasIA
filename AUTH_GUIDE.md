# 🔐 Sistema de Autenticación - Garza Casas IA

## 📋 Resumen del Sistema

El sistema de autenticación está completamente implementado con Supabase Auth y protección de rutas basada en roles.

---

## ✅ Componentes Implementados

### 1. **Página de Login** (`/login`)
- ✅ Diseño premium con tema oscuro
- ✅ Validación de credenciales con Supabase
- ✅ Redirección automática según rol (admin → `/admin`, agent → `/dashboard`)
- ✅ Mensajes de error amigables
- ✅ Link de "olvidé mi contraseña"
- ✅ Integración con Sonner para notificaciones

### 2. **Middleware de Protección** (`/middleware.ts`)
- ✅ Protege rutas `/admin` y `/dashboard`
- ✅ Verifica autenticación del usuario
- ✅ Verifica rol de admin para rutas `/admin`
- ✅ Refresca sesión automáticamente
- ✅ Redirige a `/login` si no está autenticado

### 3. **Botón de Logout** (`LogoutButton`)
- ✅ Componente reutilizable
- ✅ Cierra sesión con Supabase
- ✅ Redirige a `/login`
- ✅ Notificación de confirmación

### 4. **Layouts Actualizados**
- ✅ Admin layout con autenticación habilitada
- ✅ Muestra nombre y email del usuario
- ✅ Botón de logout integrado

---

## 🚀 Configuración Inicial

### Paso 1: Aplicar Migraciones

Ejecuta en Supabase SQL Editor:

```sql
-- 1. Aplicar todas las migraciones
-- Ejecuta el contenido de: supabase/migrations/APPLY_ALL_MIGRATIONS.sql
```

### Paso 2: Crear Usuario Admin

**Opción A: Desde Supabase Dashboard (Recomendado)**

1. Ve a: **Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Completa:
   ```
   Email: admin@garzacasas.com
   Password: (tu contraseña segura)
   Auto Confirm User: ✅ ACTIVADO
   ```
4. Click **"Create user"**
5. Copia el **UUID** del usuario
6. En SQL Editor, ejecuta:
   ```sql
   UPDATE public.profiles
   SET 
       role = 'admin',
       is_unlimited = true,
       full_name = 'Super Agente'
   WHERE id = 'PEGA_EL_UUID_AQUI';
   ```

**Opción B: Usando SQL Automático**

Ejecuta el contenido de: `supabase/migrations/CREATE_ADMIN_USER.sql`

---

## 🔑 Credenciales de Acceso

### Usuario Admin (Super Agente)

```
📧 Email: admin@garzacasas.com
🔑 Password: (la que configuraste)
🔗 URL: http://localhost:3000/login
```

**⚠️ IMPORTANTE:**
- Cambia la contraseña después del primer login
- Guarda las credenciales en un lugar seguro
- No compartas las credenciales

---

## 🛣️ Flujo de Autenticación

### 1. **Usuario No Autenticado**
```
Intenta acceder a /admin o /dashboard
         ↓
Middleware detecta que no hay sesión
         ↓
Redirige a /login
```

### 2. **Login Exitoso**
```
Usuario ingresa credenciales en /login
         ↓
Supabase Auth valida email/password
         ↓
Sistema consulta rol en tabla profiles
         ↓
Redirige según rol:
  - Admin → /admin
  - Agent → /dashboard
```

### 3. **Protección de Rutas Admin**
```
Usuario autenticado intenta acceder a /admin
         ↓
Middleware verifica rol en profiles
         ↓
Si role !== 'admin':
  - Redirige a /
Si role === 'admin':
  - Permite acceso
```

### 4. **Logout**
```
Usuario click en "Cerrar Sesión"
         ↓
Supabase Auth cierra sesión
         ↓
Redirige a /login
         ↓
Muestra notificación de éxito
```

---

## 🧪 Pruebas del Sistema

### Test 1: Login con Credenciales Correctas
```
1. Ve a http://localhost:3000/login
2. Ingresa email y password del admin
3. Click "Iniciar Sesión"
4. ✅ Debería redirigir a /admin
5. ✅ Debería mostrar nombre del usuario en sidebar
```

### Test 2: Login con Credenciales Incorrectas
```
1. Ve a http://localhost:3000/login
2. Ingresa email o password incorrecto
3. Click "Iniciar Sesión"
4. ✅ Debería mostrar error "Email o contraseña incorrectos"
```

### Test 3: Protección de Rutas
```
1. Abre navegador en modo incógnito
2. Ve a http://localhost:3000/admin
3. ✅ Debería redirigir automáticamente a /login
```

### Test 4: Logout
```
1. Inicia sesión como admin
2. Click en "Cerrar Sesión" en el sidebar
3. ✅ Debería redirigir a /login
4. ✅ Debería mostrar notificación de éxito
5. Intenta volver a /admin
6. ✅ Debería redirigir a /login nuevamente
```

---

## 🔧 Gestión de Usuarios

### Crear Nuevo Usuario Admin

```sql
-- 1. Crear usuario en Authentication → Users (Supabase Dashboard)
-- 2. Actualizar su rol:

UPDATE public.profiles
SET 
    role = 'admin',
    is_unlimited = true,
    full_name = 'Nombre del Admin'
WHERE email = 'nuevo@admin.com';
```

### Crear Nuevo Usuario Agente

```sql
-- 1. Crear usuario en Authentication → Users (Supabase Dashboard)
-- 2. Actualizar su perfil:

UPDATE public.profiles
SET 
    role = 'agent',
    is_unlimited = false,
    full_name = 'Nombre del Agente',
    subscription_plan = 'basico'
WHERE email = 'agente@example.com';
```

### Cambiar Contraseña de Usuario

**Desde Supabase Dashboard:**
1. Ve a **Authentication → Users**
2. Busca el usuario
3. Click en **"..."** → **"Reset password"**
4. Ingresa nueva contraseña

**Desde SQL:**
```sql
-- Nota: Requiere permisos especiales
UPDATE auth.users
SET encrypted_password = crypt('nueva_contraseña', gen_salt('bf'))
WHERE email = 'usuario@example.com';
```

---

## 🛡️ Seguridad

### Políticas RLS Activas

**Tabla `profiles`:**
- ✅ Usuarios solo ven su propio perfil
- ✅ Admins ven todos los perfiles
- ✅ Usuarios no pueden cambiar su propio rol

**Rutas Protegidas:**
- ✅ `/admin/*` - Solo admins
- ✅ `/dashboard/*` - Solo usuarios autenticados
- ✅ `/login` - Público

### Mejores Prácticas

1. **Contraseñas Seguras:**
   - Mínimo 8 caracteres
   - Incluir mayúsculas, minúsculas, números y símbolos

2. **Gestión de Sesiones:**
   - Las sesiones se refrescan automáticamente
   - Timeout configurado en Supabase (default: 1 hora)

3. **Auditoría:**
   - Supabase registra todos los logins en `auth.audit_log_entries`
   - Revisar periódicamente para detectar accesos sospechosos

---

## 🐛 Solución de Problemas

### Error: "Invalid login credentials"
**Causa:** Email o contraseña incorrectos
**Solución:** Verifica las credenciales o resetea la contraseña

### Error: "Email not confirmed"
**Causa:** El usuario no confirmó su email
**Solución:** En Supabase Dashboard → Users → Confirmar email manualmente

### Error: Redirige a `/` en lugar de `/admin`
**Causa:** El usuario no tiene `role = 'admin'` en `profiles`
**Solución:** 
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'usuario@example.com';
```

### Error: "No se pudo obtener el perfil del usuario"
**Causa:** No existe registro en `profiles` para ese usuario
**Solución:** Crear el perfil manualmente:
```sql
INSERT INTO profiles (id, email, role, full_name)
VALUES ('user_uuid', 'email@example.com', 'admin', 'Nombre');
```

---

## 📞 Próximos Pasos

1. ✅ **Aplicar migraciones** en Supabase
2. ✅ **Crear usuario admin** inicial
3. ✅ **Probar login** con las credenciales
4. ✅ **Verificar protección** de rutas
5. ⏭️ **Configurar recuperación** de contraseña (próxima feature)
6. ⏭️ **Implementar 2FA** (opcional, para mayor seguridad)

---

**Última actualización:** 9 de febrero de 2026  
**Versión:** 1.0.0
