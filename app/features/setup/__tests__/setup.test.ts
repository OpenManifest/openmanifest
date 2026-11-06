import { OperatorStateEvent, OperatorState, Permission } from 'app/api/schema.d';
import { ROLE_PERMISSIONS } from 'app/test-utils/render';
import { entryOfRoute, SETUP_DETAIL_ROUTES, setupGroupsFor } from '../entries';
import {
  addCall,
  callProblem,
  moduleSwitches,
  removeCall,
  rulesIn,
  rulesInput,
  rulesOf,
  type RulesValues,
} from '../rules';
import { visibilityEvent } from '../VisibilitySwitch';

const SKYDIVING = {
  destinations: { kinds: ['altitude'], scope: 'per_slot' },
  activities: {},
  certifications: { required_by_default: true },
  equipment: { rentals: true, personal: true },
  escorts: { ratio: '1:1' },
  limits: { mass: true },
  conditions: { kind: 'winds_aloft' },
  daily_log: {},
};
const GENERIC = { destinations: { kinds: ['site'], scope: 'per_load' }, multi_vehicle: {} };

const shape = (permissions: Permission[], modules: Record<string, unknown> = SKYDIVING) =>
  setupGroupsFor({ permissions, modules }).map(
    (group) => `${group.key}: ${group.entries.map((entry) => entry.key).join(' ')}`
  );

describe('Setup groups', () => {
  it('give an owner of a dropzone everything, in three groups', () => {
    expect(shape(ROLE_PERMISSIONS.owner)).toEqual([
      'operations: vehicles destinations tickets extras equipment inspection conditions',
      'people: permissions',
      'business: branding rules money dailyLog',
    ]);
  });

  it('leave out what the operator has no module for', () => {
    expect(shape(ROLE_PERMISSIONS.owner, GENERIC)).toEqual([
      'operations: vehicles destinations tickets extras',
      'people: permissions',
      'business: branding rules money',
    ]);
  });

  it('show an entry only to those with one of its permissions, and drop a group left empty', () => {
    expect(shape([Permission.ReadUserTransactions, Permission.CreateVehicle])).toEqual([
      'operations: vehicles',
      'business: money',
    ]);
    expect(shape([])).toEqual([]);
  });

  it('find the entry of a screen, and put the conditions outside the Configuration stack', () => {
    expect(entryOfRoute('RulesScreen')?.key).toBe('rules');
    expect(entryOfRoute('SettingsMenuScreen')).toBeUndefined();
    expect(SETUP_DETAIL_ROUTES).toContain('RulesScreen');
    expect(SETUP_DETAIL_ROUTES).not.toContain('WeatherConditionsScreen');
  });
});

describe('the visibility switch', () => {
  it('asks for a review, publishes an archived operator again, and unpublishes', () => {
    expect(visibilityEvent(OperatorState.Private, true)).toBe(
      OperatorStateEvent.RequestPublication
    );
    expect(visibilityEvent(OperatorState.Archived, true)).toBe(OperatorStateEvent.Publish);
    expect(visibilityEvent(OperatorState.Public, false)).toBe(OperatorStateEvent.Unpublish);
  });
});

describe('the call schedule', () => {
  it('keeps the calls longest first when one is added', () => {
    expect(addCall([20, 10], 15)).toEqual([20, 15, 10]);
    expect(addCall([], 5)).toEqual([5]);
  });

  it('refuses a call that is not whole minutes, one that is there already, and a seventh', () => {
    expect(callProblem([20], null)).toBe('notWhole');
    expect(callProblem([20], 0)).toBe('notWhole');
    expect(callProblem([20], 2.5)).toBe('notWhole');
    expect(callProblem([20], 20)).toBe('taken');
    expect(callProblem([60, 50, 40, 30, 20, 10], 5)).toBe('full');
    expect(addCall([60, 50, 40, 30, 20, 10], 5)).toEqual([60, 50, 40, 30, 20, 10]);
    expect(callProblem([20], 25)).toBeNull();
  });

  it('takes a call away, down to none', () => {
    expect(removeCall([20, 15, 10], 15)).toEqual([20, 10]);
    expect(removeCall([10], 10)).toEqual([]);
  });
});

