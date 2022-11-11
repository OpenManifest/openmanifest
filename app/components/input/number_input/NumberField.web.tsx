import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

export enum NumberFieldType {
  Cash = 'cash',
  Weight = 'weight',
  CanopySize = 'canopySize',
}
interface INumberFieldProps {
  error?: string | null;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  value?: number | null;
  mode?: 'outlined' | 'flat';
  variant?: NumberFieldType | null;
  onChange(newValue: number): void;
}

const adornments = {
  [NumberFieldType.Cash]: '$',
  [NumberFieldType.CanopySize]: 'ft',
  [NumberFieldType.Weight]: 'kg',
};
const muiVariants = {
  flat: 'standard',
  outlined: 'outlined',
};
export default function NumberField(props: INumberFieldProps) {
  const {
    label,
    mode,
    disabled,
    onChange: onChangeValue,
    helperText,
    error,
    variant,
    ...rest
  } = props;
  const { value } = rest;

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeValue(parseInt(e.target.value, 10));
    },
    [onChangeValue]
  );

  return (
    <FormControl
      style={{ paddingRight: 8 }}
      variant={
        mode && mode in muiVariants ? (muiVariants[mode] as 'outlined' | 'standard') : 'outlined'
      }
      fullWidth
    >
      <TextField
        type="number"
        fullWidth
        variant={
          mode && mode in muiVariants ? (muiVariants[mode] as 'outlined' | 'standard') : 'outlined'
        }
        {...{ label, disabled, value, onChange }}
        InputProps={{
          ...(variant && variant !== NumberFieldType.Cash
            ? {
                endAdornment: <InputAdornment position="end">{adornments[variant]}</InputAdornment>,
              }
            : {}),
          ...(variant !== NumberFieldType.Cash
            ? {}
            : {
                startAdornment: (
                  <InputAdornment position="start">{adornments[variant]}</InputAdornment>
                ),
              }),
        }}
      />
      <FormHelperText error={!!error}>{error || helperText || ' '}</FormHelperText>
    </FormControl>
  );
}
