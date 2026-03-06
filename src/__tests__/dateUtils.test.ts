import { formatDuration } from '../utils/dateUtils';

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(5 * 60000)).toBe('5m');
    expect(formatDuration(45 * 60000)).toBe('45m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90 * 60000)).toBe('1t 30m');
    expect(formatDuration(3 * 3600000 + 15 * 60000)).toBe('3t 15m');
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('formats exact hours', () => {
    expect(formatDuration(2 * 3600000)).toBe('2t 0m');
  });
});
