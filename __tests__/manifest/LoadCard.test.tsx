import * as React from 'react';
import * as appRedux from "../../redux";
import LoadCard from '../../screens/authenticated/manifest/LoadCard';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import { MOCK_QUERY_LOAD } from './__mocks__/QueryLoad.mock';

const initialState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    currentDropzone: {
      id: "1",
    }
  }
};

describe('<LoadCard />', () => {
  it('should show X (=load.maxSlots) rows', async () => {
    const screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 10 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["readLoad", "updateSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId("slot-row").length).toBe(10);
    });
  });
  it('should show a delete bubtton if current user swipes his own row and "deleteSlot" is granted', async () => {});
  it('should show a delete bubtton if current user swipes somebody elses row only if "deleteUserSlot" is granted', async () => {});
  it('should show a "Show more" button if more than 5 slots on load', async () => {
    let screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 10 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["readLoad", "updateSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId("show-more").length).toBe(1);
    });

    screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 4 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({ maxSlots: 4 }),
        ],
        permissions: ["readLoad", "updateSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId("show-more").length).toBe(0);
    });
  });
  it('should show a "Dispath" button if "updateLoad" permission granted', async () => {
    let screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 10 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["updateLoad"],
        initialState
      }
    );

    await waitFor(async () => {
      
      expect(screen.queryAllByTestId("dispatch-button").length).toBe(1);
    });

    screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 10 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["readLoad", "updateSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      expect(screen.queryAllByTestId("dispatch-button").length).toBe(0);
    });
  });
    it('should show X options for dispatching a load', async () => {
      let screen = render(
        <LoadCard
          load={{ id: 1, maxSlots: 10 }}
          onManifest={() => null}
          onManifestGroup={() => null}
          onSlotGroupPress={() => null}
          onSlotPress={() => null}
          onSlotLongPress={() => null}
        />,
        {
          graphql: [
            MOCK_QUERY_LOAD({}),
          ],
          permissions: ["updateLoad"],
          initialState
        }
      );
  
      await waitFor(async () => {
        const dispatchButton = await screen.findByTestId("dispatch-button");
        await fireEvent.press(dispatchButton);
        expect(screen.queryAllByTestId("dispatch-call").length).toBe(3);
      });
    });
  
  it('should show "Manifest" button if createSlot granted', async () => {
    let screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 10 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["readLoad"],
        initialState
      }
    );

    await waitFor(async () => {
      const manifestButton = screen.getByTestId("manifest-button");
      expect(manifestButton.props.accessibilityState.disabled).toBe(true);
    });

    screen = render(
      <LoadCard
        load={{ id: 1, maxSlots: 10 }}
        onManifest={() => null}
        onManifestGroup={() => null}
        onSlotGroupPress={() => null}
        onSlotPress={() => null}
        onSlotLongPress={() => null}
      />,
      {
        graphql: [
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["createSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const manifestButton = screen.getByTestId("manifest-button");
      expect(manifestButton.props.accessibilityState.disabled).toBe(false);
    });
  });
    
    it('should show "Manifest Group" button if "createUserSlot" or "createUserSlotWithSelf" granted', async () => {
      let screen = render(
        <LoadCard
          load={{ id: 1, maxSlots: 10 }}
          onManifest={() => null}
          onManifestGroup={() => null}
          onSlotGroupPress={() => null}
          onSlotPress={() => null}
          onSlotLongPress={() => null}
        />,
        {
          graphql: [
            MOCK_QUERY_LOAD({}),
          ],
          permissions: ["createSlot"],
          initialState
        }
      );
  
      await waitFor(async () => {
        expect(screen.queryAllByTestId("manifest-group-button").length).toBe(0);
      });

      screen = render(
        <LoadCard
          load={{ id: 1, maxSlots: 10 }}
          onManifest={() => null}
          onManifestGroup={() => null}
          onSlotGroupPress={() => null}
          onSlotPress={() => null}
          onSlotLongPress={() => null}
        />,
        {
          graphql: [
            MOCK_QUERY_LOAD({}),
          ],
          permissions: ["createUserSlot"],
          initialState
        }
      );

      await waitFor(async () => {
        expect(screen.getByTestId("manifest-group-button")).toBeTruthy();
      });

      screen = render(
        <LoadCard
          load={{ id: 1, maxSlots: 10 }}
          onManifest={() => null}
          onManifestGroup={() => null}
          onSlotGroupPress={() => null}
          onSlotPress={() => null}
          onSlotLongPress={() => null}
        />,
        {
          graphql: [
            MOCK_QUERY_LOAD({}),
          ],
          permissions: ["createUserSlotWithSelf"],
          initialState
        }
      );

      await waitFor(async () => {
        expect(screen.getByTestId("manifest-group-button")).toBeTruthy();
      });
    });
    
  it('should show "Mark as Landed" button if Load.dispatchAt is in the past and plane has not landed', async () => {});
});