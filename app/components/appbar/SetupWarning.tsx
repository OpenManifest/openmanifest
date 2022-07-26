import * as React from 'react';
import { Paragraph, useTheme, IconButton } from 'react-native-paper';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Color from 'color';
import { useNavigation } from '@react-navigation/core';
import { useDropzoneContext } from 'app/api/crud/useDropzone';

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
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const textColor =
    Color(theme.colors.primary).contrast(Color(theme.colors.onSurface)) < 11
      ? theme.colors.surface
      : theme.colors.onSurface;
  return (
    <View style={[styles.warning, { backgroundColor: theme.colors.primary }]}>
      <Paragraph
        style={{ width: action ? width - 56 : width, color: textColor, flexGrow: 1 }}
        adjustsFontSizeToFit
        allowFontScaling
      >
        {title}
      </Paragraph>
      {!action ? null : (
        <View style={{ width: 40 }}>
          <IconButton icon="launch" color={textColor} onPress={action} style={{ width: 24 }} />
        </View>
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
  const { currentUser } = useDropzoneContext();

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
            screen: 'LeftDrawer',
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
    paddingHorizontal: 16,
  },
});
