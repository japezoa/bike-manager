# 🚀 Actualización v2.0 - Sistema Anti-Robo y Gestión de Propietarios

## 🎯 Resumen de Cambios

### ✅ Bugs Corregidos
1. **Edición desde detalle**: Ahora funciona correctamente el botón "Editar" en la página de detalle
2. **Header responsive**: El menú superior se adapta a móviles y tablets
3. **Ordenamiento de mantenciones**: Siempre se ordenan de más nueva a más antigua
4. **Drag and drop mejorado**: Funciona correctamente en toda la lista

### 🆕 Nuevas Características Principales

#### 1. **Sistema de Propietarios**
- CRUD completo para propietarios
- Identificación por RUT chileno (único)
- Información: Nombre, edad, sexo, email, teléfono
- Un propietario puede tener múltiples bicicletas
- No se puede eliminar un propietario con bicicletas registradas

#### 2. **Registro Anti-Robo**
Cada bicicleta ahora puede tener:

**Identificación Básica:**
- Número de serie del cuadro
- Múltiples fotos de identificación (ángulos específicos, detalles únicos)

**Prueba de Compra:**
- Número de boleta
- Código de barras
- Foto de la boleta
- Método de compra (tienda, online, marketplace usado, privado, otro)
- Información del vendedor (si es usada)
- Múltiples fotos de evidencia

#### 3. **Relación Propietario-Bicicleta**
- Cada bicicleta está asociada a un propietario
- Vista completa del propietario en el detalle de la bicicleta
- Búsqueda de bicicletas por propietario

## 📋 Guía de Actualización

### Opción A: Nueva Instalación (Recomendado si es posible)

1. **Backup de datos existentes** (IMPORTANTE):
```sql
-- En Supabase SQL Editor, exporta tus datos
COPY (SELECT * FROM bicycles) TO '/tmp/bicycles_backup.csv' CSV HEADER;
```

2. **Ejecutar schema nuevo**:
   - Ve a Supabase → SQL Editor
   - Ejecuta `supabase/schema-v2.sql`

3. **Restaurar datos** (opcional - requiere adaptación)

### Opción B: Migrar Base de Datos Existente (Recomendado)

1. **Hacer backup** (MUY IMPORTANTE):
```sql
-- Exportar bicycles
CREATE TABLE bicycles_backup AS SELECT * FROM bicycles;
```

2. **Ejecutar migración**:
   - Ve a Supabase → SQL Editor
   - Ejecuta `supabase/migration-v2.sql` completo
   - Espera a que termine (puede tomar 1-2 minutos)

3. **Verificar migración**:
```sql
-- Verificar tabla owners
SELECT * FROM owners LIMIT 1;

-- Verificar nuevas columnas en bicycles
SELECT owner_id, serial_number FROM bicycles LIMIT 1;

-- Verificar buckets
SELECT * FROM storage.buckets WHERE id IN ('purchase-proofs', 'identification-photos');
```

4. **Actualizar código**:
   - Descarga el nuevo `bike-manager.tar.gz`
   - Reemplaza TODOS los archivos del proyecto
   - O copia los archivos específicos mencionados más abajo

5. **Instalar dependencias**:
```bash
npm install
```

6. **Probar localmente**:
```bash
npm run dev
```

7. **Deploy**:
```bash
git add .
git commit -m "Update: v2.0 - Anti-theft system and owner management"
git push
```

## 📁 Archivos Nuevos/Modificados

### Nuevos Archivos:
- `lib/ownerService.ts` - Servicio CRUD de propietarios
- `lib/dateUtils.ts` - Utilidades de fechas
- `components/OwnerForm.tsx` - Formulario de propietarios (siguiente actualización)
- `components/OwnerList.tsx` - Lista de propietarios (siguiente actualización)
- `app/owners/page.tsx` - Página de gestión de propietarios (siguiente actualización)
- `supabase/schema-v2.sql` - Schema completo nuevo
- `supabase/migration-v2.sql` - Migración desde v1.x

### Archivos Modificados:
- `types/bicycle.ts` - Tipos extendidos con Owner y PurchaseProof
- `app/page.tsx` - Soporte para edición por URL y responsive
- `app/bike/[id]/page.tsx` - Ordenamiento y navegación mejorada
- `components/BikeForm.tsx` - Ordenamiento de mantenciones
- `components/BikeList.tsx` - Drag and drop completo
- `lib/bicycleService.ts` - Soporte para nuevos campos
- `package.json` - Next.js actualizado a 14.2.18

## 🗄️ Estructura de Base de Datos

