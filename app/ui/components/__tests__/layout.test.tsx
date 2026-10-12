import * as React from 'react';
import { Text as NativeText } from 'react-native';
import { space } from '../../tokens';
import Card from '../Card';
import Divider from '../Divider';
import { Row, Stack } from '../Stack';
import { colours, flat, renderThemed, SCHEMES } from './render';

describe('Stack and Row', () => {
  it('lay out in a column and in a row with a gap from the scale', async () => {
    const screen = await renderThemed(
      <>
        <Stack testID="stack" gap="md">
          <NativeText>a</NativeText>
        </Stack>
        <Row testID="row" gap="sm" align="center" justify="between" wrap>
          <NativeText>b</NativeText>
        </Row>
      </>
    );

    expect(flat(screen.getByTestId('stack'))).toMatchObject({
      flexDirection: 'column',
      gap: space.md,
    });
    expect(flat(screen.getByTestId('row'))).toMatchObject({
      flexDirection: 'row',
      gap: space.sm,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    });
  });

  it('pads from the scale and takes the space left with flex', async () => {
    const screen = await renderThemed(
      <Stack testID="stack" padding="lg" flex>
        <NativeText>a</NativeText>
      </Stack>
    );

    expect(flat(screen.getByTestId('stack'))).toMatchObject({ padding: space.lg, flex: 1 });
  });
});

describe('Card', () => {
  it.each(SCHEMES)('is outlined when flat in the %s scheme', async (scheme) => {
    const screen = await renderThemed(
      <Card testID="card">
        <NativeText>content</NativeText>
      </Card>,
      { scheme }
    );
    const style = flat(screen.getByTestId('card'));

    expect(style).toMatchObject({
      backgroundColor: colours[scheme].surface,
      borderWidth: 1,
      borderColor: colours[scheme].border,
      padding: space.lg,
    });
    expect(style.shadowOpacity).toBeUndefined();
  });

  it('floats on a shadow when raised, and has no padding when asked', async () => {
    const screen = await renderThemed(
      <Card testID="card" variant="raised" padding="none">
        <NativeText>content</NativeText>
      </Card>
    );
    const style = flat(screen.getByTestId('card'));

    expect(style.shadowOpacity).toBeGreaterThan(0);
    expect(style.borderWidth).toBeUndefined();
    expect(style.padding).toBe(0);
  });
});

describe('Divider', () => {
  it.each(SCHEMES)('is a separator in the border colour in the %s scheme', async (scheme) => {
    const screen = await renderThemed(<Divider testID="divider" />, { scheme });
    const divider = screen.getByTestId('divider');

    expect(flat(divider).backgroundColor).toBe(colours[scheme].border);
    expect(divider.props['aria-orientation']).toBe('horizontal');
  });

  it('indents from the start, and can be vertical', async () => {
    const screen = await renderThemed(
      <>
        <Divider testID="horizontal" inset={56} />
        <Divider testID="vertical" vertical />
      </>
    );
    const horizontal = screen.getByTestId('horizontal');
    const vertical = screen.getByTestId('vertical');

    expect(flat(horizontal).marginStart).toBe(56);
    expect(vertical.props['aria-orientation']).toBe('vertical');
  });
});
