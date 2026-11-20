import './globals.css';
import Providers from '@/components/operations/Providers';
export const metadata={title:'DATUMOS',description:'DATUM business operations and engineering delivery.'};
export const viewport={width:'device-width',initialScale:1};
export const dynamic='force-dynamic';
export default function RootLayout({children}){return <html lang="en"><body><Providers>{children}</Providers></body></html>;}
