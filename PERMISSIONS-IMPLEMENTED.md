# 🔒 Sistema de Permisos - Cambios Implementados

## ✅ Lo que se Implementó

### 1. Login Obligatorio
- ✅ Solo `/login` y `/auth/callback` son públicas
- ✅ Todas las demás páginas requieren autenticación
- ✅ Redirección automática a /login si no está autenticado

### 2. Componentes de Permisos Creados

**RoleGuard** (`components/RoleGuard.tsx`)
- Componente para mostrar/ocultar UI según rol
- Hook `usePermissions()` para lógica de permisos

**Permisos Definidos:**
```typescript
{
  isAdmin: boolean;
  isMechanic: boolean;
  isCustomer: boolean;
  isStaff: boolean; // admin o mechanic
  
  // Permisos específicos
  canEditBikes: boolean;        // admin, mechanic
  canDeleteBikes: boolean;      // solo admin
  canEditOwners: boolean;       // solo admin
  canDeleteOwners: boolean;     // solo admin
  canViewAllBikes: boolean;     // admin, mechanic
  canViewAllOwners: boolean;    // admin, mechanic
  canEditMaintenances: boolean; // admin, mechanic
  canCreateBikes: boolean;      // admin, mechanic
}
```

### 3. Página Principal Actualizada

**Botones Condicionales:**
- ✅ "PROPIETARIOS": Solo visible para admin y mechanic
- ✅ "NUEVA BICI": Solo visible para admin y mechanic
- ✅ Clientes solo ven "LISTA"

**Lista de Bicicletas:**
- ✅ Botón "Ver": Todos los usuarios
- ✅ Botón "Editar": Solo admin y mechanic
- ✅ Botón "Eliminar": Solo admin

### 4. Página de Detalle Actualizada

- ✅ Botón "Editar": Solo visible para admin y mechanic
- ✅ Clientes solo pueden ver el detalle, no editar

### 5. RLS (Row Level Security) Ya Funcionando

El esquema de base de datos ya tiene RLS implementado que:
- ✅ Clientes solo ven SUS bicicletas
- ✅ Clientes solo ven SUS órdenes de trabajo
- ✅ Admin y mechanic ven TODO
- ✅ Automático vía Supabase

### 6. Selector de Propietario

- ✅ Opción "Sin propietario asignado" existe
- ✅ onChange maneja correctamente el valor vacío

---

## ⚠️ PENDIENTE: Tablas Maestras para Componentes

**Requisito**: Los campos de componentes deben guardarse en tablas maestras y listarse al editar.

### Campos que Necesitan Tablas Maestras

**Transmisión:**
- Shifters
- Chains
- Cranksets
- Bottom Brackets
- Rear Derailleurs
- Front Derailleurs
- Cassettes

**Frenos:**
- Brake Types
- Rotor Sizes
- Brake Models

**Ruedas:**
- Front Rims
- Front Hubs
- Rear Rims
- Rear Hubs
- Tires
- Wheel Sizes

**Componentes del Marco:**
- Handlebars
- Stems
- Seatposts
- Saddles
- Pedals

**Cuadro:**
- Frames
- Forks

### Implementación Requerida

#### 1. Schema SQL para Tablas Maestras

```sql
-- Crear tablas maestras
CREATE TABLE IF NOT EXISTS public.component_shifters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.component_chains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ... similar para cada tipo de componente
```

#### 2. Servicios para Gestionar Componentes

```typescript
// lib/componentService.ts
export const componentService = {
  // Genérico para cualquier tipo
  async getAll(type: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(`component_${type}`)
      .select('name')
      .order('name');
    
    return data ? data.map(d => d.name) : [];
  },
  
  async add(type: string, name: string): Promise<void> {
    // Agregar nuevo componente a la tabla maestra
  }
};
```

#### 3. Componente Autocomplete/Select

```typescript
// components/ComponentSelect.tsx
<ComponentSelect
  componentType="shifters"
  value={formData.transmission.shifter}
  onChange={(value) => handleInputChange('transmission.shifter', value)}
  allowNew={true}  // Permite agregar nuevos valores
/>
```

#### 4. Actualizar BikeForm

Reemplazar todos los `<input>` de componentes con `<ComponentSelect>`.

---

## 📋 Checklist de Tareas Pendientes

### Alta Prioridad
- [ ] Crear schema SQL para tablas maestras de componentes
- [ ] Crear `componentService.ts`
- [ ] Crear componente `ComponentSelect.tsx`
- [ ] Actualizar `BikeForm.tsx` con los nuevos selects
- [ ] Poblar tablas maestras con datos iniciales

### Media Prioridad
- [ ] Página de Owners: Agregar permisos (solo admin puede crear/editar/eliminar)
- [ ] Filtrar propietarios en selector según permisos (clientes no ven el selector)

### Baja Prioridad
- [ ] Página de administración de componentes (para admin)
- [ ] Migración de datos existentes a tablas maestras

---

## 🧪 Probar Permisos Actuales

### Como Admin
```
1. Login con cuenta admin
2. Debe ver TODO
3. Puede crear bici
4. Puede editar bici
5. Puede eliminar bici
6. Puede acceder a /owners
7. Puede crear/editar/eliminar owners
```

### Como Mechanic
```
1. Login con cuenta mechanic
2. Ve todas las bicis
3. Puede crear bici
4. Puede editar bici
5. NO puede eliminar bici
6. Puede acceder a /owners
7. NO puede editar owners (aún no implementado)
```

### Como Customer
```
1. Login con cuenta customer
2. Solo ve SUS bicis (RLS)
3. NO ve botón "NUEVA BICI"
4. NO ve botón "PROPIETARIOS"
5. NO ve botones editar/eliminar
6. Solo puede VER detalle
7. No puede modificar nada
```

---

## 🚀 Siguiente Paso

**Implementar Tablas Maestras de Componentes**

¿Quieres que implemente ahora?
1. El schema SQL completo
2. El componentService
3. El ComponentSelect
4. Actualizar BikeForm

O prefieres revisar lo que ya está funcionando primero?

---

**Cambios aplicados y listos para testing** ✅
