import { OperatorDetailedFragment } from 'app/api/operations';
import { OperatorWizardStep } from 'app/screens/wizards/operator_wizard/OperatorWizardStep';

export default function checkOperatorSetupComplete(operator: OperatorDetailedFragment) {
  const completed = {
    [OperatorWizardStep.Name]: false,
    [OperatorWizardStep.CertificationBody]: false,
    [OperatorWizardStep.Location]: false,
    [OperatorWizardStep.Vehicle]: false,
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

  if (operator.certificationBodies?.length) {
    completed[OperatorWizardStep.CertificationBody] = true;
  } else {
    currentIndex = OperatorWizardStep.CertificationBody;
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
