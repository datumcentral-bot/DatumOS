'use client';
import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import { ToastProvider } from '@/components/mil';
import { SocketProvider } from '@/lib/SocketContext';
export default function Providers({children}){const path=usePathname();return <AuthProvider>{path.startsWith('/operations')?children:<SocketProvider><ToastProvider>{children}</ToastProvider></SocketProvider>}</AuthProvider>;}
