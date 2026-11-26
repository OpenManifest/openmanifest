/** Is the module on for the operator? `operator.modules` holds the enabled modules with their configuration */
export function moduleEnabled(modules: unknown, name: string): boolean {
  return !!modules && typeof modules === 'object' && name in (modules as Record<string, unknown>);
}
