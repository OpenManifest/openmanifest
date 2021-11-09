import { Dropzone } from 'app/api/schema.d';
import { DropzoneWizardStep } from 'app/screens/authenticated/dropzone_wizard/slice';

export default function checkDropzoneSetupComplete(dropzone: Dropzone) {
  const completed = {
    [DropzoneWizardStep.Name]: false,
    [DropzoneWizardStep.Federation]: false,
    [DropzoneWizardStep.Location]: false,
    [DropzoneWizardStep.Aircraft]: false,
    [DropzoneWizardStep.Tickets]: false,
    [DropzoneWizardStep.Branding]: false,
  };

  let currentIndex;
  if (dropzone?.ticketTypes?.length) {
    completed[DropzoneWizardStep.Tickets] = true;
  } else {
    currentIndex = DropzoneWizardStep.Tickets;
  }

  if (dropzone.planes?.length) {
    completed[DropzoneWizardStep.Aircraft] = true;
  } else {
    currentIndex = DropzoneWizardStep.Aircraft;
  }

  if (dropzone?.primaryColor) {
    completed[DropzoneWizardStep.Branding] = true;
  } else {
    currentIndex = DropzoneWizardStep.Branding;
  }
  if (dropzone.lat && dropzone.lng) {
    completed[DropzoneWizardStep.Location] = true;
  } else {
    currentIndex = DropzoneWizardStep.Location;
  }

  if (dropzone.federation?.id) {
    completed[DropzoneWizardStep.Federation] = true;
  } else {
    currentIndex = DropzoneWizardStep.Federation;
  }

  if (dropzone.name) {
    completed[DropzoneWizardStep.Name] = true;
  } else {
    currentIndex = DropzoneWizardStep.Name;
  }

  if (Object.values(completed).some((isComplete) => !isComplete)) {
    return currentIndex;
  }
  return false;
}
