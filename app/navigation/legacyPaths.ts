/**
 * A member's pages have one URL, under `/user/…`. The User stack used to be registered four times, so links, bookmarks and
 * browser history may still hold `/manifest/users/…` and `/modal/user/…`: they are rewritten to the canonical path
 * before the linking configuration reads them (and the address bar is replaced with the canonical one).
 */
const LEGACY: [RegExp, (...match: string[]) => string][] = [
  [/^\/manifest\/users\/?$/, () => '/users'],
  [/^\/manifest\/users\/([^/]+)\/equipment\/?$/, (id) => `/user/${id}/equipment`],
  [
    /^\/manifest\/users\/([^/]+)\/orders\/([^/]+)\/receipts?\/?$/,
    (id, order) => `/user/${id}/transactions/${order}/receipt`,
  ],
  [/^\/manifest\/users\/([^/]+)\/orders\/?$/, (id) => `/user/${id}/transactions`],
  [
    /^\/manifest\/users\/([^/]+)\/rig\/([^/]+)\/inspection\/?$/,
    (membership, equipment) => `/user/${membership}/equipment-inspection/${equipment}`,
  ],
  // Equipment was rigs (P7.14): the pages keep working under their old addresses
  [/^\/configuration\/rigs\/?$/, () => '/configuration/equipment'],
  [/^\/configuration\/rig-inspection\/?$/, () => '/configuration/equipment-inspection'],
  [
    /^\/user\/([^/]+)\/rig-inspection\/([^/]+)\/?$/,
    (membership, equipment) => `/user/${membership}/equipment-inspection/${equipment}`,
  ],
  [/^\/manifest\/users\/([^/]+)\/?$/, (id) => `/user/${id}`],
  [/^\/modal\/users\/?$/, () => '/users'],
  [/^\/modal\/(user\/.*)$/, (rest) => `/${rest}`],
];

/** The path with the first rewrite that applies, or null when it is not a legacy one */
function rewriteOnce(path: string): string | null {
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const suffix = rest.join('');
  for (const [pattern, replacement] of LEGACY) {
    const match = pattern.exec(pathname);
    if (match) return `${replacement(...match.slice(1))}${suffix}`;
  }
  return null;
}

/**
 * The canonical path for `path` (which may carry a query string or hash), or `path` itself when it is not a legacy one.
 * An old path can be old twice (`/modal/user/12/rig-inspection/5`): it is rewritten until it is canonical.
 */
export function redirectLegacyPath(path: string): string {
  let current = path;
  for (let step = 0; step < LEGACY.length; step += 1) {
    const next = rewriteOnce(current);
    if (next === null || next === current) break;
    current = next;
  }
  return current;
}
