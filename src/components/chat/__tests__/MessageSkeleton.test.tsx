import { render } from '@/test/test-utils';
import { MessageSkeleton } from '../MessageSkeleton';

describe('MessageSkeleton', () => {
  it('should render default 3 skeleton items', () => {
    const { container } = render(<MessageSkeleton />);

    // Each skeleton item has a rounded-full avatar skeleton
    const avatarSkeletons = container.querySelectorAll('[class*="rounded-full"]');
    expect(avatarSkeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('should render specified number of skeleton items', () => {
    const { container } = render(<MessageSkeleton count={5} />);

    // The main container has space-y-4 class and direct children are the items
    const spacedDiv = container.querySelector('[class*="space-y-4"]');
    expect(spacedDiv).toBeInTheDocument();
    expect(spacedDiv?.children).toHaveLength(5);
  });

  it('should render 1 skeleton item', () => {
    const { container } = render(<MessageSkeleton count={1} />);

    const spacedDiv = container.querySelector('[class*="space-y-4"]');
    expect(spacedDiv?.children).toHaveLength(1);
  });

  it('should render 0 skeleton items when count is 0', () => {
    const { container } = render(<MessageSkeleton count={0} />);

    const spacedDiv = container.querySelector('[class*="space-y-4"]');
    expect(spacedDiv?.children).toHaveLength(0);
  });
});
