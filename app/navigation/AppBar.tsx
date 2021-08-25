import * as React from 'react';
import { Appbar, IconButton, Chip } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { gql, useLazyQuery } from '@apollo/client';
import { DrawerActions } from '@react-navigation/native';
import { Query } from '../api/schema';
import { actions, useAppDispatch, useAppSelector } from '../state';
import SetupWarning from './SetupWarning';

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
            name
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
  const { currentDropzoneId, palette, theme } = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const [loadData, { data, loading }] = useLazyQuery<Query>(QUERY_CURRENT_USER, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
    },
  });

  React.useEffect(() => {
    if (currentDropzoneId) {
      loadData();
    }
  }, [loadData, currentDropzoneId]);

  return (
    <>
      <Appbar.Header
        style={{ backgroundColor: theme.dark ? theme.colors.background : theme.colors.surface }}
      >
        {previous ? (
          <Appbar.BackAction
            onPress={navigation.goBack}
            color={theme.dark ? palette.primary.dark : palette.primary.main}
          />
        ) : (
          <IconButton
            color={theme.dark ? palette.primary.dark : palette.primary.main}
            icon="menu"
            size={32}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          />
        )}
        <Appbar.Content
          title={scene.descriptor.options.title}
          titleStyle={{ fontWeight: 'bold', color: palette.primary.dark }}
        />

        {scene.descriptor.options.headerRight ? (
          scene.descriptor.options.headerRight({ tintColor: 'white' })
        ) : (
          <Chip
            style={{ backgroundColor: palette.accent.main }}
            mode="flat"
            textStyle={{ color: palette.surface }}
          >{`$${data?.dropzone?.currentUser?.credits || 0}`}</Chip>
        )}
      </Appbar.Header>
      {hideWarnings ? null : (
        <SetupWarning
          credits={data?.dropzone?.currentUser?.credits || 0}
          loading={loading}
          isCreditSystemEnabled={!!data?.dropzone?.isCreditSystemEnabled}
          isExitWeightDefined={!!data?.dropzone?.currentUser?.user?.exitWeight}
          isMembershipInDate={
            !!data?.dropzone?.currentUser?.expiresAt &&
            data?.dropzone?.currentUser?.expiresAt > new Date().getTime() / 1000
          }
          isReserveInDate={
            !!data?.dropzone?.currentUser?.user?.rigs?.some((rig) => {
              const isRigInspected = data.dropzone?.currentUser?.rigInspections?.map(
                (inspection) => inspection?.rig?.id === rig.id
              );
              const isRepackInDate = (rig.repackExpiresAt || 0) > new Date().getTime() / 1000;
              return isRigInspected && isRepackInDate;
            })
          }
          isRigInspectionComplete={!!data?.dropzone?.currentUser?.rigInspections?.length}
          isRigSetUp={!!data?.dropzone?.currentUser?.user?.rigs?.length}
          onSetupWizard={() => {
            const currentUser = data?.dropzone?.currentUser;

            if (currentUser) {
              dispatch(actions.forms.user.setOpen(currentUser.user));
              if (currentUser?.user?.rigs?.length) {
                dispatch(actions.forms.rig.setOpen(currentUser.user.rigs[0]));
              }

              dispatch(actions.forms.userWizard.setOpen(currentUser.user));
            }
          }}
        />
      )}
    </>
  );
}

export default AppBar;
