import { useOperatorContext } from 'app/providers/operator/context';
import { decide } from 'app/navigation/destinations';
import { useRigStepsRequired } from 'app/features/skydiving/wizard';
import { useQualificationStepRequired } from './steps/Qualifications';
import { useDateOfBirthStepRequired } from './steps/DateOfBirth';

/** Which optional parts of the profile set-up an operator asks for (GENERALISATION §14) */
export type WizardParts = {
  /** Certification body, number and level: the certifications module */
  certifications: boolean;
  /** The qualifications the operator's tickets ask for: the certifications module too */
  qualifications: boolean;
  /** Date of birth: the limits module with an age limit */
  dateOfBirth: boolean;
  /** A skydiver's rig: the equipment module, with the rig kind */
  rigs: boolean;
};

/** Where the steps of each part start; `null` when the operator does not ask for the part */
export type WizardLayout = {
  certification: [body: number, number: number, level: number] | null;
  qualifications: number | null;
  dateOfBirth: number | null;
  askForRig: number | null;
  /** The rig, its reserve repack and the wing loading follow the question */
  rigFrom: number | null;
};

/** Name, nickname and photo always come first */
const ALWAYS = 3;

/** The index of every part's steps, in the order the wizard shows them */
export function wizardLayout(parts: WizardParts): WizardLayout {
  let next = ALWAYS;
  const take = (on: boolean, count = 1) => {
    if (!on) return null;
    const at = next;
    next += count;
    return at;
  };
  const certification = take(parts.certifications, 3);
  const qualifications = take(parts.qualifications);
  const dateOfBirth = take(parts.dateOfBirth);
  const askForRig = take(parts.rigs, 4);

  return {
    certification:
      certification === null ? null : [certification, certification + 1, certification + 2],
    qualifications,
    dateOfBirth,
    askForRig,
    rigFrom: askForRig === null ? null : askForRig + 1,
  };
}

/** The parts of the profile set-up the current operator's modules ask for */
export function useWizardParts(): WizardParts {
  const {
    operator: { operator },
  } = useOperatorContext();
  const modules = (operator?.modules ?? {}) as Record<string, unknown>;
  const has = (module: string) => decide({ module }, { permissions: [], modules }) === 'allowed';
  const qualifications = useQualificationStepRequired();
  const dateOfBirth = useDateOfBirthStepRequired();
  const rigs = useRigStepsRequired();
  const certifications = has('certifications');

  return {
    certifications,
    qualifications: certifications && qualifications,
    dateOfBirth,
    rigs: has('equipment') && rigs,
  };
}
