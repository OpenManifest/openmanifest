import { useOperatorContext } from 'app/providers/operator/context';
import AskForRigStep, { useStep as useAskForParachuteStep } from './AskForRig';
import RigStep, { useStep as useParachuteStep } from './Rig';
import ReserveRepackStep, { useStep as useReserveRepackStep } from './ReserveRepack';
import WingloadingStep, { useStep as useWingloadingStep } from './Wingloading';
import { findParachuteKind } from '../parachute';

/** The steps of the user wizard that ask about the jumper's rig: only an operator with the rig kind has them */
export const PARACHUTE_STEPS = [AskForRigStep, RigStep, ReserveRepackStep, WingloadingStep];

export function useParachuteStepsRequired(): boolean {
  const {
    operator: { operator },
  } = useOperatorContext();
  return !!findParachuteKind(operator?.equipmentKinds);
}

export { useAskForParachuteStep, useParachuteStep, useReserveRepackStep, useWingloadingStep };