### Tabla `owners`
```sql
CREATE TABLE owners (
    id UUID PRIMARY KEY,
    rut TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla `bicycles` (nuevos campos)
```sql
ALTER TABLE bicycles ADD COLUMN:
- owner_id UUID (FK a owners)
- serial_number TEXT
- purchase_proof JSONB
- identification_photos JSONB (array de URLs)
```

### Storage Buckets
- `bike-images` - Foto principal de la bicicleta
- `purchase-proofs` - Boletas y documentos de compra
- `identification-photos` - Fotos de identificación

## 🎨 Uso del Sistema Anti-Robo

### Registrar un Propietario

1. Ve a "Propietarios" en el menú
2. Click en "Nuevo Propietario"
3. Completa:
   - RUT (formato: 12.345.678-9)
   - Nombre completo
   - Edad
   - Sexo
   - Email
   - Teléfono
4. Guardar

### Asociar Bicicleta a Propietario

1. Edita una bicicleta
2. En la sección "Propietario", selecciona del dropdown
3. O crea uno nuevo directamente

### Agregar Información Anti-Robo

1. Edita una bicicleta
2. Sección "Identificación":
   - Número de serie del cuadro
   - Sube fotos de identificación:
     * Ángulo completo izquierdo
     * Ángulo completo derecho
     * Detalles únicos (rayones, stickers, marcas)
     * Número de serie visible

3. Sección "Prueba de Compra":
   - Número de boleta
   - Código de barras
   - Foto de la boleta
   - Método de compra
   - Si es usada: datos del vendedor
   - Fotos de evidencia adicionales

## 🔍 Búsqueda en Caso de Robo

### Información Disponible para Denuncia:

Con este sistema, en caso de robo tendrás:
- ✅ Foto de la bicicleta
- ✅ Número de serie del cuadro
- ✅ Datos completos del propietario (RUT, contacto)
- ✅ Prueba de compra (boleta, código de barras)
- ✅ Fotos de identificación con detalles únicos
- ✅ Historial de mantenciones (puede ayudar a identificar)
- ✅ Especificaciones completas de componentes

### Reporte de Robo:
```
Datos para PDI/Carabineros:
- Marca/Modelo: [nombre completo]
- N° Serie: [serial_number]
- Color y características únicas: [ver fotos]
- Propietario: [nombre, RUT, contacto]
- Boleta N°: [receiptNumber]
- Valor: [purchasePrice]
- Fecha compra: [purchaseDate]
```

## 🛡️ Mejores Prácticas

### Fotos de Identificación:
1. **Foto completa lateral izquierda** (con buena luz)
2. **Foto completa lateral derecha**
3. **Foto del número de serie** (close-up legible)
4. **Fotos de detalles únicos**:
   - Rayones o marcas distintivas
   - Stickers personalizados
   - Componentes especiales
   - Cualquier modificación

### Prueba de Compra:
- **Boleta original**: Foto clara y legible
- **Código de barras**: Asegúrate que se vea completo
- **Si es usada**: Guarda capturas de la conversación con el vendedor
- **Marketplace**: Guarda el link de la publicación
- **Privado**: Pide datos del vendedor (RUT, contacto)

### Número de Serie:
- Busca en el tubo del asiento
- También puede estar bajo el eje pedalier
- Limpia bien el área antes de fotografiar
- Usa flash si es necesario para que se vea claro

## 🔧 Troubleshooting

### Error: "Column owner_id does not exist"
- No ejecutaste la migración
- Ejecuta `supabase/migration-v2.sql`

### Error: "Table owners does not exist"
- Ejecuta `supabase/migration-v2.sql` completo

### No puedo eliminar un propietario
- Normal si tiene bicicletas asociadas
- Primero elimina o reasigna las bicicletas
- Luego podrás eliminar el propietario

### Las fotos no se suben
- Verifica que los buckets de storage existan
- Verifica las políticas de storage
- Revisa la consola del navegador para errores

## 📊 Próximas Características (v2.1)

- [ ] Interfaz completa de gestión de propietarios
- [ ] Búsqueda avanzada por propietario
- [ ] Exportar datos para denuncia (PDF)
- [ ] QR code con link al registro público
- [ ] Compartir registro con autoridades
- [ ] Notificaciones de mantención pendiente
- [ ] Registro de seguros
- [ ] Historial de robos recuperados

## 📞 Soporte

Si tienes problemas:
1. Revisa que ejecutaste la migración completa
2. Verifica los logs de Vercel
3. Revisa la consola del navegador (F12)
4. Compara tu schema con `schema-v2.sql`

---

**¡Tu sistema ahora es mucho más robusto para casos de robo! 🚴‍♂️🔒**
