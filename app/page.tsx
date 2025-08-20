import { Metadata } from 'next';
import Layout from '@/components/Layout';
import FeaturedNews from '@/components/FeaturedNews';
import RecentNews from '@/components/RecentNews';
import CategorySection from '@/components/CategorySection';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'FrancesNews - Portal de Notícias e Podcasts',
  description: 'Fique por dentro das principais notícias do Brasil e do mundo com análises, reportagens e podcasts exclusivos.',
  openGraph: {
    title: 'FrancesNews - Portal de Notícias e Podcasts',
    description: 'Fique por dentro das principais notícias do Brasil e do mundo com análises, reportagens e podcasts exclusivos.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <Layout>
      <div className="min-h-screen">
        <FeaturedNews />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentNews />
            </div>
            <div className="space-y-8">
              <CategorySection />
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}