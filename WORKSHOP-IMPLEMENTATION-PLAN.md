# 🏪 Implementación Sistema de Taller v3.0

## 📋 Resumen de Cambios

### ✅ Ya Implementado

1. **Tipos TypeScript Completos** (`types/bicycle.ts`)
   - WorkOrder con todos los campos
   - WorkItem (items de trabajo)
   - Owner con roles
   - Estados de bicis y OT
   - Notificaciones

2. **Schema de Base de Datos** (`supabase/schema-workshop-v3.sql`)
   - Tabla `work_orders` completa
   - Tabla `notifications`
   - Campo `role` en `owners`
   - RLS (Row Level Security) por rol
   - Funciones auxiliares
   - Triggers automáticos

3. **Servicios**
   - `workOrderService.ts` - CRUD de órdenes de trabajo
   - `authService.ts` - Autenticación con Google

### 🔨 Por Implementar (Siguiente Fase)

#### Componentes de UI:
1. `components/AuthGuard.tsx` - Protección de rutas
2. `components/LoginPage.tsx` - Página de login con Google
3. `components/WorkOrderForm.tsx` - Formulario de OT
4. `components/WorkOrderList.tsx` - Lista de OT
5. `components/WorkOrderDetail.tsx` - Detalle de OT
6. `components/DashboardAdmin.tsx` - Dashboard del taller
7. `components/DashboardCustomer.tsx` - Dashboard del cliente
8. `components/StatusBadge.tsx` - Badge de estados

#### Páginas:
1. `app/dashboard/page.tsx` - Dashboard principal (redirige según rol)
2. `app/work-orders/page.tsx` - Gestión de OT
3. `app/work-orders/[id]/page.tsx` - Detalle de OT
4. `app/auth/callback/page.tsx` - Callback de Google OAuth
5. `app/login/page.tsx` - Página de login

## 🚀 Plan de Implementación en Fases

### FASE 1: Autenticación (Crítico)

#### 1.1 Configurar Google OAuth en Supabase

```
1. Ve a Supabase Dashboard
2. Authentication → Providers
3. Habilita Google
4. Copia Client ID y Client Secret desde Google Cloud Console
5. Agrega URL de callback: https://tu-proyecto.supabase.co/auth/v1/callback
```

#### 1.2 Variables de Entorno

Agregar en Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
NEXT_PUBLIC_SITE_URL=https://tu-app.vercel.app
```

#### 1.3 Crear Componentes de Auth

**AuthGuard.tsx:**
```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';

