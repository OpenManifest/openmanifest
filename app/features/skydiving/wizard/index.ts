import { useOperatorContext } from 'app/providers/operator/context';
import AskForRigStep, { useStep as useAskForRigStep } from './AskForRig';
import RigStep, { useStep as useRigStep } from './Rig';
import ReserveRepackStep, { useStep as useReserveRepackStep } from './ReserveRepack';
import WingloadingStep, { useStep as useWingloadingStep } from './Wingloading';
import { findRigKind } from '../rig';

/** The steps of the user wizard that ask about the jumper's rig: only an operator with the rig kind has them */
export const RIG_STEPS = [AskForRigStep, RigStep, ReserveRepackStep, WingloadingStep];

export function useRigStepsRequired(): boolean {
  const {
    operator: { operator },
  } = useOperatorContext();
  return !!findRigKind(operator?.equipmentKinds);
}

export { useAskForRigStep, useRigStep, useReserveRepackStep, useWingloadingStep };
