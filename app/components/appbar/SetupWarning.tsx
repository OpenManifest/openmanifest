import * as React from 'react';
import { Paragraph, useTheme, IconButton } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import Color from 'color';
import { useNavigation } from '@react-navigation/core';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';

interface ISetupWarning {
  credits: number;
  loading: boolean;
  isRigSetUp: boolean;
  isRigInspectionComplete: boolean;
  isCreditSystemEnabled: boolean;
  isExitWeightDefined: boolean;
  isReserveInDate: boolean;
  isMembershipInDate: boolean;
  onSetupWizard?(): void;
}

function Warning(props: { title: string; action?: () => void }) {
  const { action, title } = props;
  const theme = useTheme();
  const textColor =
    Color(theme.colors.primary).contrast(Color(theme.colors.onSurface)) < 11
      ? theme.colors.surface
      : theme.colors.onSurface;
  return (
    <View style={[styles.warning, { backgroundColor: theme.colors.primary }]}>
      <Paragraph
        style={{ color: textColor, flex: 7 / 10, flexGrow: 1 }}
        adjustsFontSizeToFit
        allowFontScaling
      >
        {title}
      </Paragraph>
      {!action ? null : (
        <IconButton icon="launch" color={textColor} onPress={action} style={{ width: 24 }} />
      )}
    </View>
  );
}

export default function SetupWarning(props: ISetupWarning) {
  const {
    credits,
    loading,
    isCreditSystemEnabled,
    isRigSetUp,
    isExitWeightDefined,
    isMembershipInDate,
    isReserveInDate,
    isRigInspectionComplete,
    onSetupWizard,
  } = props;
  const navigation = useNavigation();
  const { currentUser } = useCurrentDropzone();
  if (loading) {
    return null;
  }

  if (!isExitWeightDefined || !isRigSetUp) {
    const missing = [
      !isExitWeightDefined ? 'exit weight' : null,
      !isRigSetUp ? 'equipment' : null,
    ].filter(Boolean);

    return (
      <Warning
        title={`You need to define ${missing.join(' and ')} in your profile`}
        action={() => onSetupWizard?.()}
      />
    );
  }
  if (!isMembershipInDate) {
    return <Warning title="Your membership seems to be out of date" />;
  }
  if (!isRigInspectionComplete) {
    return <Warning title="Your rig must be inspected before you can manifest at this dropzone" />;
  }
  if (!isReserveInDate) {
    return (
      // eslint-disable-next-line max-len
      <Warning
        title="Your reserve repack is due. You can update the repack date on your profile"
        action={() =>
          currentUser?.id &&
          navigation.navigate('Authenticated', {
            screen: 'Drawer',
            params: {
              screen: 'Manifest',
              params: {
                screen: 'User',
                params: { screen: 'EquipmentScreen', params: { userId: currentUser.id } },
              },
            },
          })
        }
      />
    );
  }
  if (isCreditSystemEnabled && !credits && !loading) {
    return <Warning title="You'll need to top up on credits before you can manifest" />;
  }

  return null;
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
});
