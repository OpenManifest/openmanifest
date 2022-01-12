import * as React from 'react';
import * as appRedux from '../../state';
import LoadCard from '../../screens/authenticated/manifest/LoadCard/Large/Card';
import { Load, Permission } from '../../api/schema.d';
import mockQueryLoad from './__mocks__/QueryLoad.mock';
import mockQueryDropzoneUsers from './__mocks__/QueryDropzoneUsers.mock';
import mockQueryDropzone from './__mocks__/QueryDropzone.mock';
import mockQueryPlanes from './__mocks__/QueryPlane.mock';
import { fireEvent, render, waitFor } from '../../__mocks__/render';

const initialState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    currentDropzoneId: 1,
  },
} as typeof appRedux.initialState;

const chipMocks = [
  mockQueryPlanes({ dropzoneId: 1 }),
  mockQueryDropzone(),
  mockQueryDropzoneUsers(
    { dropzoneId: 1, permissions: [Permission.ActAsPilot] },
    {
      dropzone: {
        dropzoneUsers: {
          edges: [
            {
              cursor: '10',
              node: {
                id: '10',
                license: null,
                role: {
                  id: '10',
                  name: 'Manifest',
                },
                user: {
                  id: '10',
                  name: 'Pilot Man',
                },
              },
            },
          ],
        },
      },
    }
  ),
  mockQueryDropzoneUsers(
    { dropzoneId: 1, permissions: [Permission.ActAsGca] },
    {
      dropzone: {
        dropzoneUsers: {
          edges: [
            {
              cursor: '20',
              node: {
                id: '20',
                license: null,
                role: {
                  id: '10',
                  name: 'Manifest',
                },
                user: {
                  id: '20',
                  name: 'GCA Man',
                },
              },
            },
          ],
        },
      },
    }
  ),
];

describe('<LoadCard />', () => {
  /*
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
        graphql: [mockQueryLoad(), ...chipMocks],
        permissions: [Permission.ReadLoad, Permission.UpdateSlot],
        initialState,
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
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
        graphql: [mockQueryLoad({}, { load: { maxSlots: 10 } }), ...chipMocks],
        permissions: [Permission.ReadLoad, Permission.UpdateSlot],
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
        graphql: [mockQueryLoad({}, { load: { maxSlots: 4 } }), ...chipMocks],
        permissions: [Permission.ReadLoad, Permission.UpdateSlot],
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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.UpdateLoad],
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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.ReadLoad, Permission.UpdateSlot],
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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.UpdateLoad],
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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.ReadLoad],
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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.CreateSlot],
        initialState,
      }
    );

    await waitFor(async () => {
      const manifestButton = screen.getByTestId('manifest-button');
      expect(manifestButton.props.accessibilityState.disabled).toBe(false);
    });
  }); */

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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.CreateSlot],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId('title').length).toBe(1);
    });
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
        graphql: [mockQueryLoad({}, { load: { maxSlots: 10 } }), ...chipMocks],
        permissions: [Permission.CreateUserSlotWithSelf, Permission.CreateUserSlot],
        initialState,
      }
    );

    await waitFor(async () => {
      console.log(screen.toJSON());
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
        graphql: [mockQueryLoad({}), ...chipMocks],
        permissions: [Permission.CreateUserSlotWithSelf, Permission.CreateUserSlot],
        initialState,
      }
    );

    await waitFor(async () => {
      expect(screen.getByTestId('manifest-group-button')).toBeTruthy();
    });
  });
});
