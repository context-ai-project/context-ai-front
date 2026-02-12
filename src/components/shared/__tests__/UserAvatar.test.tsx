import { render, screen } from '@/test/test-utils';
import { UserAvatar } from '../UserAvatar';

/**
 * Note: Radix UI Avatar uses an IntersectionObserver-based approach to load images.
 * In jsdom, images never actually load, so AvatarImage never renders its <img> tag.
 * Instead, the AvatarFallback is always shown. We test the fallback behavior
 * and verify the component accepts the correct props.
 */
describe('UserAvatar', () => {
  it('should render fallback initial from user object', () => {
    render(<UserAvatar user={{ name: 'John Doe', picture: 'https://example.com/avatar.jpg' }} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render fallback initial from alt prop', () => {
    render(<UserAvatar src="https://example.com/avatar.jpg" alt="Jane Doe" />);

    // In jsdom, image doesn't load, so fallback shows initial
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should show initial letter as fallback when no image', () => {
    render(<UserAvatar alt="Alice" />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should show "U" as fallback when no name is provided', () => {
    render(<UserAvatar />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should apply small size class', () => {
    const { container } = render(<UserAvatar alt="Test" size="sm" />);

    const avatar = container.querySelector('[class*="h-8"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should apply medium size class by default', () => {
    const { container } = render(<UserAvatar alt="Test" />);

    const avatar = container.querySelector('[class*="h-10"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should apply large size class', () => {
    const { container } = render(<UserAvatar alt="Test" size="lg" />);

    const avatar = container.querySelector('[class*="h-14"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should prioritize alt prop over user.name for fallback initial', () => {
    render(
      <UserAvatar
        user={{ name: 'John', picture: 'https://example.com/old.jpg' }}
        src="https://example.com/new.jpg"
        alt="Xavier"
      />,
    );

    // alt prop takes precedence for the initial letter
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('should uppercase the initial letter', () => {
    render(<UserAvatar alt="lowercase" />);

    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('should render avatar container with data-slot attribute', () => {
    const { container } = render(<UserAvatar alt="Test" />);

    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });
});
