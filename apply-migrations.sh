#!/bin/bash
# Script para aplicar migraciones de Supabase

echo "🚀 Aplicando migraciones de Supabase..."

# Verifica que Supabase CLI esté instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI no está instalado"
    echo "Instálalo con: npm install -g supabase"
    exit 1
fi

# Aplica las migraciones
echo "📦 Aplicando migración 1: Dual Dashboard Roles..."
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.wcsscjydecukdgzihcsm.supabase.co:5432/postgres" --file supabase/migrations/20240209_dual_dashboard_roles.sql

echo "📦 Aplicando migración 2: CMS Site Settings..."
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.wcsscjydecukdgzihcsm.supabase.co:5432/postgres" --file supabase/migrations/20240209_cms_site_settings.sql

echo "📦 Aplicando migración 3: Production RLS..."
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.wcsscjydecukdgzihcsm.supabase.co:5432/postgres" --file supabase/migrations/20240209_production_rls_final.sql

echo "✅ Migraciones aplicadas exitosamente"
