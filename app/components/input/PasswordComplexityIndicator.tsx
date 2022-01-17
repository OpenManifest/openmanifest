import { errorColor, successColor, warningColor } from 'app/constants/Colors';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PasswordStrength } from '../../utils/checkPasswordComplexity';

interface IPasswordComplexityIndicatorProps {
  strength: PasswordStrength;
}
function PasswordStep(props: IPasswordComplexityIndicatorProps) {
  const { strength } = props;

  const indicatorStyle = [styles.indicatorWeak, styles.indicatorOk, styles.indicatorStrong];

  return (
    <>
      <Text style={styles.title}>{['Too weak', 'Weak', 'Acceptable', 'Strong'][strength]}</Text>
      <View style={styles.indicator}>
        <View style={indicatorStyle[strength]} />
        {strength < PasswordStrength.Acceptable ? (
          <View style={[styles.indicatorInactive, { flex: 1 / 3 }]} />
        ) : null}
        {[PasswordStrength.Weak, PasswordStrength.Acceptable].includes(strength) ? (
          <View
            style={[
              styles.indicatorInactive,
              { flex: strength < PasswordStrength.Acceptable ? 1 / 3 : 1 / 2 },
            ]}
          />
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginLeft: 4,
    marginTop: 8,
  },
  indicator: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  indicatorInactive: {
    backgroundColor: '#AAA',
  },
  indicatorWeak: {
    flex: 1 / 3,
    backgroundColor: errorColor,
  },
  indicatorOk: {
    flex: 2 / 3,
    backgroundColor: warningColor,
  },
  indicatorStrong: {
    backgroundColor: successColor,
    flex: 1,
  },
});

export default PasswordStep;
