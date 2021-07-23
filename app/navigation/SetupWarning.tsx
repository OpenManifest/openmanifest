import * as React from 'react';
import { Paragraph, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.warning}>
      <Paragraph style={{ color: 'white', flex: 7 / 10, flexGrow: 2 }}>{title}</Paragraph>
      {!action ? null : (
        <Button onPress={action} style={{ flex: 1 / 10, flexShrink: 1 }}>
          Fix
        </Button>
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
      <Warning title="Your reserve repack is due. You cannot manifest if your repack is out of date." />
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
