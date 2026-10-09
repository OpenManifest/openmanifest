import { breakpointOf } from '../useBreakpoint';

describe('breakpointOf', () => {
  it.each([
    [360, 'compact'],
    [599, 'compact'],
    [600, 'medium'],
    [1023, 'medium'],
    [1024, 'expanded'],
    [1280, 'expanded'],
  ])('maps %d dp to %s', (width, breakpoint) => {
    expect(breakpointOf(width)).toBe(breakpoint);
  });
});
