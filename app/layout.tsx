import type { Metadata } from 'next';
import { Cinzel, Lora } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/SessionProvider';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });

export const metadata: Metadata = {
  title: 'RustyNotes',
  description: 'A place for ancient scrolls and rustic tales',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${cinzel.variable} ${lora.variable}`}>
      <body className="bg-[#f4e4c1] text-[#3b2a1a] min-h-screen">
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}