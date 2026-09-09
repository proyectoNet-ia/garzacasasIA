-- ============================================================================
-- MIGRACIÓN DE SEGURIDAD: Storage RLS Aislado por Agente para 'properties'
-- ============================================================================

-- 1. Asegurar que el bucket 'properties' existe y es público
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'properties') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('properties', 'properties', true);
    ELSE
        UPDATE storage.buckets SET public = true WHERE id = 'properties';
    END IF;
END $$;

-- 2. Eliminar políticas anteriores para evitar conflictos
DROP POLICY IF EXISTS "Public View Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Properties Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Upload Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Update Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Delete Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Agents Manage Own Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Agents Update Own Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Agents Delete Own Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Agents Upload Own Property Images" ON storage.objects;

-- 3. SELECT: Lectura pública para que cualquier usuario vea las fotos en el catálogo
CREATE POLICY "Public Read Properties Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- 4. INSERT: El agente solo puede subir imágenes dentro de su propia carpeta (auth.uid()) o admin
CREATE POLICY "Agents Upload Own Property Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'properties' 
    AND (
        auth.role() = 'authenticated' AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    )
);

-- 5. UPDATE: Solo el agente propietario de la carpeta o un admin puede actualizar
CREATE POLICY "Agents Update Own Property Images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'properties' 
    AND (
        auth.role() = 'authenticated' AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    )
);

-- 6. DELETE: Solo el agente propietario de la carpeta o un admin puede eliminar
CREATE POLICY "Agents Delete Own Property Images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'properties' 
    AND (
        auth.role() = 'authenticated' AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    )
);

SELECT '✅ Políticas de Storage RLS aisladas por agente aplicadas con éxito' as status;