export default function AuthGuard({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: 'admin' | 'mechanic' | 'customer';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    if (requiredRole) {
      const role = await authService.getUserRole();
      if (role !== requiredRole && role !== 'admin') {
        router.push('/unauthorized');
        return;
      }
    }

    setAuthorized(true);
    setLoading(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (!authorized) return null;
  
  return <>{children}</>;
}
```

### FASE 2: Dashboards por Rol

#### 2.1 Dashboard Admin/Mecánico

Muestra:
- **Estadísticas**: OT pendientes, en progreso, completadas
- **OT del día**: Lista de órdenes para hoy
- **Bicis en taller**: Count actual
- **Acciones rápidas**: Nueva OT, ver todas las OT

#### 2.2 Dashboard Cliente

Muestra:
- **Mis Bicicletas**: Cards con foto y estado
- **OT Activas**: Si tiene bicis en taller
- **Historial**: OT completadas
- **Notificaciones**: Cuando esté lista su bici

### FASE 3: Sistema de Órdenes de Trabajo

#### 3.1 Crear OT (Admin/Mechanic)

Formulario con:
- Seleccionar bicicleta (del propietario)
- Fecha de ingreso y entrega estimada
- Descripción para el cliente
- Items de trabajo (dinámico):
  - Descripción
  - Cantidad
  - Precio unitario
  - Categoría (mano de obra, repuesto, ajuste)
- Cálculo automático de subtotal, IVA, total
- Notas internas (no visibles para cliente)
- Asignar mecánico
- Prioridad
- Fotos de recepción

#### 3.2 Ver OT (Todos)

Admin/Mechanic ve:
- Todos los campos
- Puede editar
- Puede cambiar estado
- Ve notas internas

Cliente ve:
- Solo sus OT
- Solo lectura
- No ve notas internas
- Ve items y precios
- Ve fotos del trabajo

### FASE 4: Flujo de Estados

```
PENDING (Pendiente)
    ↓ [Mecánico acepta]
IN_PROGRESS (En progreso)
    ↓ [Esperando repuesto] o [Trabajo completado]
WAITING_PARTS (Esperando repuestos) → IN_PROGRESS
    ↓
COMPLETED (Completada) [Notificación al cliente]
    ↓ [Cliente retira]
DELIVERED (Entregada)
```

### FASE 5: Notificaciones

#### 5.1 Por Email (Usando Supabase Edge Functions)

```sql
-- Trigger que envía email cuando OT cambia a 'completed'
CREATE OR REPLACE FUNCTION notify_order_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Insertar en tabla de notificaciones
    -- Supabase puede enviar email automáticamente
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### FASE 6: Mejoras de Bicycle

Agregar a BikeForm:
- Campo `currentStatus`
- Campo `physicalLocation`
- Campo `receptionNotes`

En BikeList mostrar badge de estado.

## 📁 Estructura de Archivos Final

```
bike-manager/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                    [Dashboard según rol]
│   ├── work-orders/
│   │   ├── page.tsx                    [Lista de OT]
│   │   ├── new/
│   │   │   └── page.tsx                [Nueva OT]
│   │   └── [id]/
│   │       └── page.tsx                [Detalle OT]
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx                [Callback OAuth]
│   ├── login/
│   │   └── page.tsx                    [Login con Google]
│   └── unauthorized/
│       └── page.tsx                    [Sin permisos]
├── components/
│   ├── AuthGuard.tsx                   [Protección rutas]
│   ├── LoginPage.tsx                   [UI de login]
│   ├── DashboardAdmin.tsx              [Dashboard taller]
│   ├── DashboardCustomer.tsx           [Dashboard cliente]
│   ├── WorkOrderForm.tsx               [Form OT]
│   ├── WorkOrderList.tsx               [Lista OT]
│   ├── WorkOrderCard.tsx               [Card de OT]
│   ├── WorkOrderDetail.tsx             [Detalle OT]
│   ├── StatusBadge.tsx                 [Badge estados]
│   ├── RoleGuard.tsx                   [Guard por rol]
│   └── NotificationBell.tsx            [Campana notif]
├── lib/
│   ├── authService.ts                  ✅ Ya creado
│   ├── workOrderService.ts             ✅ Ya creado
│   └── notificationService.ts          [Por crear]
├── types/
│   └── bicycle.ts                      ✅ Ya actualizado
└── supabase/
    └── schema-workshop-v3.sql          ✅ Ya creado
```

## 🔐 Configuración de Seguridad RLS

El schema ya incluye RLS completo:

**Admin:**
- Ve todo
- Edita todo
- Crea todo

**Mechanic:**
- Ve todas las bicis y OT
- Edita OT
- No puede eliminar

**Customer:**
- Solo ve SUS bicis
- Solo ve SUS órdenes de trabajo
- Solo lectura

## 📊 Endpoints de la API (via Supabase)

```
GET  /work_orders              → Lista (filtrada por RLS)
GET  /work_orders/:id          → Detalle
POST /work_orders              → Crear (admin/mechanic)
PUT  /work_orders/:id          → Actualizar (admin/mechanic)
DEL  /work_orders/:id          → Eliminar (admin)

GET  /bicycles                 → Lista (filtrada por RLS)
GET  /notifications            → Mis notificaciones
PUT  /notifications/:id/read   → Marcar como leída
```

## 🎯 Próximos Pasos

1. **Ejecutar schema-workshop-v3.sql** en Supabase
2. **Configurar Google OAuth** en Supabase
3. **Crear página de login** con botón de Google
4. **Crear AuthGuard** para proteger rutas
5. **Crear dashboards** por rol
6. **Crear formulario de OT**
7. **Implementar cambio de estados**
8. **Agregar notificaciones**

## 🆘 ¿Continuamos?

¿Quieres que implemente alguna fase específica primero? Por ejemplo:
- **Opción A**: Login y auth completo (Fase 1)
- **Opción B**: Formulario de OT (Fase 3)
- **Opción C**: Dashboards (Fase 2)

Dime cuál prefieres y lo implemento completo.
