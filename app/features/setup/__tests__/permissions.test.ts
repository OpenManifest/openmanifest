import { Permission } from 'app/api/schema.d';
import {
  matrixFits,
  MATRIX_COLUMN_MIN_WIDTH,
  MATRIX_LABEL_WIDTH,
  PERMISSION_GROUPS,
  withPermission,
} from '../permissions';

describe('the permission groups', () => {
  it('hold every permission of the schema exactly once', () => {
    const grouped = PERMISSION_GROUPS.flatMap((group) => group.permissions);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...Object.values(Permission)].sort());
  });

  it('start with the acting permissions, as the access list does', () => {
    expect(PERMISSION_GROUPS[0].key).toBe('acting');
    expect(PERMISSION_GROUPS[0].permissions).toContain(Permission.ActAsPilot);
  });
});

describe('switching a permission of a role', () => {
  it('adds it once and removes it', () => {
    expect(withPermission(['readLoad'], 'createSlot', true)).toEqual(['readLoad', 'createSlot']);
    expect(withPermission(['readLoad', 'createSlot'], 'createSlot', true)).toEqual([
      'readLoad',
      'createSlot',
    ]);
    expect(withPermission(['readLoad', 'createSlot'], 'readLoad', false)).toEqual(['createSlot']);
    expect(withPermission([], 'readLoad', false)).toEqual([]);
  });
});

describe('the matrix', () => {
  it('fits when every role has its narrowest column beside the names', () => {
    const needed = MATRIX_LABEL_WIDTH + 11 * MATRIX_COLUMN_MIN_WIDTH;
    expect(matrixFits(needed, 11)).toBe(true);
    expect(matrixFits(needed - 1, 11)).toBe(false);
    expect(matrixFits(0, 0)).toBe(false);
  });
});
