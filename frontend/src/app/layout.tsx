import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { Playfair_Display, Space_Grotesk } from 'next/font/google';

export const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-serif' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'AI News Aggregator',
  description: 'Curated AI developments and broadcasting platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
