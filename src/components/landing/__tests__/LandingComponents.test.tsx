import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '../HeroSection';
import { FeaturesSection } from '../FeaturesSection';
import { HowItWorksSection } from '../HowItWorksSection';
import { UseCasesSection } from '../UseCasesSection';
import { CTASection, Footer } from '../CtaFooter';
import { LandingNavbar } from '../LandingNavbar';

/**
 * Note: useTranslations is mocked globally in setup.ts to return the key itself.
 * So t('landing.hero.title') returns 'landing.hero.title' → but since useTranslations
 * is called with a namespace, t('badge') returns 'badge'.
 */

describe('HeroSection', () => {
  it('should render the section', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render a heading', () => {
    render(<HeroSection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render CTA links', () => {
    render(<HeroSection />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('should render stats section', () => {
    render(<HeroSection />);
    // Stats render translated keys like 'stats.resolution.value'
    expect(screen.getByText('stats.resolution.value')).toBeInTheDocument();
    expect(screen.getByText('stats.onboarding.value')).toBeInTheDocument();
    expect(screen.getByText('stats.questions.value')).toBeInTheDocument();
  });
});

describe('FeaturesSection', () => {
  it('should render the features section', () => {
    const { container } = render(<FeaturesSection />);
    const section = container.querySelector('#features');
    expect(section).toBeInTheDocument();
  });

  it('should render section title', () => {
    render(<FeaturesSection />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('title');
  });

  it('should render all 6 feature cards', () => {
    render(<FeaturesSection />);
    // Each card renders a title like 'items.sectors.title', 'items.ingestion.title', etc.
    expect(screen.getByText('items.sectors.title')).toBeInTheDocument();
    expect(screen.getByText('items.ingestion.title')).toBeInTheDocument();
    expect(screen.getByText('items.qa.title')).toBeInTheDocument();
    expect(screen.getByText('items.capsules.title')).toBeInTheDocument();
    expect(screen.getByText('items.analytics.title')).toBeInTheDocument();
    expect(screen.getByText('items.access.title')).toBeInTheDocument();
  });

  it('should render feature descriptions', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('items.sectors.description')).toBeInTheDocument();
    expect(screen.getByText('items.ingestion.description')).toBeInTheDocument();
  });
});

describe('HowItWorksSection', () => {
  it('should render the how-it-works section', () => {
    const { container } = render(<HowItWorksSection />);
    const section = container.querySelector('#how-it-works');
    expect(section).toBeInTheDocument();
  });

  it('should render section heading', () => {
    render(<HowItWorksSection />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('title');
  });

  it('should render 3 steps', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('steps.upload.title')).toBeInTheDocument();
    expect(screen.getByText('steps.index.title')).toBeInTheDocument();
    expect(screen.getByText('steps.answer.title')).toBeInTheDocument();
  });

  it('should render step numbers', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });
});

describe('UseCasesSection', () => {
  it('should render the use-cases section', () => {
    const { container } = render(<UseCasesSection />);
    const section = container.querySelector('#use-cases');
    expect(section).toBeInTheDocument();
  });

  it('should render section heading', () => {
    render(<UseCasesSection />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('title');
  });

  it('should render all 4 use cases', () => {
    render(<UseCasesSection />);
    expect(screen.getByText('items.onboarding.title')).toBeInTheDocument();
    expect(screen.getByText('items.retention.title')).toBeInTheDocument();
    expect(screen.getByText('items.crossFunctional.title')).toBeInTheDocument();
    expect(screen.getByText('items.quality.title')).toBeInTheDocument();
  });

  it('should render persona labels', () => {
    render(<UseCasesSection />);
    expect(screen.getByText('items.onboarding.persona')).toBeInTheDocument();
    expect(screen.getByText('items.retention.persona')).toBeInTheDocument();
  });
});

describe('CTASection', () => {
  it('should render the CTA section', () => {
    const { container } = render(<CTASection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render heading', () => {
    render(<CTASection />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('title');
  });

  it('should render CTA button link', () => {
    render(<CTASection />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/auth/signin');
  });
});

describe('Footer', () => {
  it('should render the footer', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should render brand name', () => {
    render(<Footer />);
    expect(screen.getByText('Context.ai')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it('should render copyright text', () => {
    render(<Footer />);
    expect(screen.getByText('copyright')).toBeInTheDocument();
  });
});

describe('LandingNavbar', () => {
  it('should render the navbar', () => {
    const { container } = render(<LandingNavbar />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render brand logo and text', () => {
    render(<LandingNavbar />);
    expect(screen.getByText('Context.ai')).toBeInTheDocument();
  });

  it('should render desktop navigation links', () => {
    render(<LandingNavbar />);
    const featuresLink = screen.getAllByText('features');
    expect(featuresLink.length).toBeGreaterThanOrEqual(1);
  });

  it('should render auth buttons', () => {
    render(<LandingNavbar />);
    const signInLinks = screen.getAllByText('signIn');
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('should toggle mobile menu when hamburger is clicked', async () => {
    const user = userEvent.setup();
    render(<LandingNavbar />);

    // Find hamburger button (aria-label = openMenu)
    const hamburger = screen.getByRole('button', { name: 'openMenu' });
    expect(hamburger).toBeInTheDocument();

    await user.click(hamburger);

    // Now close button should be visible with 'closeMenu' label
    const closeButton = screen.getByRole('button', { name: 'closeMenu' });
    expect(closeButton).toBeInTheDocument();
  });

  it('should close mobile menu when a nav link is clicked', async () => {
    const user = userEvent.setup();
    render(<LandingNavbar />);

    // Open mobile menu
    await user.click(screen.getByRole('button', { name: 'openMenu' }));

    // Click a nav link in mobile menu
    const mobileLinks = screen.getAllByText('features');
    // Click the last one (mobile version)
    await user.click(mobileLinks[mobileLinks.length - 1]);

    // Menu should close - hamburger should show 'openMenu' again
    expect(screen.getByRole('button', { name: 'openMenu' })).toBeInTheDocument();
  });
});
