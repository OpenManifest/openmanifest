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
    (membership, rig) => `/user/${membership}/rig-inspection/${rig}`,
  ],
  [/^\/manifest\/users\/([^/]+)\/?$/, (id) => `/user/${id}`],
  [/^\/modal\/users\/?$/, () => '/users'],
  [/^\/modal\/(user\/.*)$/, (rest) => `/${rest}`],
];

/** The canonical path for `path` (which may carry a query string or hash), or `path` itself when it is not a legacy one */
export function redirectLegacyPath(path: string): string {
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const suffix = rest.join('');
  for (const [pattern, replacement] of LEGACY) {
    const match = pattern.exec(pathname);
    if (match) return `${replacement(...match.slice(1))}${suffix}`;
  }
  return path;
}
