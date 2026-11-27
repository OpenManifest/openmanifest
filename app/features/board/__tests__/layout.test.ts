import { LoadState } from 'app/api/schema.d';
import { layoutOf, splitLoads } from '../layout';

describe('board layout', () => {
  it('is one column on a phone, a list beside the load on a tablet, columns on a wide window', () => {
    expect(layoutOf('compact')).toBe('list');
    expect(layoutOf('medium')).toBe('split');
    expect(layoutOf('expanded')).toBe('columns');
  });

  it('sends the finished loads to the strip and keeps the order of the rest', () => {
    const loads = [
      { id: 'a', state: LoadState.Open },
      { id: 'b', state: LoadState.Completed },
      { id: 'c', state: LoadState.Departed },
      { id: 'd', state: LoadState.Cancelled },
    ];

    const { active, over } = splitLoads(loads);

    expect(active.map(({ id }) => id)).toEqual(['a', 'c']);
    expect(over.map(({ id }) => id)).toEqual(['b', 'd']);
  });
});
