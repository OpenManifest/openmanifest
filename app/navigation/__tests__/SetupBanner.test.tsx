import { renderHook } from '@testing-library/react-native';
import { useSetupNotice } from '../SetupBanner';

type Member = {
  creditsCents: number;
  expiresAt: number | null;
  rigInspections: unknown[];
  user: { bodyMassKg: number; rigs: { repackExpiresAt: number }[] };
};
const day = 24 * 3600;
const now = () => Math.floor(Date.now() / 1000);

const mockState: { settings: Record<string, boolean>; currentUser: unknown; loading: boolean } = {
  settings: {},
  currentUser: null,
  loading: false,
};
jest.mock('app/providers/operator/context', () => ({
  useOperatorContext: () => ({
    operator: {
      loading: mockState.loading,
      operator: { settings: mockState.settings },
      currentUser: mockState.currentUser,
    },
  }),
}));

const member = (over: Partial<Member> = {}): Member => ({
  creditsCents: 5000,
  expiresAt: now() + day,
  rigInspections: [{}],
  user: { bodyMassKg: 80, rigs: [{ repackExpiresAt: now() + day }] },
  ...over,
});
const notice = async () => (await renderHook(() => useSetupNotice())).result.current?.key ?? null;

describe('useSetupNotice', () => {
  beforeEach(() => {
    mockState.settings = {};
    mockState.loading = false;
    mockState.currentUser = member();
  });

  it('is silent for a member who is set up', async () => {
    mockState.settings = {
      requireEquipment: true,
      requireMembership: true,
      requireRigInspection: true,
      requireCredits: true,
    };
    expect(await notice()).toBeNull();
  });

  it('is silent while loading or without a membership', async () => {
    mockState.loading = true;
    mockState.currentUser = member({ user: { bodyMassKg: 0, rigs: [] } });
    expect(await notice()).toBeNull();
    mockState.loading = false;
    mockState.currentUser = null;
    expect(await notice()).toBeNull();
  });

  it('asks for the exit weight', async () => {
    mockState.currentUser = member({ user: { bodyMassKg: 0, rigs: [] } });
    expect(await notice()).toBe('setup.profileMass');
  });

  it('asks for the equipment when the operator requires it', async () => {
    mockState.settings = { requireEquipment: true };
    mockState.currentUser = member({ user: { bodyMassKg: 80, rigs: [] } });
    expect(await notice()).toBe('setup.profileEquipment');
    mockState.currentUser = member({ user: { bodyMassKg: 0, rigs: [] } });
    expect(await notice()).toBe('setup.profileBoth');
  });

  it('reports an expired membership', async () => {
    mockState.settings = { requireMembership: true };
    mockState.currentUser = member({ expiresAt: now() - day });
    expect(await notice()).toBe('setup.membership');
  });

  it('reports a missing inspection, an overdue repack and missing credits, in that order', async () => {
    mockState.settings = {
      requireEquipment: true,
      requireRigInspection: true,
      requireCredits: true,
    };
    mockState.currentUser = member({ rigInspections: [], creditsCents: 0 });
    expect(await notice()).toBe('setup.inspection');
    mockState.currentUser = member({
      creditsCents: 0,
      user: { bodyMassKg: 80, rigs: [{ repackExpiresAt: now() - day }] },
    });
    expect(await notice()).toBe('setup.repack');
    mockState.currentUser = member({ creditsCents: 0 });
    expect(await notice()).toBe('setup.credits');
  });
});
