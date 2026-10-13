import { options } from '../linking';
import { redirectLegacyPath } from '../legacyPaths';

jest.mock('expo-linking', () => ({ createURL: (path: string) => `exp://localhost${path}` }));

describe('redirectLegacyPath', () => {
  it.each([
    ['/manifest/users', '/users'],
    ['/manifest/users/12', '/user/12'],
    ['/manifest/users/12/equipment/', '/user/12/equipment'],
    ['/manifest/users/12/orders', '/user/12/transactions'],
    ['/manifest/users/12/orders/7/receipts', '/user/12/transactions/7/receipt'],
    ['/manifest/users/12/rig/5/inspection', '/user/12/equipment-inspection/5'],
    ['/configuration/rigs', '/configuration/equipment'],
    ['/configuration/rig-inspection', '/configuration/equipment-inspection'],
    ['/user/12/rig-inspection/5', '/user/12/equipment-inspection/5'],
    ['/modal/users', '/users'],
    ['/modal/user/12', '/user/12'],
    ['/modal/user/12/equipment', '/user/12/equipment'],
    ['/modal/user/12/transactions', '/user/12/transactions'],
    ['/modal/user/12/transactions/7/receipt', '/user/12/transactions/7/receipt'],
    ['/modal/user/12/rig-inspection/5', '/user/12/equipment-inspection/5'],
    ['/manifest/users/12?tab=gear', '/user/12?tab=gear'],
  ])('sends %s to %s', (legacy, canonical) => {
    expect(redirectLegacyPath(legacy)).toBe(canonical);
  });

  it.each([
    '/manifest',
    '/users',
    '/user/12',
    '/user/12/equipment',
    '/loads/3',
    '/configuration/equipment',
  ])('leaves %s alone', (path) => {
    expect(redirectLegacyPath(path)).toBe(path);
  });
});

/** The state a path opens: the screens from the tab down to the leaf, with the leaf's params */
function leaf(path: string) {
  const state = options.getStateFromPath?.(path, options.config) as {
    routes: { name: string; params?: object; state?: unknown }[];
  };
  const names: string[] = [];
  let route = state.routes[0];
  while (route) {
    names.push(route.name);
    const next = route.state as typeof state | undefined;
    if (!next) return { names, params: route.params };
    route = next.routes[next.routes.length - 1];
  }
  return { names, params: undefined };
}

describe('the linking configuration', () => {
  const profile = { names: ['Authenticated', 'Users', 'ProfileScreen'], params: { userId: '12' } };

  it('opens a profile at its canonical path', () => {
    expect(leaf('/user/12')).toEqual(profile);
  });

  it.each(['/manifest/users/12', '/modal/user/12'])(
    'opens a profile from the old path %s',
    (path) => {
      expect(leaf(path)).toEqual(profile);
    }
  );

  it('gives the equipment inspection its equipment', () => {
    expect(leaf('/manifest/users/12/rig/5/inspection')).toEqual({
      names: ['Authenticated', 'Users', 'EquipmentInspectionScreen'],
      params: { membershipId: '12', equipmentId: '5' },
    });
  });

  it('opens the receipt of an order from every old path', () => {
    const receipt = {
      names: ['Authenticated', 'Users', 'OrderReceiptScreen'],
      params: { userId: '12', orderId: '7' },
    };
    expect(leaf('/manifest/users/12/orders/7/receipts')).toEqual(receipt);
    expect(leaf('/modal/user/12/transactions/7/receipt')).toEqual(receipt);
  });
});
