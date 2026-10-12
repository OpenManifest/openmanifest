import { OperatorDetailedFragment } from 'app/api/operations';
import { OperatorWizardStep } from 'app/screens/wizards/operator_wizard/OperatorWizardStep';

export default function checkOperatorSetupComplete(operator: OperatorDetailedFragment) {
  const completed = {
    [OperatorWizardStep.Name]: false,
    [OperatorWizardStep.Federation]: false,
    [OperatorWizardStep.Location]: false,
    [OperatorWizardStep.Aircraft]: false,
    [OperatorWizardStep.Tickets]: false,
    [OperatorWizardStep.Branding]: false,
  };

  let currentIndex;

  if (operator?.primaryColor) {
    completed[OperatorWizardStep.Branding] = true;
  } else {
    currentIndex = OperatorWizardStep.Branding;
  }
  if (operator.lat && operator.lng) {
    completed[OperatorWizardStep.Location] = true;
  } else {
    currentIndex = OperatorWizardStep.Location;
  }

  if (operator.federation?.id) {
    completed[OperatorWizardStep.Federation] = true;
  } else {
    currentIndex = OperatorWizardStep.Federation;
  }

  if (operator.name) {
    completed[OperatorWizardStep.Name] = true;
  } else {
    currentIndex = OperatorWizardStep.Name;
  }

  if (Object.values(completed).some((isComplete) => !isComplete)) {
    return currentIndex;
  }
  return false;
}
