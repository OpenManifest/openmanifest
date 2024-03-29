import * as React from 'react';
import { Appbar, IconButton, Chip } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/core';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import SetupWarning from './SetupWarning';

interface IAppBarProps extends StackHeaderProps {
  hideWarnings?: boolean;
}

function AppBar(props: IAppBarProps) {
  const { hideWarnings, back, options } = props;
  const { palette, theme } = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const {
    dropzone: { currentUser, loading, dropzone }
  } = useDropzoneContext();

  const navigation = useNavigation();
  const { openDrawer } = useNavigation<DrawerNavigationProp<never>>();
  return (
    <>
      <Appbar.Header style={{ backgroundColor: theme.dark ? theme.colors.background : theme.colors.surface }}>
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
              justifyContent: 'center'
            }}
            mode="flat"
            textStyle={{
              color: palette.onSurface,
              fontFamily: 'Roboto_700Bold'
            }}
          >{`$${currentUser?.credits || 0}`}</Chip>
        )}
      </Appbar.Header>
      {hideWarnings ? null : (
        <SetupWarning
          credits={currentUser?.credits || 0}
          loading={loading}
          isCreditSystemEnabled={!!dropzone?.settings?.requireCredits}
          isExitWeightDefined={!!currentUser?.user?.exitWeight}
          isMembershipInDate={
            !dropzone?.settings?.requireMembership ||
            (!!currentUser?.expiresAt && currentUser?.expiresAt > new Date().getTime() / 1000)
          }
          isReserveInDate={
            !dropzone?.settings?.requireEquipment ||
            !!currentUser?.user?.rigs?.some((rig) => {
              const isRigInspected = dropzone?.currentUser?.rigInspections?.map(
                (inspection) => inspection?.rig?.id === rig.id
              );
              const isRepackInDate = (rig.repackExpiresAt || 0) > new Date().getTime() / 1000;
              return isRigInspected && isRepackInDate;
            })
          }
          isRigInspectionComplete={
            !dropzone?.settings?.requireEquipment ||
            !dropzone?.settings?.requireRigInspection ||
            !!currentUser?.rigInspections?.length
          }
          isRigSetUp={!dropzone?.settings?.requireEquipment || !!currentUser?.user?.rigs?.length}
          onSetupWizard={() => {
            console.log('opening setup wizard');
            if (currentUser) {
              navigation.navigate('Wizards', {
                screen: 'UserWizardScreen',
                params: {
                  index: undefined,
                  dropzoneUserId: currentUser.id
                }
              });
            }
          }}
        />
      )}
    </>
  );
}

export default AppBar;
