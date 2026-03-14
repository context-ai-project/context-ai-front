import { routes } from '../routes';

describe('routes', () => {
  it('generates home route', () => {
    expect(routes.home('en')).toBe('/en');
  });

  it('generates signIn route', () => {
    expect(routes.signIn('es')).toBe('/es/auth/signin');
  });

  it('generates inactive route', () => {
    expect(routes.inactive('en')).toBe('/en/auth/inactive');
  });

  it('generates dashboard route', () => {
    expect(routes.dashboard('en')).toBe('/en/dashboard');
  });

  it('generates chat route', () => {
    expect(routes.chat('es')).toBe('/es/chat');
  });

  it('generates documents route', () => {
    expect(routes.documents('en')).toBe('/en/documents');
  });

  it('generates sectors route', () => {
    expect(routes.sectors('en')).toBe('/en/sectors');
  });

  it('generates admin route', () => {
    expect(routes.admin('en')).toBe('/en/admin');
  });

  it('generates capsules route', () => {
    expect(routes.capsules('en')).toBe('/en/capsules');
  });

  it('generates capsuleDetail route with id', () => {
    expect(routes.capsuleDetail('en', 'abc-123')).toBe('/en/capsules/abc-123');
  });

  it('generates capsuleCreate route', () => {
    expect(routes.capsuleCreate('es')).toBe('/es/capsules/create');
  });

  it('generates capsuleResume route with id', () => {
    expect(routes.capsuleResume('en', 'xyz')).toBe('/en/capsules/xyz/resume');
  });
});
