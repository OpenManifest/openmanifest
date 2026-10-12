import * as React from 'react';
import UiSwitch, { type SwitchProps as UiSwitchProps } from 'app/ui/components/form/Switch';
import { withHookForm } from '../withHookForm';

/** The props this field took when it was a Paper `Switch` in a list item; the look is the design system's now */
type ISwitchProps = Omit<UiSwitchProps, 'label' | 'onChange'> & {
  label?: string;
  onChange?(value: boolean): void;
  onValueChange?(value: boolean): void;
  style?: unknown;
};

function Switch({ label, onChange, onValueChange, style: _style, ...rest }: ISwitchProps) {
  return <UiSwitch {...rest} label={label ?? ''} onChange={onChange ?? onValueChange} />;
}

export const SwitchField = withHookForm(Switch);

export default Switch;
