import './globals.css';
import type { Metadata } from 'next';
import { Space_Mono, Orbitron } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

const orbitron = Orbitron({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Bike Manager - Sistema de Gestión de Taller',
  description: 'Sistema de gestión de taller de bicicletas con órdenes de trabajo y control de clientes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${spaceMono.variable} ${orbitron.variable} font-body bg-zinc-950 text-zinc-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
