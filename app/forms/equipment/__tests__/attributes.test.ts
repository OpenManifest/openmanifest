import {
  attributesFor,
  formatAttribute,
  fromInputText,
  humanize,
  labelOf,
  summarize,
  toInputText,
  validateAttributes,
  type AttributeSchema,
} from '../attributes';

const schema: AttributeSchema = {
  rig_type: {
    type: 'enum',
    values: ['student', 'sport', 'tandem'],
    default: 'sport',
    operator_only: true,
  },
  canopy_size_m2: { type: 'decimal', label: 'Main canopy size', min: 0, unit: 'area' },
  pack_value: { type: 'integer', min: 0, max: 99 },
  bought_on: { type: 'date' },
  colour: { type: 'string', required: true },
};

describe('equipment attributes', () => {
  it('labels an attribute with its label, else with its name made readable', () => {
    expect(labelOf('canopy_size_m2', schema.canopy_size_m2)).toBe('Main canopy size');
    expect(labelOf('pack_value', schema.pack_value)).toBe('Pack value');
    expect(humanize('rig_type')).toBe('Rig type');
  });

  it("leaves out the attributes only the operator's own equipment has for a member's", () => {
    expect(attributesFor(schema, { operatorOwned: true }).map(([name]) => name)).toContain(
      'rig_type'
    );
    expect(attributesFor(schema, { operatorOwned: false }).map(([name]) => name)).not.toContain(
      'rig_type'
    );
  });

  describe('the text of a number with a unit', () => {
    it('shows square metres as the operator’s square feet', () => {
      expect(toInputText(schema.canopy_size_m2, 15.7935, { area: 'ft2' })).toBe('170');
      expect(toInputText(schema.canopy_size_m2, 15.7935, { area: 'm2' })).toBe('15.79');
    });

    it('turns what is typed into SI', () => {
      expect(fromInputText(schema.canopy_size_m2, '170', { area: 'ft2' })).toBeCloseTo(15.7935, 3);
      expect(fromInputText(schema.canopy_size_m2, '14,5', { area: 'm2' })).toBe(14.5);
    });

    it('is empty for nothing and for text that is not a number', () => {
      expect(fromInputText(schema.canopy_size_m2, '  ', { area: 'ft2' })).toBeNull();
      expect(fromInputText(schema.canopy_size_m2, 'big', { area: 'ft2' })).toBeNull();
      expect(toInputText(schema.canopy_size_m2, null)).toBe('');
    });

    it('rounds an integer and keeps a string as it is', () => {
      expect(fromInputText(schema.pack_value, '12.6')).toBe(13);
      expect(fromInputText(schema.colour, ' blue ')).toBe('blue');
    });
  });

  describe('showing a value', () => {
    it('writes a quantity in the operator’s unit, an enum and a date readable', () => {
      expect(formatAttribute(schema.canopy_size_m2, 15.7935, { area: 'ft2' })).toBe('170 ft²');
      expect(formatAttribute(schema.rig_type, 'tandem')).toBe('Tandem');
      expect(formatAttribute(schema.bought_on, '2026-03-04')).toBe('4 Mar 2026');
      expect(formatAttribute(schema.colour, null)).toBe('-');
    });

    it('summarises the values the item has', () => {
      expect(
        summarize(
          schema,
          { rig_type: 'sport', canopy_size_m2: 15.7935 },
          { operatorOwned: true, units: { area: 'ft2' } }
        )
      ).toBe('Rig type: Sport · Main canopy size: 170 ft²');
      expect(
        summarize(
          schema,
          { rig_type: 'sport', canopy_size_m2: 15.7935 },
          { operatorOwned: false, units: { area: 'ft2' } }
        )
      ).toBe('Main canopy size: 170 ft²');
    });
  });

  describe('validating', () => {
    it('asks for what is required', () => {
      expect(validateAttributes(schema, {}, { operatorOwned: true })).toEqual({
        colour: 'Colour is required',
      });
    });

    it('holds numbers to their bounds and enums to their values', () => {
      expect(
        validateAttributes(
          schema,
          { colour: 'red', pack_value: 100, canopy_size_m2: -1, rig_type: 'glider' },
          { operatorOwned: true }
        )
      ).toEqual({
        pack_value: 'Pack value must be at most 99',
        canopy_size_m2: 'Main canopy size must be at least 0',
        rig_type: 'Rig type must be one of student, sport, tandem',
      });
    });

    it('does not look at what a member’s own item does not have', () => {
      expect(
        validateAttributes(schema, { colour: 'red', rig_type: 'glider' }, { operatorOwned: false })
      ).toEqual({});
    });
  });
});
