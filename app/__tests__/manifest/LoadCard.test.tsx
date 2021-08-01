import * as React from 'react';
import * as appRedux from '../../state';
import LoadCard from '../../screens/authenticated/manifest/LoadCard/Large/Card';
import { Load } from '../../api/schema.d';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import { MOCK_QUERY_LOAD } from './__mocks__/QueryLoad.mock';

const initialState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    currentDropzoneId: 1,
  },
} as typeof appRedux.initialState;

describe('<LoadCard />', () => {
  it('should show X (=load.maxSlots) rows', async () => {
    const screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['readLoad', 'updateSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('slot-row').length).toBe(10);
    });
  });
  it('should show a "Show more" button if more than 5 slots on load', async () => {
    let screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['readLoad', 'updateSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('show-more').length).toBe(1);
    });

    screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 4 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({ maxSlots: 4 })],
        permissions: ['readLoad', 'updateSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('show-more').length).toBe(0);
    });
  });
  it('should show a "Dispath" button if "updateLoad" permission granted', async () => {
    let screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['updateLoad'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('dispatch-button').length).toBe(1);
    });

    screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['readLoad', 'updateSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('dispatch-button').length).toBe(0);
    });
  });
  it('should show X options for dispatching a load', async () => {
    const screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['updateLoad'],
        initialState,
      }
    );

    await waitFor(async () => {
      const dispatchButton = await screen.findByTestId('dispatch-button');
      await fireEvent.press(dispatchButton);
      expect(screen.queryAllByTestId('dispatch-call').length).toBe(3);
    });
  });

  it('should show "Manifest" button if createSlot granted', async () => {
    let screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['readLoad'],
        initialState,
      }
    );

    await waitFor(async () => {
      const manifestButton = screen.getByTestId('manifest-button');
      expect(manifestButton.props.accessibilityState.disabled).toBe(true);
    });

    screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['createSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      const manifestButton = screen.getByTestId('manifest-button');
      expect(manifestButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  it('should show "Manifest Group" if createUserSlot/createUserSlotWithSelf granted', async () => {
    let screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['createSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('manifest-group-button').length).toBe(0);
    });

    screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['createUserSlot'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.getByTestId('manifest-group-button')).toBeTruthy();
    });

    screen = render(
      <LoadCard
        load={{ id: '1', maxSlots: 10 } as Load}
        onManifest={() => null}
        controlsVisible
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
      />,
      {
        graphql: [MOCK_QUERY_LOAD({})],
        permissions: ['createUserSlotWithSelf'],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.getByTestId('manifest-group-button')).toBeTruthy();
    });
  });
});
