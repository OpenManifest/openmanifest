import * as React from 'react';
import { Appbar, IconButton, Chip } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/core';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import SetupWarning from './SetupWarning';

interface IAppBarProps extends StackHeaderProps {
  hideWarnings?: boolean;
}

function AppBar(props: IAppBarProps) {
  const { currentRouteName: routeName } = useAppSelector((root) => root.global);
  const { hideWarnings, back, options } = props;
  const { palette, theme } = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const { currentUser, loading, dropzone } = useCurrentDropzone();

  const navigation = useNavigation();
  console.log({ routeName });
  const { openDrawer } = useNavigation<DrawerNavigationProp<any>>();
  return (
    <>
      <Appbar.Header
        style={{ backgroundColor: theme.dark ? theme.colors.background : theme.colors.surface }}
      >
        {back ? (
          <Appbar.BackAction onPress={navigation.goBack} />
        ) : (
          <IconButton icon="menu" size={32} onPress={openDrawer} />
        )}
        <Appbar.Content title={options.title} titleStyle={{ fontWeight: 'bold' }} />

        {options.headerRight ? (
          options.headerRight({ tintColor: 'white' })
        ) : (
          <Chip
            style={{
              backgroundColor: palette.background,
              height: 36,
              padding: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            mode="flat"
            textStyle={{
              color: palette.onSurface,
              fontFamily: 'Roboto_700Bold',
            }}
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
              console.log(currentUser);
              if (currentUser?.user?.rigs?.length) {
                dispatch(actions.forms.rig.setOriginal(currentUser.user.rigs[0]));
              }

              navigation.navigate('Wizards', {
                screen: 'UserWizardScreen',
              });
            }
          }}
        />
      )}
    </>
  );
}

export default AppBar;
