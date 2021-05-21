import React from 'react';
import '@testing-library/jest-native';
import set from "lodash/set";
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import { MOCK_QUERY_DROPZONE } from "./__mocks__/QueryDropzone.mock";
import { MOCK_QUERY_ALLOWED_TICKET_TYPES } from "./__mocks__/QueryAllowedTicketTypes.mock";
import { MOCK_QUERY_ALLOWED_JUMP_TYPES } from "./__mocks__/QueryAllowedJumpTypes.mock";
import * as appRedux from "../../redux";


import ManifestScreen from "../../screens/authenticated/manifest/ManifestScreen";
import * as global from '../../redux/global';
import { MOCK_QUERY_LOAD } from './__mocks__/QueryLoad.mock';

const initialState = {
  ...appRedux.initialState,
    global: {
      ...appRedux.initialState.global,
    currentDropzone: {
      id: "1",
    },
  }
};

describe('<ManifestScreen />', () => {

  
  it('should show LoadCards for every load', async () => {
    
    const screen = render(
      <ManifestScreen />,
      {
        graphql: [
          MOCK_QUERY_DROPZONE(),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
        ],
        permissions: ["readLoad", "updateSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const loads = screen.queryAllByTestId("load-card");
      
      expect(loads.length).toBe(2);
    });
  });
  
  it('should show an empty message when no loads are available', async () => {
    const initialState = {
      ...appRedux.initialState,
      global: {
        ...appRedux.initialState.global,
        currentDropzone: {
          id: "1",
        }
      }
    };
    const screen = render(
      <ManifestScreen />,
      {
        graphql: [
          set({...MOCK_QUERY_DROPZONE()}, "result.data.dropzone.loads.edges", null),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
        ],
        permissions: ["readLoad", "updateSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const loads = screen.queryAllByTestId("load-card");
      const text = screen.queryByText(/No loads/);
      
      
      
      expect(loads.length).toBe(0);
      expect(text).toBeTruthy();
    });
  });


  it('should not be possible to manifest if Rig needs repack', async () => {
    let screen = render(
      <ManifestScreen />,
      {
        graphql: [
          MOCK_QUERY_DROPZONE({
            currentUser: {
              hasReserveInDate: false,
            }
          }),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["createSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const [manifestButton] = screen.getAllByTestId("manifest-button");
      await fireEvent.press(manifestButton);

      expect(screen.queryAllByTestId("manifest-form").length).toBe(0);
      expect(screen.queryAllByTestId("snackbar-message").length).toBe(1);
    });
  });

  it('should not be possible to manifest if membership expired', async () => {
    let screen = render(
      <ManifestScreen />,
      {
        graphql: [
          MOCK_QUERY_DROPZONE({
            currentUser: {
              hasMembership: false,
            }
          }),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["createSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const [manifestButton] = screen.getAllByTestId("manifest-button");
      await fireEvent.press(manifestButton);

      expect(screen.queryAllByTestId("manifest-form").length).toBe(0);
      expect(screen.queryAllByTestId("snackbar-message").length).toBe(1);
    });
  });
  it('should not be possible to manifest if rig not inspected', async () => {
    let screen = render(
      <ManifestScreen />,
      {
        graphql: [
          MOCK_QUERY_DROPZONE({
            currentUser: {
              hasRigInspection: false,
            }
          }),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["createSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const [manifestButton] = screen.getAllByTestId("manifest-button");
      await fireEvent.press(manifestButton);

      expect(screen.queryAllByTestId("manifest-form").length).toBe(0);
      expect(screen.queryAllByTestId("snackbar-message").length).toBe(1);
    });
  });
  it('should not be possible to manifest if no funds on account and Dropzone.useCreditSystem = true', async () => {
    let screen = render(
      <ManifestScreen />,
      {
        graphql: [
          MOCK_QUERY_DROPZONE({
            currentUser: {
              hasCredits: false,
            }
          }),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["createSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const [manifestButton] = screen.getAllByTestId("manifest-button");
      expect(screen.queryAllByTestId("manifest-form").length).not.toBeVisible();
      await fireEvent.press(manifestButton);
      const notifications = await screen.findAllByTestId("snackbar-message");
      expect(notifications.length).toBe(1);
      expect(screen.queryAllByTestId("manifest-form").length).not.toBeVisible();
    });
  });
  
  it('should open a bottom sheet or dialog if group manifest button is clicked', async () => {
    let screen = render(
      <ManifestScreen />,
      {
        graphql: [
          MOCK_QUERY_DROPZONE(),
          MOCK_QUERY_ALLOWED_TICKET_TYPES,
          MOCK_QUERY_ALLOWED_JUMP_TYPES,
          MOCK_QUERY_LOAD({}),
        ],
        permissions: ["createUserSlot"],
        initialState
      }
    );

    await waitFor(async () => {
      const [manifestGroupButton] = screen.getAllByTestId("manifest-group-button");
      await fireEvent.press(manifestGroupButton);

      expect(screen.queryAllByTestId("manifest-group-sheet").length).toBe(1);
    });
  });
    it('should force user to select users before proceeding to step 2', async () => {});
    it('should not be possible to de-select self if only "createUserSlotWithSelf" granted', async () => {});
    it('should not be possible to select student without "createStudentSlot" permission', async () => {});
    it('should be possible to select group members rigs', async () => {});
  
  
});