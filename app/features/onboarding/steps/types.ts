import type { IndustryTemplate, WizardErrors, WizardValues } from '../wizard';

/** What every step of the operator wizard gets */
export type StepProps = {
  values: WizardValues;
  /** Changes fields; their errors go */
  set(patch: Partial<WizardValues>): void;
  /** Error messages, already translated, by field */
  errors: Partial<Record<keyof WizardErrors, string>>;
  /** The template chosen, once the list has loaded */
  industry: IndustryTemplate | null;
};
