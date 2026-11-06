import * as React from 'react';
import { type } from '../../tokens';
import Text from '../Text';
import { colours, flat, renderThemed, SCHEMES } from '../testing';

describe('Text', () => {
  it('takes size, weight and line height from the type token', async () => {
    const screen = await renderThemed(<Text variant="title">Board</Text>);

    expect(flat(screen.getByText('Board'))).toMatchObject({
      fontSize: type.title.fontSize,
      lineHeight: type.title.lineHeight,
      fontWeight: type.title.fontWeight,
    });
  });

  it('is body text by default', async () => {
    const screen = await renderThemed(<Text>Hello</Text>);

    expect(flat(screen.getByText('Hello')).fontSize).toBe(type.body.fontSize);
  });

  it('sets digits of equal width, and not for prose', async () => {
    const screen = await renderThemed(
      <>
        <Text>12:30</Text>
        <Text tabular={false}>a sentence</Text>
      </>
    );

    expect(flat(screen.getByText('12:30')).fontVariant).toEqual(['tabular-nums']);
    expect(flat(screen.getByText('a sentence')).fontVariant).toBeUndefined();
  });

  it.each(SCHEMES)('colours by semantic token in the %s scheme', async (scheme) => {
    const c = colours[scheme];
    const screen = await renderThemed(
      <>
        <Text>one</Text>
        <Text tone="muted">two</Text>
        <Text tone="brand">three</Text>
        <Text tone="onBrand">four</Text>
        <Text tone="blocked">five</Text>
      </>,
      { scheme }
    );

    expect(flat(screen.getByText('one')).color).toBe(c.text);
    expect(flat(screen.getByText('two')).color).toBe(c.textMuted);
    expect(flat(screen.getByText('three')).color).toBe(c.brandText);
    expect(flat(screen.getByText('four')).color).toBe(c.onBrand);
    expect(flat(screen.getByText('five')).color).toBe(c.status.blocked.fg);
  });

  it('passes the role and level of a heading on', async () => {
    const screen = await renderThemed(
      <Text role="heading" aria-level={2}>
        Section
      </Text>
    );

    expect(screen.getByRole('heading', { name: 'Section' })).toBeTruthy();
  });

  it('caps the growth of chrome text', async () => {
    const screen = await renderThemed(<Text chrome>Bar</Text>);

    expect(screen.getByText('Bar').props.maxFontSizeMultiplier).toBeGreaterThan(1);
  });
});
