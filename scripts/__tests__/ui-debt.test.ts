/** @jest-environment node */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { countSource, directoryOf } = require('../lib/ui-debt');

describe('countSource', () => {
  it('counts nothing in clean code', () => {
    const code = `import { Text } from 'react-native';\nexport const A = () => <Text>{t('x')}</Text>;`;

    expect(countSource(code)).toEqual({
      paperImports: 0,
      colourLiterals: 0,
      rawTouchables: 0,
      numericFontSizes: 0,
      literalStrings: 0,
    });
  });

  it('counts Paper imports, including sub-paths', () => {
    const code = `import { Button } from 'react-native-paper';\nimport X from 'react-native-paper/src/x';\nimport Y from 'react-native-paper-dates';`;

    expect(countSource(code, 'a.ts').paperImports).toBe(2);
  });

  it('counts colour literals but not words that contain a colour', () => {
    const code = `const a = ['#fff', '#1D3557', 'rgb(0,0,0)', 'rgba(0,0,0,.5)', 'white', 'black', 'whitespace', 'blackout', '#nope'];`;

    expect(countSource(code, 'a.ts').colourLiterals).toBe(6);
  });

  it('counts raw touchables with onPress only', () => {
    const code = `const a = <><Pressable onPress={f} /><TouchableOpacity onPress={f}>x</TouchableOpacity><Pressable disabled /><Button onPress={f} /></>;`;

    expect(countSource(code).rawTouchables).toBe(2);
  });

  it('counts numeric font sizes only', () => {
    const code = `const a = { fontSize: 14, b: { 'fontSize': 12 }, c: { fontSize: size } };`;

    expect(countSource(code, 'a.ts').numericFontSizes).toBe(2);
  });

  it('counts literal text in JSX and in label props', () => {
    const code = `const a = <View><Text>Hello</Text><Text>{t('x')}</Text><Text>  </Text><Text>12</Text><Button label="Save" title={t('y')} accessibilityLabel="Close" placeholder="" /></View>;`;

    expect(countSource(code).literalStrings).toBe(4);
  });

  it('ignores comments', () => {
    const code = `// '#fff' and fontSize: 14 and <Pressable onPress>\nconst a = 1; /* 'white' */`;

    expect(countSource(code, 'a.ts')).toEqual({
      paperImports: 0,
      colourLiterals: 0,
      rawTouchables: 0,
      numericFontSizes: 0,
      literalStrings: 0,
    });
  });
});

describe('directoryOf', () => {
  it('groups by the first directory, and screens by area and directory', () => {
    expect(directoryOf('app/components/Foo.tsx')).toBe('app/components');
    expect(directoryOf('app/components/layout/Foo.tsx')).toBe('app/components');
    expect(directoryOf('app/screens/authenticated/manifest/load/Foo.tsx')).toBe(
      'app/screens/authenticated/manifest'
    );
    expect(directoryOf('app/screens/routes.tsx')).toBe('app/screens');
    expect(directoryOf('app/App.tsx')).toBe('app');
  });
});
