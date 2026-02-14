import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { CTASection, Footer } from '@/components/landing/CtaFooter';

/**
 * Force dynamic rendering
 */
export const dynamic = 'force-dynamic';

/**
 * Landing page for unauthenticated users
 * Shows product features, how it works, use cases, and CTAs
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Await params to ensure this page re-renders when locale changes
  await params;
  return (
    <div className="bg-background min-h-screen">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
