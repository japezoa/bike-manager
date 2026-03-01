# 🚴 Bike Manager - Sistema de Gestión de Taller de Bicicletas

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green?style=flat-square&logo=supabase)

**Bike Manager** es una aplicación web moderna diseñada específicamente para talleres de bicicletas, que permite gestionar inventario de bicicletas, clientes, órdenes de trabajo, y mantenciones de forma profesional y eficiente.

## 🎯 Características Principales

### Para el Taller (Admin/Mecánicos)
- ✅ **Gestión de Clientes**: Registro completo con RUT, contacto y rol
- ✅ **Inventario de Bicicletas**: Registro detallado con componentes y especificaciones
- ✅ **Órdenes de Trabajo**: Sistema completo de OT con items, precios y estados
- ✅ **Control de Estados**: Seguimiento desde recepción hasta entrega
- ✅ **Historial de Mantenciones**: Registro completo con costos y kilómetros
- ✅ **Fotos**: Captura de estado al recibir y trabajo realizado
- ✅ **Asignación de Mecánicos**: Delega trabajos específicos
- ✅ **Cálculo Automático**: Subtotal, IVA (19%) y total
- ✅ **Filtrado por Propietario**: Ve todas las bicis de un cliente específico

### Para los Clientes
- 🔐 **Login con Google**: Acceso seguro y simple
- 📱 **Dashboard Personal**: Ve solo tus bicicletas
- 🔔 **Notificaciones**: Te avisamos cuando tu bici está lista
- 📊 **Historial Completo**: Todas tus mantenciones pasadas
- 💰 **Transparencia**: Ve detalles y precios de cada trabajo
- 📷 **Evidencia Visual**: Fotos del trabajo realizado

### Sistema Anti-Robo
- 🔒 **Número de Serie**: Registro del cuadro
- 📸 **Fotos de Identificación**: Múltiples ángulos y detalles únicos
- 🧾 **Prueba de Compra**: Boleta, código de barras y evidencias
- 👤 **Datos del Propietario**: RUT, contacto verificado

## 🏗️ Arquitectura

```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS
Backend:   Supabase (PostgreSQL + Auth + Storage + RLS)
Deploy:    Vercel
Auth:      Google OAuth via Supabase Auth
```

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta de Google Cloud (para OAuth)

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/bike-manager.git
cd bike-manager
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que termine de inicializarse

#### 3.2 Ejecutar Schema SQL

1. Ve a **SQL Editor** en Supabase
2. Copia el contenido de `supabase/migration-v2-to-v3.sql`
3. Pégalo y ejecuta (Run)
4. Verifica que diga: ✅ Migración completada

#### 3.3 Configurar Google OAuth

