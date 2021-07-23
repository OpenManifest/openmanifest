import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Avatar, Paragraph } from 'react-native-paper';
import { successColor } from '../../constants/Colors';
import WizardScreen, { IWizardScreenProps } from './WizardScreen';

interface IWizardCompleteStep extends IWizardScreenProps {
  subtitle?: string;
}

function WizardCompleteStep(props: IWizardCompleteStep) {
  const { title, subtitle, ...rest } = props;
  return (
    <WizardScreen style={styles.container} {...rest}>
      <View style={styles.content}>
        <Avatar.Icon icon="check" size={150} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        <Paragraph style={styles.subtitle}>{subtitle}</Paragraph>
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: 'white',
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    alignSelf: 'center',
  },
  icon: {
    marginVertical: 32,
    backgroundColor: successColor,
  },
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default WizardCompleteStep;
