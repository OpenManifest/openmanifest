import { useQuery } from '@apollo/client';
import { useIsFocused } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List, ProgressBar } from 'react-native-paper';
import { Tabs, TabScreen } from 'react-native-paper-tabs';

import { Query } from "../../../graphql/schema.d";
import { useAppSelector } from '../../../redux';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import PermissionListItem from '../../../components/permissions/PermissionListItem';


const QUERY_DROPZONE_PERMISSIONS = gql`
  query QueryDropzoneRigs(
    $dropzoneId: Int!
  ) {
    dropzone(id: $dropzoneId) {
      id
      roles {
        id
        name
        permissions
      }
    }
  }
`;

/**
 * 
 * @returns
 * 
 *  :updateDropzone,
    :deleteDropzone,

    :createLoad,
    :updateLoad,
    :deleteLoad,
    :readLoad,

    :createSlot,
    :updateSlot,
    :deleteSlot,


    :createUserSlot,
    :updateUserSlot,
    :deleteUserSlot,

    :createStudentSlot,
    :updateStudentSlot,
    :deleteStudentSlot,

    :createTicketType,
    :updateTicketType,
    :deleteTicketType,

    :createExtra,
    :updateExtra,
    :deleteExtra,
    :readExtra,

    :createPlane,
    :updatePlane,
    :deletePlane,

    :createRig,
    :updateRig,
    :deleteRig,
    :readRig,

    :createDropzoneRig,
    :updateDropzoneRig,
    :deleteDropzoneRig,

    :readPermissions,
    :updatePermissions,

    :createPackjob,
    :updatePackjob,
    :deletePackjob,
    :readPackjob,

    :createFormTemplate,
    :updateFormTemplate,
    :deleteFormTemplate,
    :readFormTemplate,

    :readUser,
    :updateUser,
    :deleteUser,
    :createUser,

    :actAsPilot,
    :actAsLoadMaster,
    :actAsGCA,
    :actAsDZSO,
    :actAsRigInspector,

    :createUserTransaction,
    :readUserTransactions,
 */
export default function DropzonePermissionScreen() {
  const state = useAppSelector(state => state.global);
  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE_PERMISSIONS, {
    variables: {
      dropzoneId: Number(state.currentDropzoneId),
    }
  });
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  return (
      loading
        ? <ProgressBar indeterminate color={state.theme.colors.accent} />
        : <Tabs defaultIndex={0} mode="scrollable">
              {
                data?.dropzone?.roles?.map((role) =>
                  <TabScreen label={role.name!} key={`permission-tab-role-${role.id}`}>
                    <ScrollableScreen>
                      
                      <List.Subheader>User Management</List.Subheader>
                      <PermissionListItem
                        role={role}
                        permissionName="readUser"
                        description="View other users' profiles"
                        title="View Users"
                      />

                      <PermissionListItem
                        role={role}
                        permissionName="updateUser"
                        description="Update other users"
                        title="Update Users"
                      />

                      <List.Section title="Manifest" style={{ width: "100%"}}>
                        <List.Accordion title="Loads">
                          <PermissionListItem
                            role={role}
                            permissionName="readLoad"
                            description="See available loads on the manifest screen"
                            title="View Load"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="createLoad"
                            title="Create Loads"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="updateLoad"
                            description="Dispatch loads, update load master, change pilot / plane, etc"
                            title="Update Loads"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="deleteLoad"
                            description="Permanently delete existing loads"
                            title="Delete Load"
                          />
                        </List.Accordion>

                        <List.Accordion title="Manifesting">
                          <PermissionListItem
                            role={role}
                            permissionName="createSlot"
                            description="Create a slot for himself/herself only"
                            title="Manifest self"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="updateSlot"
                            description="Update own slot after manifesting themselves"
                            title="Update own slot"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="deleteSlot"
                            description="Take themselves off the load"
                            title="Remove own slot"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="createUserSlot"
                            description="Manifest other users, e.g yourself + others"
                            title="Manifest other people"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="createUserSlotWithSelf"
                            description="Allow manifesting others only if the user is part of the group"
                            title="Manifest own groups"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="updateUserSlot"
                            description="Update other people's slots on a load"
                            title="Update other users slot"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="deleteUserSlot"
                            description="Delete other users' slots off a load"
                            title="Take others off the load"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="createStudentSlot"
                            description="Manifest a student on a load"
                            title="Manifest students"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="updateStudentSlot"
                            description="Make changes to an already manifested student"
                            title="Update student slots"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="deleteStudentSlot"
                            description="Take a student off the load"
                            title="Remove student slots"
                          />
                        </List.Accordion>
                      </List.Section>
                      
                      <List.Section title="Administration" style={{ width: "100%"}}>
                        <List.Accordion title="Dropzone">
                          <PermissionListItem
                            role={role}
                            permissionName="updateDropzone"
                            description="Change dropzone name, visibility, and branding"
                            title="Update Dropzone"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="deleteDropzone"
                            description="Permanently delete dropzone"
                            title="Delete Dropzone"
                          />
                        </List.Accordion>

                        <List.Accordion title="Ticket types">
                          <PermissionListItem
                            role={role}
                            permissionName="createTicketType"
                            description="Create new jump tickets"
                            title="Create Ticket"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="updateTicketType"
                            description="Make changes to existing ticket types, including prices"
                            title="Update Tickets"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="deleteTicketType"
                            description="Delete existing ticket types"
                            title="Remove Tickets"
                          />
                        </List.Accordion>

                        <List.Accordion title="Ticket addons">
                          <PermissionListItem
                            role={role}
                            permissionName="createExtra"
                            description="Set up new ticket addons"
                            title="Create Ticket addon"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="updateExtra"
                            description="Make changes to existing ticket addons, including prices"
                            title="Update Ticket addons"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="deleteExtra"
                            description="Delete existing ticket addons"
                            title="Remove Ticket addons"
                          />
                        </List.Accordion>

                        <List.Accordion title="Planes">
                          <PermissionListItem
                            role={role}
                            permissionName="createPlane"
                            description="Add new aircrafts"
                            title="Create Aircraft"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="updatePlane"
                            description="Make changes to existing aircrafts"
                            title="Update Aircraft"
                          />

                          <PermissionListItem
                            role={role}
                            permissionName="deletePlane"
                            description="Remove existing aircrafts"
                            title="Remove Aircraft"
                          />
                        </List.Accordion>
                        
                        <List.Accordion title="Rigs">
                          <PermissionListItem
                            role={role}
                            permissionName="createDropzoneRig"
                            description="Create dropzone managed rigs, e.g tandem and student rigs"
                            title="Create Rig"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="updateDropzoneRig"
                            description="Make changes to existing student and tandem rigs"
                            title="Update Rigs"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="deleteDropzoneRig"
                            description="Delete existing student and tandem rigs"
                            title="Remove Rigs"
                          />
                          <PermissionListItem
                            role={role}
                            permissionName="updateFormTemplate"
                            description="Make changes to the rig inspection template"
                            title="Modify Rig Inspection Form"
                          />
                        </List.Accordion>
                      </List.Section>
                    </ScrollableScreen>
                  </TabScreen>
                )
              }
          </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex"
  },
  content: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});
