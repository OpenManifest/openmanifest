import type * as React from 'react';
import { withHookForm as withUiHookForm } from 'app/ui/components/form/withHookForm';

/**
 * Makes `Component` a form field (`control`, `name`, `rules`): the field's value, change handler and validation message
 * become its `value`, `onChange` and `error`. The one implementation is in `app/ui`; this keeps the import path of the
 * legacy inputs.
 */
export function withHookForm<BaseProps extends object, _Value = unknown>(
  Component: React.ComponentType<BaseProps>
) {
  return withUiHookForm(Component);
}
