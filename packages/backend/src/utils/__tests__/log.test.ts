import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log } from '../log.js';

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

  /* ---------------------------------- */
  /* INFO */
  /* ---------------------------------- */

  it('info should prefix message with info emoji', () => {
    log.info('test message');
    expect(consoleLogSpy).toHaveBeenCalledWith('ℹ️ test message');
  });

  /* ---------------------------------- */
  /* SUCCESS */
  /* ---------------------------------- */

  it('success should prefix message with check emoji', () => {
    log.success('yay');
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ yay');
  });

  /* ---------------------------------- */
  /* DEBUG */
  /* ---------------------------------- */

  it('debug should log message as-is', () => {
    log.debug('raw debug');
    expect(consoleLogSpy).toHaveBeenCalledWith('raw debug');
  });

  /* ---------------------------------- */
  /* ERROR WITH ERROR OBJECT */
  /* ---------------------------------- */

  it('error should log prefix, message and stack when Error provided', () => {
    const err = new Error('boom');

    log.error('something bad', err);

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, '❌ something bad');

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, err.message);

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, err.stack);
  });

  /* ---------------------------------- */
  /* ERROR WITHOUT ERROR OBJECT */
  /* ---------------------------------- */

  it('error should log prefix and stringify when non-error provided', () => {
    log.error('no object', { test: true });

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, '❌ no object');

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({ test: true }, null, 2)
    );
  });

  /* ---------------------------------- */
  /* ERROR WITH NO SECOND ARG */
  /* ---------------------------------- */

  it('error should log prefix and stringify undefined when no error provided', () => {
    log.error('no object');

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, '❌ no object');

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      JSON.stringify(undefined, null, 2)
    );
  });
});
