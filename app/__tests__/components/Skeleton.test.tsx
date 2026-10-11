import * as React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import Skeleton from '../../components/Skeleton';

describe('<Skeleton />', () => {
  it('shows one block per layout item while loading and hides the children', () => {
    const screen = render(
      <Skeleton
        isLoading
        layout={[
          { key: 'avatar', width: 50, height: 50, borderRadius: 25 },
          { key: 'name', width: '60%', height: 12 },
          { key: 'role', width: 120, height: 12 },
        ]}
      >
        <Text>Loaded content</Text>
      </Skeleton>
    );

    expect(screen.getAllByTestId('skeleton-bone')).toHaveLength(3);
    expect(screen.queryByText('Loaded content')).toBeNull();
  });

  it('renders nested layout blocks inside their container', () => {
    const screen = render(
      <Skeleton
        isLoading
        layout={[
          {
            key: 'row',
            flexDirection: 'row',
            children: [
              { key: 'a', width: 20, height: 20 },
              { key: 'b', width: 40, height: 20 },
            ],
          },
        ]}
      />
    );

    expect(screen.getAllByTestId('skeleton-bone')).toHaveLength(2);
  });

  it('turns every child into a block when there is no layout', () => {
    const screen = render(
      <Skeleton isLoading>
        <View style={{ height: 10, width: 100 }} />
        <View style={{ height: 10, width: 80 }} />
      </Skeleton>
    );

    expect(screen.getAllByTestId('skeleton-bone')).toHaveLength(2);
  });

  it('renders the children and no blocks once loaded', () => {
    const screen = render(
      <Skeleton isLoading={false} layout={[{ key: 'box', width: '100%', height: 300 }]}>
        <Text>Loaded content</Text>
      </Skeleton>
    );

    expect(screen.getByText('Loaded content')).toBeTruthy();
    expect(screen.queryAllByTestId('skeleton-bone')).toHaveLength(0);
  });
});
