import { Industry } from 'app/api/schema.d';
import {
  centsOf,
  currencyChoices,
  groupIndustries,
  groupOf,
  initialValues,
  operatorAttributes,
  stepOfField,
  stepsFor,
  unitQuantitiesOf,
  validateStep,
  withIndustry,
  type IndustryTemplate,
} from '../wizard';

function template(overrides: Partial<IndustryTemplate>): IndustryTemplate {
  return {
    __typename: 'IndustryTemplate',
    slug: Industry.Generic,
    name: 'Other',
    description: 'Anything',
    icon: 'format-list-bulleted',
    base: null,
    modules: ['destinations'],
    units: { distance: 'km', mass: 'kg' },
    vehicleKinds: ['vehicle'],
    presetSummary: {
      __typename: 'IndustryPresetSummary',
      roles: ['Customer', 'Owner'],
      crewRoles: [],
      ticketTypes: [],
      extras: [],
      destinations: [],
      equipmentKinds: [],
      activityTypes: 0,
    },
    ...overrides,
  };
}

const skydiving = template({
  slug: Industry.Skydiving,
  name: 'Skydiving',
  base: '_aviation',
  modules: ['certifications', 'equipment'],
  units: { altitude: 'ft', mass: 'kg', speed: 'kn' },
});
const generic = template({});

describe('operator wizard logic', () => {
  it('groups templates by their family, other last, leaving empty groups out', () => {
    expect(groupOf(skydiving)).toBe('air');
    expect(groupOf({ base: '_water' })).toBe('water');
    expect(groupOf({ base: '_ground' })).toBe('land');
    expect(groupOf(generic)).toBe('other');
    expect(groupIndustries([generic, skydiving]).map(({ group }) => group)).toEqual([
      'air',
      'other',
    ]);
  });

  it('asks for certification bodies only when the template has certifications', () => {
    expect(stepsFor(skydiving)).toContain('certifications');
    expect(stepsFor(generic)).not.toContain('certifications');
    expect(stepsFor(generic)).toEqual([
      'industry',
      'name',
      'location',
      'money',
      'branding',
      'review',
      'done',
    ]);
    expect(stepsFor(null)[0]).toBe('industry');
  });

  it('starts with a valid time zone and currency and the brand colour', () => {
    const values = initialValues();
    expect(validateStep('location', values)).toEqual({});
    expect(validateStep('money', values)).toEqual({});
    expect(validateStep('branding', values)).toEqual({});
    expect(validateStep('industry', values)).toEqual({ industry: 'industryRequired' });
    expect(validateStep('name', values)).toEqual({ name: 'nameRequired' });
  });

  it('takes the units of the template picked and drops the bodies of another one', () => {
    const picked = withIndustry(
      { ...initialValues(), certificationBodies: [{ id: '1' } as never] },
      skydiving
    );
    expect(picked.industry).toBe(Industry.Skydiving);
    expect(picked.units).toEqual({ altitude: 'ft', mass: 'kg', speed: 'kn' });
    expect(picked.certificationBodies).toEqual([]);
    expect(withIndustry(picked, skydiving)).toBe(picked);
    expect(unitQuantitiesOf(skydiving.units)).toEqual(['altitude', 'mass', 'speed']);
  });

  it('refuses a time zone that does not exist and a vehicle without seats', () => {
    const values = initialValues();
    expect(validateStep('location', { ...values, timeZone: 'Mars/Olympus' })).toEqual({
      timeZone: 'timeZoneInvalid',
    });
    expect(validateStep('review', { ...values, vehicleName: 'Bus 1' })).toEqual({
      vehicleRegistration: 'registrationRequired',
      vehicleCapacity: 'capacityRequired',
    });
    expect(
      validateStep('review', {
        ...values,
        vehicleName: 'Bus 1',
        vehicleRegistration: 'B1',
        vehicleCapacity: 12,
      })
    ).toEqual({});
    expect(validateStep('review', { ...values, vehicleName: 'Bus 1', vehicleId: '5' })).toEqual({});
    expect(validateStep('certifications', values)).toEqual({
      certificationBodies: 'bodiesRequired',
    });
  });

  it('sends the bodies only for a template with certifications, and the logo only when there is one', () => {
    const values = {
      ...initialValues(),
      name: ' Harbour ',
      timeZone: 'Pacific/Auckland',
      currency: 'NZD',
      units: { mass: 'lb' },
      certificationBodies: [{ id: '3' } as never],
    };
    expect(operatorAttributes(values, generic)).toEqual({
      name: 'Harbour',
      timeZone: 'Pacific/Auckland',
      lat: null,
      lng: null,
      currency: 'NZD',
      units: { mass: 'lb' },
      certificationBodyIds: [],
      primaryColor: values.primaryColor,
    });
    expect(
      operatorAttributes({ ...values, banner: 'data:image/png;base64,x' }, skydiving)
    ).toMatchObject({ certificationBodyIds: [3], banner: 'data:image/png;base64,x' });
  });

  it('maps server fields to their step, prices to cents, and offers the device currency', () => {
    expect(stepOfField('certificationBodyIds')).toBe('certifications');
    expect(stepOfField('timeZone')).toBe('location');
    expect(stepOfField('unknown')).toBeUndefined();
    expect(centsOf(12.5)).toBe(1250);
    expect(centsOf(null)).toBe(0);
    expect(currencyChoices('AUD')[0]).toBe('AUD');
    expect(currencyChoices('ISK')[0]).toBe('ISK');
  });
});
