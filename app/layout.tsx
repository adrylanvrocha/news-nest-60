import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FrancesNews',
    template: '%s | FrancesNews',
  },
  description: 'Portal de notícias e podcasts',
  keywords: ['notícias', 'podcasts', 'brasil', 'política', 'mundo', 'cultura', 'entretenimento'],
  authors: [{ name: 'FrancesNews' }],
  creator: 'FrancesNews',
  publisher: 'FrancesNews',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://francesnews-lovable.lovable.app',
    siteName: 'FrancesNews',
    title: 'FrancesNews - Portal de Notícias e Podcasts',
    description: 'Fique por dentro das principais notícias do Brasil e do mundo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrancesNews',
    description: 'Portal de notícias e podcasts',
    creator: '@francesnews',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}