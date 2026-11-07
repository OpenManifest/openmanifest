/**
 * The key of a new crew role, made from its name: lower case letters, digits and underscores, starting with a letter
 * (the API's rule), and not one the operator already has ("camera_flyer", then "camera_flyer_2").
 */
export function crewRoleKey(name: string, taken: readonly string[] = []): string {
  const base =
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^[^a-z]+/, '')
      .replace(/_+$/, '') || 'crew';
  if (!taken.includes(base)) return base;
  let index = 2;
  while (taken.includes(`${base}_${index}`)) index += 1;
  return `${base}_${index}`;
}

/** The permissions a crew role can ask of who fills it: the "act as" ones */
export function crewPermissions(permissions: readonly string[]): string[] {
  return permissions.filter((permission) => permission.startsWith('actAs'));
}

/** The choice of no permission in the form (a select cannot hold an empty value on the web) */
export const ANYONE = 'anyone';