describe('the rules', () => {
  it('show the certification and equipment rules only with their modules', () => {
    const keys = (modules: Record<string, unknown>) =>
      rulesIn('eligibility', modules).map((rule) => rule.key);

    expect(keys(SKYDIVING)).toEqual([
      'requireCredits',
      'allowNegativeCredits',
      'requireMembership',
      'requireCertification',
      'requireEquipment',
      'requireEquipmentInspection',
      'requireEquipmentInService',
      'allowManifestBypass',
    ]);
    expect(keys(GENERIC)).toEqual([
      'requireCredits',
      'allowNegativeCredits',
      'requireMembership',
      'allowManifestBypass',
    ]);
    expect(rulesIn('booking').map((rule) => rule.key)).toEqual([
      'allowSelfManifest',
      'allowDoubleManifesting',
    ]);
  });
});

describe('the modules', () => {
  it("list the template's modules, on unless turned off, then the others the operator has on", () => {
    expect(
      moduleSwitches(['destinations', 'conditions'], {
        destinations: {},
        multi_vehicle: {},
        crew: { locked: true },
      })
    ).toEqual([
      { name: 'destinations', on: true, locked: false },
      { name: 'conditions', on: false, locked: false },
      { name: 'multi_vehicle', on: true, locked: false },
      { name: 'crew', on: true, locked: true },
    ]);
  });
});

describe('saving the rules', () => {
  const operator = {
    name: 'Skydive Jest',
    currency: 'AUD',
    callScheduleMinutes: [20, 15, 10],
    units: { altitude: 'ft', mass: 'kg', depth: 'm' },
    modules: { destinations: {}, conditions: {} },
    settings: {
      __typename: 'Settings' as const,
      allowSelfManifest: true,
      requireCredits: true,
      requireEquipmentInService: null,
      allowManifestBypass: false,
    },
  };
  const switches = moduleSwitches(['destinations', 'conditions'], operator.modules);

  it('reads the values of the page, with the neutral value for a rule that was never set', () => {
    const values = rulesOf(operator as never, switches);

    expect(values.rules.allowSelfManifest).toBe(true);
    expect(values.rules.requireEquipmentInService).toBe(true);
    expect(values.callScheduleMinutes).toEqual([20, 15, 10]);
    expect(values.units).toEqual({
      altitude: 'ft',
      distance: 'km',
      mass: 'kg',
      area: 'm2',
      speed: 'kmh',
      temperature: 'c',
    });
    expect(values.modules).toEqual({ destinations: true, conditions: true });
  });

  it('sends every setting back with the change, and only the modules that changed', () => {
    const initial = rulesOf(operator as never, switches);
    const values: RulesValues = {
      ...initial,
      rules: { ...initial.rules, allowSelfManifest: false },
      callScheduleMinutes: [],
      currency: 'NZD',
      modules: { ...initial.modules, conditions: false },
    };

    const input = rulesInput(operator as never, initial, values);

    expect(input.name).toBe('Skydive Jest');
    expect(input.currency).toBe('NZD');
    expect(input.modules).toEqual({ conditions: false });
    expect(input.settings).toMatchObject({
      allowSelfManifest: false,
      requireCredits: true,
      allowManifestBypass: false,
      requireEquipmentInService: true,
      callScheduleMinutes: [],
      units: expect.objectContaining({ altitude: 'ft', depth: 'm', mass: 'kg' }),
    });
    expect(input.settings).not.toHaveProperty('__typename');
    expect(rulesInput(operator as never, initial, initial)).not.toHaveProperty('modules');
  });
});
