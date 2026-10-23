import {
  RIG_KIND,
  calculateWingLoading,
  canopySize,
  canopySizeToSquareMetres,
  findRigKind,
  isRig,
  rigAttributes,
  wingLoadingOf,
} from '../rig';

const rig = {
  equipmentKind: { key: RIG_KIND },
  attributes: { rig_type: 'student', canopy_size_m2: 15.7935, pack_value: 12 },
};
const wetsuit = { equipmentKind: { key: 'wetsuit' }, attributes: {} };

describe('skydiving rigs', () => {
  it('knows a rig by the key of its kind', () => {
    expect(isRig(rig)).toBe(true);
    expect(isRig(wetsuit)).toBe(false);
    expect(isRig(null)).toBe(false);
    expect(findRigKind([{ key: 'wetsuit' }, { key: 'rig', id: '3' }])).toEqual({
      key: 'rig',
      id: '3',
    });
    expect(findRigKind([{ key: 'wetsuit' }])).toBeUndefined();
  });

  it('reads the attributes of a rig', () => {
    expect(rigAttributes(rig)).toEqual({
      rig_type: 'student',
      canopy_size_m2: 15.7935,
      pack_value: 12,
    });
    expect(rigAttributes(null)).toEqual({});
  });

  it('shows the canopy size in the operator’s area unit, square feet for a skydiver', () => {
    expect(canopySize(rig, { area: 'ft2' })).toBe(170);
    expect(canopySize(rig, { area: 'm2' })).toBe(16);
    expect(canopySize(wetsuit, { area: 'ft2' })).toBeNull();
  });

  it('turns a canopy size typed in square feet into square metres', () => {
    expect(canopySizeToSquareMetres(170, { area: 'ft2' })).toBeCloseTo(15.7935, 4);
    expect(canopySizeToSquareMetres(15.79, { area: 'm2' })).toBe(15.79);
  });

  it('calculates the wing loading in pounds per square foot', () => {
    expect(calculateWingLoading(80, 15.7935)).toBe('1.04');
    expect(wingLoadingOf(rig, 80)).toBe('1.04');
    expect(wingLoadingOf(rig, null)).toBeNull();
    expect(wingLoadingOf(wetsuit, 80)).toBeNull();
  });
});
