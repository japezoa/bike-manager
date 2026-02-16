# 🚴 Bike Manager - Sistema de Gestión de Bicicletas

Sistema completo de gestión y comparación de bicicletas con integración a Supabase, diseñado con Next.js 14 y React.

![Bike Manager](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-2-green)

## ✨ Características

- ✅ **CRUD completo** de bicicletas con validación de datos
- 📸 **Upload de fotos** con almacenamiento en Supabase Storage
- 🔄 **Comparación visual** de componentes entre múltiples bicicletas
- 📊 **Historial de mantenciones** con registro de fecha, descripción y costo
- 🎨 **Diseño moderno** con animaciones y gradientes personalizados
- 📱 **Responsive** - funciona en desktop, tablet y móvil
- 🗄️ **Base de datos PostgreSQL** con Supabase
- 🚀 **Deploy automático** con Vercel y GitHub

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS con diseño personalizado
- **Backend/Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage para imágenes
- **Deploy**: Vercel
- **Icons**: Lucide React
- **Fonts**: Space Mono, Orbitron (Google Fonts)

## 📋 Prerequisitos

- Node.js 18.x o superior
- npm o yarn
- Cuenta en Supabase (gratis)
- Cuenta en Vercel (gratis)
- Cuenta en GitHub

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd bike-manager
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Supabase

#### 3.1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que el proyecto se inicialice

#### 3.2. Ejecutar el schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el script

Esto creará:
- La tabla `bicycles` con todos los campos necesarios
- Índices para optimizar consultas
- Políticas RLS (Row Level Security)
- Trigger para actualizar `updated_at` automáticamente
- Bucket de Storage `bike-images` para las fotos

#### 3.3. Obtener las credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - `Project URL`
   - `anon/public` API key

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 5. Configurar dominio de imágenes

Edita `next.config.js` y reemplaza `YOUR_SUPABASE_PROJECT_ID` con tu ID de proyecto:

```javascript
const nextConfig = {
  images: {
    domains: ['tu-project-id.supabase.co'],
  },
}
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌐 Deploy en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repositorio>
git push -u origin main
```

2. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub

3. Importa tu repositorio:
   - Click en "Add New" → "Project"
   - Selecciona tu repositorio
   - Configura las variables de entorno (Environment Variables):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Click en "Deploy"

### Opción 2: Desde CLI

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones y agrega las variables de entorno cuando se solicite.

### Configurar Auto-Deploy

Una vez conectado con GitHub, cada push a `main` desplegará automáticamente la aplicación.

## 📱 Uso de la Aplicación

### Agregar una Bicicleta

1. Click en **"NUEVA BICI"**
2. Completa todos los campos requeridos:
   - Información básica (nombre, modelo, cuadro, etc.)
   - Transmisión (velocidades, cambios, etc.)
   - Frenos
   - Ruedas y neumáticos
   - Componentes
   - Información de compra
3. Opcionalmente sube una foto
4. Agrega mantenciones al historial
5. Click en **"Guardar"**

### Editar una Bicicleta

1. En la lista de bicicletas, click en **"Editar"**
2. Modifica los campos necesarios
3. Click en **"Guardar"**

### Eliminar una Bicicleta

1. En la lista de bicicletas, click en el ícono de **papelera**
2. Confirma la eliminación

### Comparar Bicicletas

1. Click en **"COMPARAR"**
2. Selecciona hasta 3 bicicletas
3. Revisa la tabla de comparación que muestra:
   - Diferencias resaltadas en color cyan
   - Valores idénticos en gris
   - Todas las especificaciones lado a lado

## 🗂️ Estructura del Proyecto

```
bike-manager/
├── app/
│   ├── layout.tsx          # Layout principal con fuentes
│   ├── page.tsx            # Página principal (dashboard)
│   └── globals.css         # Estilos globales
├── components/
│   ├── BikeList.tsx        # Lista de bicicletas
│   ├── BikeForm.tsx        # Formulario crear/editar
│   └── BikeComparison.tsx  # Comparación de bicicletas
├── lib/
│   ├── supabase.ts         # Cliente de Supabase
│   └── bicycleService.ts   # Servicios CRUD
├── types/
│   └── bicycle.ts          # Tipos TypeScript
├── supabase/
│   └── schema.sql          # Schema de base de datos
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🎨 Personalización

### Cambiar colores

Edita `app/globals.css` y modifica las clases de utilidad:

```css
.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500;
}
```

### Cambiar fuentes

Edita `app/layout.tsx` e importa otras fuentes de Google Fonts:

```typescript
import { Tu_Fuente } from 'next/font/google';
```

## 🔒 Seguridad

El proyecto incluye RLS (Row Level Security) básico configurado para permitir todas las operaciones. Para producción, deberías:

1. Implementar autenticación con Supabase Auth
2. Modificar las políticas RLS en `schema.sql`:

```sql
-- Ejemplo: Solo usuarios autenticados
CREATE POLICY "Enable operations for authenticated users only"
ON public.bicycles
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
```

## 📝 Modelo de Datos

### Tabla `bicycles`

```typescript
interface Bicycle {
  id: string;
  name: string;
  model: string;
  frame: string;
  geometry: string;
  fork: string;
  transmission: {
    speeds: string;
    shifter: string;
    chain: string;
    crankset: string;
    bottomBracket: string;
    rearDerailleur: string;
    frontDerailleur?: string;
    cassette: string;
  };
  brakes: {
    type: string;
    model?: string;
    rotorSize?: string;
  };
  wheels: {
    wheelSize: string;
    tires: string;
    frontRim: string;
    frontHub: string;
    rearRim: string;
    rearHub: string;
  };
  components: {
    handlebar: string;
    stem: string;
    seatpost: string;
    saddle: string;
    pedals?: string;
  };
  maintenanceHistory: MaintenanceRecord[];
  purchaseDate: string;
  purchasePrice: number;
  purchaseCondition: 'new' | 'used';
  imageUrl?: string;
  totalKilometers?: number;
  created_at: string;
  updated_at: string;
}
```

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctas
- Asegúrate de usar la clave `anon/public`, no la `service_role`

### Error al subir imágenes
- Verifica que el bucket `bike-images` exista en Supabase Storage
- Confirma que las políticas de storage estén activas

### Estilos no se cargan
```bash
npm run build
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Creado con ❤️ para gestionar tu colección de bicicletas.

## 📞 Soporte

Si tienes problemas o preguntas:
- Abre un issue en GitHub
- Revisa la documentación de [Supabase](https://supabase.com/docs)
- Revisa la documentación de [Next.js](https://nextjs.org/docs)

---

**¡Feliz pedaleo! 🚴‍♂️**
