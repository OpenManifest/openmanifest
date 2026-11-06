import type { Person } from 'app/features/people/people';

export const rule = (code: string, ok: boolean, status: string, message: string | null = null) => ({
  __typename: 'EligibilityResult' as const,
  code,
  ok,
  status,
  message,
  problem: null,
  bypassed: false,
  expiresAt: null,
  amountCents: null,
});

type Options = {
  role?: string | null;
  licence?: string | null;
  creditsCents?: number;
  rules?: ReturnType<typeof rule>[];
  lastDate?: string | null;
  email?: string;
};

/** A membership as the People query returns it, with every field of its fragments */
export const personOf = (id: string, name: string, options: Options = {}) =>
  ({
    __typename: 'Membership',
    id,
    walletId: `w${id}`,
    expiresAt: null,
    hasCredits: true,
    hasMembership: true,
    hasCertificationLevel: options.licence !== null,
    hasBodyMassKg: true,
    creditsCents: options.creditsCents ?? 40000,
    role:
      options.role === null
        ? null
        : {
            __typename: 'UserRole',
            id: options.role === 'student' ? '2' : '1',
            name: options.role ?? 'fun_jumper',
            operatorId: 1,
          },
    certificationLevel:
      options.licence === null
        ? null
        : {
            __typename: 'CertificationLevel',
            id: `cl${id}`,
            name: options.licence ?? 'Certificate A',
            rank: 20,
            equivalenceKey: 'a',
          },
    user: {
      __typename: 'User',
      id: `u${id}`,
      name,
      nickname: null,
      phone: null,
      email: options.email ?? `${name.split(' ')[0].toLowerCase()}@example.com`,
      bodyMassKg: 80,
      dateOfBirth: null,
      moderationRole: 'user',
      image: null,
    },
    eligibility: {
      __typename: 'MembershipEligibility',
      ready: !(options.rules ?? []).some((each) => !each.ok),
      rules: options.rules ?? [rule('credits', true, 'PASS')],
    },
    lastSlot: options.lastDate
      ? {
          __typename: 'Slot',
          id: `s${id}`,
          load: { __typename: 'Load', id: `l${id}`, loadDate: options.lastDate },
        }
      : null,
  }) as unknown as Person;

export const jo = () => personOf('5', 'Jo Jumper', { lastDate: '2026-10-01' });
export const stu = () =>
  personOf('7', 'Stu Student', {
    role: 'student',
    licence: 'Student',
    creditsCents: -2000,
    rules: [rule('credits', false, 'FAIL', 'Not enough credits to manifest for this jump')],
  });
