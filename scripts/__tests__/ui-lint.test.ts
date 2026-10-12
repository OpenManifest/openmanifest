/** @jest-environment node */
import { ESLint } from 'eslint';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
// The config is passed in, not loaded by ESLint: its loader needs a dynamic import, which Jest does not support
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('../../eslint.config.js');
const eslint = new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: config });

async function messages(code: string, file = 'app/ui/Example.tsx') {
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) });
  return result.messages.filter(
    (m) => m.ruleId === 'no-restricted-syntax' || m.ruleId === 'no-restricted-imports'
  );
}

const clean = `
import * as React from 'react';
import { View, Image } from 'react-native';
export function Example({ theme }: { theme: any }) {
  return (
    <View style={{ padding: theme.space.lg, margin: 0, gap: 0, backgroundColor: theme.colour.surface }}>
      <Image source={1} accessibilityLabel="Logo" />
      <Image source={2} accessible={false} />
    </View>
  );
}
`;

describe('UI lint rules in converted directories', () => {
  it('accept code that uses tokens', async () => {
    expect(await messages(clean)).toEqual([]);
  });

  it.each([
    ['a hex colour', `const a = { color: '#fff' };`],
    ['a long hex colour', `const a = { color: '#1D3557' };`],
    ['an rgb colour', `const a = { color: 'rgb(1, 2, 3)' };`],
    ['an rgba colour', `const a = { color: 'rgba(0,0,0,0.5)' };`],
    ['white', `const a = { color: 'white' };`],
    ['black', `const a = { color: "black" };`],
    ['a numeric fontSize', `const a = { fontSize: 14 };`],
    ['numeric padding', `const a = { padding: 8 };`],
    ['numeric paddingHorizontal', `const a = { paddingHorizontal: 12 };`],
    ['a numeric margin', `const a = { marginTop: 4 };`],
    ['a numeric gap', `const a = { gap: 8 };`],
    ['a negative margin', `const a = { marginLeft: -4 };`],
    ['a Paper import', `import { Button } from 'react-native-paper';`],
    ['a Paper sub-path import', `import Button from 'react-native-paper/src/components/Button';`],
    ['a raw Pressable', `const a = <Pressable onPress={() => {}} />;`],
    ['a TouchableOpacity', `const a = <TouchableOpacity onPress={f}>x</TouchableOpacity>;`],
    ['an Image without a label', `const a = <Image source={1} />;`],
    ['an Image with accessible={true}', `const a = <Image source={1} accessible />;`],
  ])('reject %s', async (_name, code) => {
    expect((await messages(code)).length).toBeGreaterThan(0);
  });

  it('allow a Pressable without onPress', async () => {
    expect(await messages(`const a = <Pressable disabled />;`)).toEqual([]);
  });

  it('allow literals in the tokens and in tests', async () => {
    expect(
      await messages(`const a = { color: '#fff', fontSize: 12, padding: 8 };`, 'app/ui/tokens/x.ts')
    ).toEqual([]);
    expect(
      await messages(
        `const a = { color: '#fff', fontSize: 12 };`,
        'app/ui/theme/__tests__/x.test.ts'
      )
    ).toEqual([]);
  });

  it('do not apply outside the converted directories', async () => {
    expect(
      await messages(
        `const a = { color: '#fff', fontSize: 12, padding: 8 };`,
        'app/components/Example.tsx'
      )
    ).toEqual([]);
    expect(
      await messages(`import { Button } from 'react-native-paper';`, 'app/components/Example.tsx')
    ).toEqual([]);
  });

  it('keep the layout rules in converted directories', async () => {
    expect((await messages(`import { SafeAreaView } from 'react-native';`)).length).toBeGreaterThan(
      0
    );
    expect((await messages(`const w = Dimensions.get('window');`)).length).toBeGreaterThan(0);
  });
});
