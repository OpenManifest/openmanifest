import { gql, useMutation } from '@apollo/client';
import * as React from 'react';
import { FAB, Portal } from 'react-native-paper';
import addMinutes from "date-fns/addMinutes";

import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';

import { Load, Mutation, Permission, LoadState } from '../../../graphql/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';

interface ILoadActionButtonProps {
  load: Load;
}


export const QUERY_LOAD = gql`
  query QueryLoad($id: Int!) {
    load(id: $id) {
      id
      name
      createdAt
      dispatchAt
      hasLanded
      maxSlots
      loadNumber
      isFull
      isOpen
      state,
      plane {
        id
        name
      }
      gca {
        id
        user {
          id
          name
        }
      }
      pilot {
        id
        user {
          id
          name
        }
      }
      loadMaster {
        id
        user {
          id
          name
        }
      }
      slots {
        id
        createdAt
        exitWeight
        passengerName
        passengerExitWeight
        
        dropzoneUser {
          id
          user {
            id
            name
            exitWeight
          }
        }
        ticketType {
          id
          name
          altitude
          isTandem

          extras {
            id
            name
            cost
          }
        }
        jumpType {
          id
          name
        }
        extras {
          id
          name
        }
      }
    }
  }
`;

const MUTATION_UPDATE_LOAD = gql`
  mutation UpdateLoad(
    $id: Int!,
    $pilotId: Int,
    $gcaId: Int,
    $planeId: Int,
    $isOpen: Boolean,
    $loadMasterId: Int,
    $dispatchAt: Int,
    $hasLanded: Boolean,
    $state: LoadState
  ){
    updateLoad(input: {
      id: $id
      attributes: {
        pilotId: $pilotId,
        gcaId: $gcaId,
        planeId: $planeId,
        isOpen: $isOpen,
        loadMasterId: $loadMasterId
        dispatchAt: $dispatchAt
        hasLanded: $hasLanded
        state: $state
      }
    }) {
      load {
        id
        name
        createdAt
        loadNumber
        dispatchAt
        hasLanded
        maxSlots
        isFull
        isOpen
        state
        plane {
          id
          name
        }
        gca {
          id
          user {
            id
            name
          }
        }
        pilot {
          id
          user {
            id
            name
          }
        }
        loadMaster {
          id
          user {
            id
            name
          }
        }
        slots {
          id
          createdAt
          exitWeight

          passengerName
          passengerExitWeight

          user {
            id
            name
          }
          ticketType {
            id
            name
            altitude
            isTandem
          }
          jumpType {
            id
            name
          }
          extras {
            id
            name
          }
        }
      }
    }
  }
`;


const MUTATION_DELETE_SLOT = gql`
mutation DeleteSlot($id: Int!) {
  deleteSlot(input: { id: $id }) {
    slot {
      id
      load {
        id
        slots {
          id
          createdAt
          exitWeight

          passengerName
          passengerExitWeight

          user {
            id
            name
          }
          ticketType {
            id
            name
            altitude
            isTandem
          }
          jumpType {
            id
            name
          }
          extras {
            id
            name
          }
        }  
      }
    }
  }
}
`;


