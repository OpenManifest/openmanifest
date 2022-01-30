import * as React from 'react';
import { Appbar, IconButton, Chip } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { DrawerActions } from '@react-navigation/native';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import SetupWarning from './SetupWarning';

interface IAppBarProps extends StackHeaderProps {
  hideWarnings?: boolean;
}

function AppBar(props: IAppBarProps) {
  const { navigation, hideWarnings, back, options } = props;
  const { palette, theme } = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const { currentUser, loading, dropzone } = useCurrentDropzone();

  return (
    <>
      <Appbar.Header
        style={{ backgroundColor: theme.dark ? theme.colors.background : theme.colors.surface }}
      >
        {back ? (
          <Appbar.BackAction onPress={navigation.goBack} />
        ) : (
          <IconButton
            icon="menu"
            size={32}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          />
        )}
        <Appbar.Content
          title={options.title}
          titleStyle={{ fontWeight: 'bold' }}
        />

        {options.headerRight ? (
          options.headerRight({ tintColor: 'white' })
        ) : (
          <Chip
            style={{ backgroundColor: palette.background }}
            mode="flat"
            textStyle={{ color: palette.onSurface }}
          >{`$${currentUser?.credits || 0}`}</Chip>
        )}
      </Appbar.Header>
      {hideWarnings ? null : (
        <SetupWarning
          credits={currentUser?.credits || 0}
          loading={loading}
          isCreditSystemEnabled={!!dropzone?.isCreditSystemEnabled}
          isExitWeightDefined={!!currentUser?.user?.exitWeight}
          isMembershipInDate={
            !!currentUser?.expiresAt && currentUser?.expiresAt > new Date().getTime() / 1000
          }
          isReserveInDate={
            !!currentUser?.user?.rigs?.some((rig) => {
              const isRigInspected = dropzone?.currentUser?.rigInspections?.map(
                (inspection) => inspection?.rig?.id === rig.id
              );
              const isRepackInDate = (rig.repackExpiresAt || 0) > new Date().getTime() / 1000;
              return isRigInspected && isRepackInDate;
            })
          }
          isRigInspectionComplete={!!currentUser?.rigInspections?.length}
          isRigSetUp={!!currentUser?.user?.rigs?.length}
          onSetupWizard={() => {
            console.log('opening setup wizard');
            if (currentUser) {
              dispatch(actions.forms.user.setOriginal(currentUser));
              if (currentUser?.user?.rigs?.length) {
                dispatch(actions.forms.rig.setOriginal(currentUser.user.rigs[0]));
              }

              navigation.navigate('UserSetupWizard');
            }
          }}
        />
      )}
    </>
  );
}

export default AppBar;
