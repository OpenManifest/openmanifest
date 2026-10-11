import * as React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { TextInputProps } from 'react-native-paper';
import { useInSheet } from '../layout/SheetContext';

type RenderProps = Parameters<NonNullable<TextInputProps['render']>>[0];

function renderSheetTextInput(props: RenderProps) {
  return <BottomSheetTextInput {...(props as React.ComponentProps<typeof BottomSheetTextInput>)} />;
}

/**
 * The `render` prop for a Paper `TextInput`: inside a `Sheet` it renders a `BottomSheetTextInput`, so the sheet moves
 * above the keyboard when the input is focused. Undefined elsewhere (Paper's own input).
 */
export default function useSheetInputRender(): TextInputProps['render'] {
  return useInSheet() ? renderSheetTextInput : undefined;
}
