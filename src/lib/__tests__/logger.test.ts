describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('logs warn in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('../logger');
    logger.warn('test warning');
    expect(spy).toHaveBeenCalledWith('test warning');
  });

  it('logs error in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { logger } = await import('../logger');
    logger.error('test error');
    expect(spy).toHaveBeenCalledWith('test error');
  });

  it('logs info in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const { logger } = await import('../logger');
    logger.info('test info');
    expect(spy).toHaveBeenCalledWith('test info');
  });

  it('does not log warn in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { logger } = await import('../logger');
    logger.warn('should not appear');
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not log error in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { logger } = await import('../logger');
    logger.error('should not appear');
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not log info in test environment', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const { logger } = await import('../logger');
    logger.info('should not appear');
    expect(spy).not.toHaveBeenCalled();
  });
});
