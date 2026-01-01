import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log } from '../log';

describe('log util', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('info should prefix message with info emoji', () => {
    log.info('test message');
    expect(consoleLogSpy).toHaveBeenCalledWith('ℹ️ test message');
  });

  it('success should prefix message with check emoji', () => {
    log.success('yay');
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ yay');
  });

  it('debug should log message as-is', () => {
    log.debug('raw debug');
    expect(consoleLogSpy).toHaveBeenCalledWith('raw debug');
  });

  it('error should call console.error with error prefix and error object', () => {
    const err = new Error('boom');
    log.error('something bad', err);
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ something bad', err);
  });

  it('error should still call console.error when no error object provided', () => {
    log.error('no object');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ no object', undefined);
  });
});
