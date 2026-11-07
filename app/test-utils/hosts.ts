import { within } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';

/**
 * Test Renderer only renders host elements, so there are no queries by component type (`UNSAFE_getAllByType`). Query the
 * host element a component renders instead: `hostsOfType(screen.container, 'TextInput')`. Prefer `getByRole`,
 * `getByText` and `getByTestId`; use these for the few things that have no role or text (inputs in a form, scroll views).
 */
export function hostsWhere(
  root: TestInstance,
  predicate: (instance: TestInstance) => boolean
): TestInstance[] {
  return root.queryAll(predicate, { includeSelf: true });
}

/** The host elements of a React Native host type ('TextInput', 'RCTScrollView', 'View', …), in render order */
export function hostsOfType(root: TestInstance, type: string): TestInstance[] {
  return hostsWhere(root, (instance) => instance.type === type);
}

/** The text inputs inside `root`, in render order */
export function textInputs(root: TestInstance): TestInstance[] {
  return hostsOfType(root, 'TextInput');
}

/** `within(instance)` that also keeps the instance: `scoped(screen.getByTestId('form')).container` */
export function scoped(instance: TestInstance) {
  return Object.assign(within(instance), { container: instance });
}
