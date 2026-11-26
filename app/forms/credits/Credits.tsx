import * as React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MembershipDetailsFragment, OrderEssentialsFragment } from 'app/api/operations';
import { TransactionType } from 'app/api/schema.d';
import { Button, Overlay, Tabs } from 'app/ui';
import useCreditsForm from './useForm';
import CreditsForm from './CreditsForm';

export interface ICreditsSheet {
  open?: boolean;
  membership?: MembershipDetailsFragment;
  onClose(): void;
  onSuccess?(order: OrderEssentialsFragment): void;
}

/** Adds funds to a member's account, or takes them out: two tabs over one form, and the save button pinned below */
export default function CreditSheet(props: ICreditsSheet) {
  const { t } = useTranslation('common');
  const { open, membership, onClose, onSuccess } = props;
  const { onSubmit, control, setValue, loading } = useCreditsForm({
    onSuccess,
    membership,
  });
  const type = useWatch({ control, name: 'type' }) ?? TransactionType.Deposit;

  return (
    <Overlay
      testID="credits-sheet"
      open={!!open}
      onClose={onClose}
      title={t('forms.credits.title')}
      footer={<Button label={t('forms.save')} fullWidth loading={loading} onPress={onSubmit} />}
    >
      <Tabs<TransactionType>
        label={t('forms.credits.title')}
        value={type as TransactionType}
        onChange={(next) => setValue('type', next)}
        tabs={[
          { value: TransactionType.Deposit, label: t('forms.credits.deposit') },
          { value: TransactionType.Withdrawal, label: t('forms.credits.withdraw') },
        ]}
      >
        <CreditsForm {...{ control, membership }} />
      </Tabs>
    </Overlay>
  );
}
