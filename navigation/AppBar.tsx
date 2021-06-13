import * as React from "react";
import { Appbar, Menu, IconButton, Divider, Chip } from "react-native-paper";
import { StackHeaderProps } from "@react-navigation/stack";
import { gql, useLazyQuery } from "@apollo/client";
import { Query } from "../graphql/schema";
import { actions, useAppDispatch, useAppSelector } from "../redux";
import { StyleSheet } from "react-native";
import SetupWarning from "./SetupWarning";

const QUERY_CURRENT_USER = gql`
  query QueryDropzone($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      isCreditSystemEnabled

      currentUser {
        id
        credits
        expiresAt
        
        rigInspections {
          id
          rig {
            id
            repackExpiresAt
          }
        }

        user {
          id
          name
          exitWeight
          email
          phone
          rigs {
            id
            model
            make
            serial
            canopySize
            repackExpiresAt
          }
          jumpTypes {
            id
            name
          }
          license {
            id
            name
          }
        }
      }
    }
  }
`;


interface IAppBarProps extends StackHeaderProps {
  hideWarnings?: boolean;
}


function AppBar(props: IAppBarProps) {
  const { navigation, previous, scene, hideWarnings } = props;
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const { currentDropzone } = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();
  const [loadData, { data, loading }] = useLazyQuery<Query>(QUERY_CURRENT_USER, {
    variables: {
      dropzoneId: Number(currentDropzone?.id)
    }
  });

  React.useEffect(() => {
    if (currentDropzone) {
      loadData();
    }
  }, [loadData, currentDropzone])
  
  const showCredits = !!data?.dropzone?.isCreditSystemEnabled;

  return (
    <>
    <Appbar.Header>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={scene.descriptor.options.title} titleStyle={{ fontWeight: "bold" }} />

      { scene.descriptor.options.headerRight
        ? scene.descriptor.options.headerRight({ tintColor: "white" })
        : (
          <Chip mode="outlined">
            {`$${data?.dropzone?.currentUser?.credits || 0}`}
          </Chip>
        )}
      <Menu
        onDismiss={() => setContextMenuOpen(false)}
        visible={contextMenuOpen}
        anchor={
          <IconButton
            icon="dots-vertical"
            color="#FFFFFF"
            onPress={() => setContextMenuOpen(true)}
          />
      }>
        <Menu.Item
          title="Change dropzone"
          icon="radar"
          onPress={() => {
            navigation.replace("DropzonesScreen");
            setContextMenuOpen(false);
          }}
        />
        <Divider />
        <Menu.Item
          title="Log out"
          icon="logout"
          onPress={() => {
            dispatch(actions.global.logout());
            setContextMenuOpen(false);
          }}
        />
      </Menu>
    </Appbar.Header>
    { hideWarnings ? null : (
      <SetupWarning
        credits={data?.dropzone?.currentUser?.credits || 0}
        loading={loading}
        isCreditSystemEnabled={!!data?.dropzone?.isCreditSystemEnabled}
        isExitWeightDefined={!!data?.dropzone?.currentUser?.user?.exitWeight}
        isMembershipInDate={!!data?.dropzone?.currentUser?.expiresAt && data?.dropzone?.currentUser?.expiresAt > (new Date().getTime() / 1000)}
        isReserveInDate={
          !!data?.dropzone?.currentUser?.user?.rigs?.some((rig) => {
            const isRigInspected = data.dropzone?.currentUser?.rigInspections?.map((inspection) => inspection?.rig?.id === rig.id);
            const isRepackInDate = (rig.repackExpiresAt || 0) > (new Date().getTime() / 1000);
            return isRigInspected && isRepackInDate;
          })
        }
        isRigInspectionComplete={!!data?.dropzone?.currentUser?.rigInspections?.length}
        isRigSetUp={!!data?.dropzone?.currentUser?.user?.rigs?.length}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    width: "100%",
    backgroundColor: "#ffbb33",
    justifyContent: "space-between",
    paddingHorizontal: 32
  },
})

export default AppBar;