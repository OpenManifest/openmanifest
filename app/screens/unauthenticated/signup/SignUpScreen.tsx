import * as React from 'react';
import { Screen } from 'app/components/layout';
import SignupWizard from 'app/forms/sign_up/SignupWizard';

export default function SignupScreen() {
  return (
    <Screen>
      <SignupWizard />
    </Screen>
  );
}