1. Ve a **Authentication** → **Providers** en Supabase
2. Habilita **Google**
3. Configura en [Google Cloud Console](https://console.cloud.google.com):
   - Crea proyecto
   - Habilita Google+ API
   - Crea credenciales OAuth 2.0
   - Authorized redirect URI: `https://[tu-proyecto].supabase.co/auth/v1/callback`
4. Copia Client ID y Secret a Supabase

### 4. Variables de Entorno

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Ejecutar Localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 6. Crear Usuario Admin

1. Accede a la app
2. Haz login con Google por primera vez
3. Ve a Supabase → **SQL Editor** y ejecuta:

```sql
-- Reemplaza 'tu-email@gmail.com' con tu email de Google
UPDATE owners 
SET role = 'admin' 
WHERE email = 'tu-email@gmail.com';
```

4. Recarga la aplicación

## 🎮 Guía de Uso

### 👨‍💼 Para Administradores

#### Dashboard Principal
- **Estadísticas**: OT pendientes, en progreso, completadas
- **Acciones rápidas**: Nueva bici, nueva OT, gestionar propietarios

#### Gestionar Clientes
```
Menú → PROPIETARIOS → NUEVO PROPIETARIO
```
- Registra RUT, nombre, edad, email, teléfono
- Asigna rol: Cliente | Mecánico | Admin
- Un cliente puede tener múltiples bicicletas
- **Ver Bicis**: Click en "Ver bicis" para filtrar solo las bicis de ese propietario

#### Ver Detalle de Bicicleta
```
Lista → Ver (ícono de ojo)
```
- **Header Persistente**: Nombre, modelo y botones siempre visibles al hacer scroll
- **Botón Editar**: Click para abrir formulario de edición
- **Botón Volver**: Regresa a la lista
- **Componentes del Marco**: Manillar, tija, sillín, pedales
- **Historial Completo**: Todas las mantenciones realizadas

#### Registrar Bicicleta
```
Menú → NUEVA BICI
```
1. **Foto**: Sube imagen de la bici
2. **Propietario**: Selecciona o crea cliente
3. **Información Básica**: Nombre, modelo
4. **Componentes**: Cuadro, horquilla, transmisión, frenos, ruedas
5. **Anti-Robo**: 
   - Número de serie del cuadro
   - Fotos de identificación
   - Boleta de compra
6. **Guardar**

#### Crear Orden de Trabajo
```
Dashboard → Nueva OT
```
1. **Seleccionar Bicicleta**: Del cliente
2. **Fechas**:
   - Fecha de ingreso
   - Fecha estimada de entrega
3. **Descripción**: Qué se va a hacer (visible para cliente)
4. **Items de Trabajo**:
   - Descripción: "Cambio de cadena Shimano 105"
   - Cantidad: 1
   - Precio unitario: $18.000
   - Categoría: Repuesto
   - (Agregar más items con +)
5. **Cálculo Automático**:
   - Subtotal: suma de items
   - IVA: 19% automático
   - Total: subtotal + IVA
6. **Notas Internas**: Solo visible para el taller
7. **Asignar Mecánico**: (opcional)
8. **Prioridad**: Normal | Urgente
9. **Fotos de Recepción**: Estado al recibir
10. **Guardar**

#### Gestionar Estados de OT

```
Pendiente → En Progreso → Completada → Entregada
              ↓
         Esperando Repuestos
```

**Cambiar Estado**:
1. Abre la OT
2. Cambiar estado a:
   - **En Progreso**: Mecánico empieza a trabajar
   - **Esperando Repuestos**: Falta algo para continuar
   - **Completada**: ⚠️ Cliente recibe notificación automática
   - **Entregada**: Cliente retiró la bici

### 🔧 Para Mecánicos

#### Dashboard
- Ver OT asignadas a ti
- Ver todas las OT del taller
- Cambiar estados de OT

#### Trabajar en una OT
1. Dashboard → OT asignada
2. Cambiar estado a "En Progreso"
3. Agregar fotos del trabajo realizado
4. Agregar notas internas si es necesario
5. Al terminar → Cambiar a "Completada"

**Permisos**:
- ✅ Ver todas las bicicletas
- ✅ Ver todas las OT
- ✅ Editar OT
- ✅ Cambiar estados
- ❌ No puede eliminar
- ❌ No puede gestionar usuarios

### 👤 Para Clientes

#### Acceso
1. Ve a la app
2. Click en **Login con Google**
3. Autoriza con tu cuenta de Google
4. ¡Listo!

#### Dashboard Cliente
```
Mis Bicicletas
├─ 🚴 Bicicleta 1 (con estado)
├─ 🚴 Bicicleta 2 (con estado)
└─ 🚴 Bicicleta 3 (con estado)

Órdenes Activas
└─ OT-2024-0042 - En Progreso
    ├─ Ingreso: 26 Feb 2024
    ├─ Entrega estimada: 5 Mar 2024
    └─ Estado: En Progreso 🟡

Historial
└─ OT anteriores completadas
```

#### Ver Detalle de OT
- **Descripción**: Qué se está haciendo
- **Items**:
  - Cambio de cadena: $18.000
  - Mano de obra mantención: $25.000
- **Total**: $51.170 (IVA incluido)
- **Fotos**: Del trabajo realizado
- **Estado actual**: Con fecha estimada

**Permisos**:
- ✅ Ver solo SUS bicicletas
- ✅ Ver solo SUS órdenes de trabajo
- ✅ Ver historial completo
- ❌ No puede editar nada
- ❌ No puede ver bicis de otros

#### Notificaciones
- 🔔 **Email**: Cuando tu bici está lista
- 🔔 **En app**: Badge con notificaciones nuevas
- 🔔 **Estados**: Te avisamos de cambios importantes

## 📊 Estructura de Datos

### Roles
```typescript
'admin'     → Control total del taller
'mechanic'  → Ve todo, edita OT, no elimina
'customer'  → Solo ve sus bicis y OT
```

### Estados de Bicicleta
```typescript
'with_owner'        → Con el cliente
'in_workshop'       → En el taller
'ready_for_pickup'  → Lista para retirar
```

### Estados de Orden de Trabajo
```typescript
'pending'         → Recién ingresada
'in_progress'     → Mecánico trabajando
'waiting_parts'   → Esperando repuestos
'completed'       → Lista (notifica al cliente)
'delivered'       → Cliente retiró
'cancelled'       → Cancelada
```

### Categorías de Items
```typescript
'labor'       → Mano de obra
'part'        → Repuesto/pieza
'adjustment'  → Ajuste/regulación
```

## 🔐 Seguridad

### Row Level Security (RLS)

**Implementado en todas las tablas**:

```sql
-- Admin
✅ Ve todo
✅ Edita todo  
✅ Elimina todo

-- Mechanic
✅ Ve todas las bicis y OT
✅ Edita OT
❌ No elimina

-- Customer
✅ Ve solo SUS bicis
✅ Ve solo SUS OT
❌ Solo lectura
```

### Autenticación
- OAuth 2.0 con Google
- Sessions manejadas por Supabase
- Tokens JWT seguros
- Auto-refresh de sesión

## 🚢 Deploy en Producción

### Deploy en Vercel

1. **Push a GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Conectar con Vercel**:
   - Ve a [Vercel](https://vercel.com)
   - Import repository
   - Framework: Next.js (auto-detectado)

3. **Variables de Entorno** en Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=https://tu-app.vercel.app
```

4. **Deploy**: Click en "Deploy"

5. **Actualizar OAuth en Google Cloud**:
   - Agregar URL de producción: `https://tu-app.vercel.app`
   - Agregar redirect: `https://[tu-proyecto].supabase.co/auth/v1/callback`

## 📁 Estructura del Proyecto

```
bike-manager/
├── app/
│   ├── page.tsx                    # Dashboard principal
│   ├── bike/[id]/page.tsx          # Detalle de bicicleta
│   ├── owners/page.tsx             # Gestión de propietarios
│   └── work-orders/                # (Próximamente)
├── components/
│   ├── BikeForm.tsx                # Formulario de bicis
│   ├── BikeList.tsx                # Lista con drag & drop
│   ├── OwnerForm.tsx               # Formulario de propietarios
│   └── OwnerList.tsx               # Lista de propietarios
├── lib/
│   ├── supabase.ts                 # Cliente de Supabase
│   ├── authService.ts              # Autenticación
│   ├── bicycleService.ts           # CRUD bicis
│   ├── ownerService.ts             # CRUD propietarios
│   └── workOrderService.ts         # CRUD órdenes de trabajo
├── types/
│   └── bicycle.ts                  # TypeScript types
├── supabase/
│   ├── schema-workshop-v3.sql      # Schema completo
│   └── migration-v2-to-v3.sql      # Migración
└── public/
    └── assets/
```

## 🎨 Personalización

### Colores del Tema

Archivo: `app/globals.css`

```css
/* Bicicletas */
--color-bike-primary: cyan-500;
--color-bike-secondary: blue-600;

/* Propietarios */
--color-owner-primary: orange-500;
--color-owner-secondary: red-600;

/* Órdenes de Trabajo */
--color-ot-primary: purple-500;
--color-ot-secondary: pink-600;
```

### Logo del Taller

1. Reemplaza el logo en `public/logo.png`
2. Actualiza en `app/layout.tsx`

## 🐛 Troubleshooting

### Error: "Failed to load resource: 404"
→ No ejecutaste la migración SQL
→ Ejecuta `supabase/migration-v2-to-v3.sql`

### Error: "Column user_id does not exist"
→ Ejecutaste el schema wrong
→ Usa `migration-v2-to-v3.sql` no `schema-workshop-v3.sql`

### No puedo ver las bicicletas de otros clientes
→ Correcto, es el comportamiento esperado
→ Solo admin y mechanic ven todas

### El cliente no recibe notificaciones
→ Verifica que el email en Supabase Auth coincida
→ Revisa la configuración de email en Supabase

### Google OAuth no funciona
→ Verifica redirect URIs en Google Cloud
→ Verifica que el Client ID y Secret estén correctos

## 📚 Documentación Adicional

- [WORKSHOP-IMPLEMENTATION-PLAN.md](./WORKSHOP-IMPLEMENTATION-PLAN.md) - Plan completo de implementación
- [OWNER-BIKE-ASSOCIATION.md](./OWNER-BIKE-ASSOCIATION.md) - Cómo asociar bicis con propietarios
- [FIX-MIGRATION-ERROR.md](./FIX-MIGRATION-ERROR.md) - Soluciones a errores comunes
- [QUICK-START-v2.0.md](./QUICK-START-v2.0.md) - Guía de inicio rápido

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Jaime Pezoa** - *Desarrollo Inicial* - [@japezoa](https://github.com/japezoa)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting y deployment
- [Next.js](https://nextjs.org) - React Framework
- [Tailwind CSS](https://tailwindcss.com) - Styling

## 📞 Soporte

¿Necesitas ayuda? Abre un [issue](https://github.com/japezoa/bike-manager/issues) en GitHub.

---

**Hecho con ❤️ para talleres de bicicletas en Chile** 🇨🇱 🚴
