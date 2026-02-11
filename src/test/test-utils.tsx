import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatStoreProvider } from '@/stores/chat.store';
import { UserStoreProvider } from '@/stores/user.store';

/**
 * All providers wrapper for component tests
 * Wraps components with ChatStoreProvider and UserStoreProvider
 */
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <UserStoreProvider>
      <ChatStoreProvider>{children}</ChatStoreProvider>
    </UserStoreProvider>
  );
}

/**
 * Custom render function that wraps components with all necessary providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Setup user event with custom render
 * Returns both the user event instance and custom render utilities
 */
function setup(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...customRender(ui, options),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom version
export { customRender as render, setup };
