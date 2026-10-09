import withDefaults from '../initialValues';

describe('withDefaults', () => {
  const defaults = { name: null as string | null, cost: 30, extras: [] as string[] };

  test('initial values win over the defaults', () => {
    expect(withDefaults(defaults, { name: 'Hop n Pop', cost: 45 })).toEqual({
      name: 'Hop n Pop',
      cost: 45,
      extras: [],
    });
  });

  test('an undefined initial value keeps the default', () => {
    expect(withDefaults(defaults, { name: undefined, cost: undefined })).toEqual(defaults);
  });

  test('null and zero are values, not gaps', () => {
    expect(withDefaults(defaults, { name: null, cost: 0 })).toEqual({
      name: null,
      cost: 0,
      extras: [],
    });
  });

  test('works without initial values', () => {
    expect(withDefaults(defaults)).toEqual(defaults);
  });
});
