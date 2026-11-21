'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import { ToastProvider } from '@/components/mil';
import { SocketProvider } from '@/lib/SocketContext';
export default function Providers({children}){const path=usePathname();useEffect(()=>{const o=window.fetch;window.fetch=(u,opts={})=>{if(typeof u==='string'&&u.startsWith('/api/'))opts.credentials='include';return o(u,opts);}},[]);return <AuthProvider>{path.startsWith('/operations')?children:<SocketProvider><ToastProvider>{children}</ToastProvider></SocketProvider>}</AuthProvider>;}
