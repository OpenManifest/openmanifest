import type { CertificationLevelDetailsFragment } from 'app/api/operations';
import { rankOptions } from '../ranks';

const level = (name: string, rank: number, bodyId: string): CertificationLevelDetailsFragment => ({
  __typename: 'CertificationLevel',
  id: `${bodyId}-${rank}`,
  name,
  rank,
  equivalenceKey: null,
  certificationBody: {
    __typename: 'CertificationBody',
    id: bodyId,
    name: `Body ${bodyId}`,
    slug: bodyId,
    industry: 'scuba',
    verificationProvider: null,
  },
});

describe('rankOptions', () => {
  const levels = [
    level('Advanced Open Water Diver', 30, 'padi'),
    level('Open Water Diver', 20, 'padi'),
    level('Open Water Diver', 20, 'ssi'),
    level('Advanced Adventurer', 30, 'ssi'),
    level('Two Star Diver', 30, 'cmas'),
    level('No certification', 0, 'padi'),
  ];

  it('offers each rank of the accepted bodies once, lowest first, named by their levels', () => {
    expect(rankOptions(levels, ['padi', 'ssi'])).toEqual([
      { value: '20', label: 'Open Water Diver' },
      { value: '30', label: 'Advanced Open Water Diver / Advanced Adventurer' },
    ]);
  });

  it('offers nothing when the operator accepts no body', () => {
    expect(rankOptions(levels, [])).toEqual([]);
  });
});