export default function ActionButton(props: ILoadActionButtonProps) {
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);

  const { load } = props;
  
  const currentDropzone = useCurrentDropzone();
  const { currentUser } = currentDropzone;

  const [mutationUpdateLoad, mutation] = useMutation<Mutation>(MUTATION_UPDATE_LOAD);

  const updateCall = React.useCallback(async (minutes: number | null) => {
    const dispatchTime = !minutes ? null : addMinutes(new Date(), minutes).getTime() / 1000;

    try {
      await mutationUpdateLoad({
        variables: {
          id: Number(load.id),
          dispatchAt: dispatchTime ? Math.ceil(dispatchTime) : null,
          state: dispatchTime ? "boarding_call" : "open"
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateLoadState = React.useCallback(async (state: LoadState) => {

    try {
      await mutationUpdateLoad({
        variables: {
          state,
          dispatchAt: null
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const onLanded = React.useCallback(async () => {
    try {
      await mutationUpdateLoad({
        variables: {
          id: Number(load.id),
          hasLanded: true,
          state: "landed"
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const onManifest = React.useCallback((load: Load) => {
    
    if (!currentUser?.hasLicense) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "You need to select a license on your user profile",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasMembership) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your membership is out of date",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasRigInspection) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your rig needs to be inspected before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasReserveInDate) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your rig needs a reserve repack",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasExitWeight) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Update your exit weight on your profile before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasCredits) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "You have no credits on your account",
          variant: "warning"
        })
      );
    }

    dispatch(actions.forms.manifest.setOpen(true));
    dispatch(
      actions.forms.manifest.setField(["dropzoneUser", currentUser])
    );
    dispatch(
      actions.forms.manifest.setField(["load", load])
    );
  }, [JSON.stringify(currentUser)]);

  
  const canUpdateLoad = useRestriction(Permission.UpdateLoad);
  
  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  const isOpen = [LoadState.Open, LoadState.BoardingCall].includes(load.state);
  const isFull = (load?.slots?.length || 0) >= (load?.maxSlots || load?.plane?.maxSlots || 0);
  const showManifestButton = isOpen && !isFull && canManifestSelf && !load?.slots?.some((slot) => slot.dropzoneUser?.id === currentUser?.id);

  const showGroupIcon = (canManifestGroup || canManifestGroupWithSelfOnly) && load?.state !== LoadState.Landed && (!load?.dispatchAt || load.dispatchAt > (new Date().getTime() / 1000));

  const createCallAction = React.useCallback((minutes: number) =>
    () => {
      setExpanded(false);
      updateCall(minutes);
    }
  , [updateCall]);

  const callActions = [
    { label: '20 minute call', onPress: createCallAction(20), icon: "airplane-takeoff" },
    { label: '15 minute call', onPress: createCallAction(15), icon: "airplane-takeoff" },
    { label: '10 minute call', onPress: createCallAction(10), icon: "airplane-takeoff" },
  ];

  const manifestActions = [
    !showManifestButton ? null : {
      label: 'Manifest me',
      icon: "account",
      onPress: () => onManifest(load),
    },
    !showGroupIcon ? null : {
      label: 'Manifest group',
      icon: "account-group",
      onPress: () => {
        dispatch(actions.forms.manifestGroup.reset());
        dispatch(actions.forms.manifestGroup.setField(["load", load]));

        if (canManifestGroupWithSelfOnly && !canManifestGroup) {
          // Automatically add current user to selection
          dispatch(actions.screens.manifest.setSelected([currentUser]));
          dispatch(actions.forms.manifestGroup.setDropzoneUsers([currentUser]));
        }

        dispatch(actions.forms.manifestGroup.setOpen(true));
        dispatch(actions.forms.manifestGroup.setField(["load", load]));
      },
    },
  ].filter(Boolean);
  
  
  const workflowActions = [
    ![
      LoadState.BoardingCall,
    ].includes(load.state) ? null :{ label: "Cancel boarding call", icon: "airplane-off", onPress: createCallAction(null) },
    ![
      LoadState.Open
    ].includes(load.state) ? null :{ label: "Cancel load", icon: "delete-sweep", onPress: () => updateLoadState(LoadState.Cancelled) },
    ![
      LoadState.Cancelled
    ].includes(load.state) ? null :{ label: "Re-open load", icon: "undo", onPress: () => updateLoadState(LoadState.Open) },
    ![
      LoadState.BoardingCall,
      LoadState.InFlight,
    ].includes(load.state) ? null : { label: "Mark as Landed", icon: "airplane-landing", onPress: () => onLanded() },
  ].filter(Boolean);

  const buttonActions = [
    ...isOpen ? manifestActions : [],
    ...[
      LoadState.Open,
    ].includes(load?.state) ? callActions : [],
    ...workflowActions,
  ];

  return (
    <Portal>
      <FAB.Group
        visible={!!buttonActions.length}
        open={isExpanded}
        icon={isExpanded ? 'close' : 'plus'}
        fabStyle={{
          marginLeft: 16,
          marginBottom: 32,
        }}
        actions={buttonActions}
        onStateChange={({ open }) => setExpanded(open)}
      />
    </Portal>
  );
}
