import * as React from 'react';
import { startOfDay } from 'date-fns';
import {
  useJoinFederationMutation,
  QueryDropzoneDocument,
  QueryDropzoneUserProfileDocument,
} from 'app/api/reflection';
import UserForm from '../forms/user/UserForm';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import DialogOrSheet from '../layout/DialogOrSheet';
import useMutationUpdateUser from '../../api/hooks/useMutationUpdateUser';
import { UserFields } from '../forms/user/slice';

interface IUpdateUserDialog {
  open?: boolean;
  dropzoneUserId: number;
  onClose(): void;
  onSuccess(): void;
}
export default function UpdateUserDialog(props: IUpdateUserDialog) {
  const { open, onSuccess, onClose, dropzoneUserId } = props;
  const currentDropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();
  const [joinFederation] = useJoinFederationMutation();

  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: (payload) => {
      dispatch(
        actions.notifications.showSnackbar({
          message: `Profile has been updated`,
          variant: 'success',
        })
      );
      dispatch(actions.forms.user.setOpen(false));
      onSuccess();
    },
    onFieldError: (field, value) =>
      dispatch(actions.forms.user.setFieldError([field as keyof UserFields, value])),
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    mutation: {
      refetchQueries: [
        {
          query: QueryDropzoneDocument,
          variables: {
            dropzoneId: currentDropzoneId,
            earliestTimestamp: startOfDay(new Date()).toISOString(),
          },
        },
        {
          query: QueryDropzoneUserProfileDocument,
          variables: {
            dropzoneId: currentDropzoneId,
            dropzoneUserId,
          },
        },
      ],
    },
  });

  const onSave = React.useCallback(async () => {
    await mutationUpdateUser.mutate({
      id: Number(state.original?.id),
      name: state.fields.name.value,
      licenseId: !state.fields.license.value?.id ? null : Number(state.fields.license.value?.id),
      phone: state.fields.phone.value,
      exitWeight: parseFloat(state.fields.exitWeight?.value || '50'),
      email: state.fields.email.value,
    });

    // TODO: Set APF number from userFederation belonging to currentDropzone.federation
    // and compare against that
    const selectedLicenseFederation = state.original?.userFederations?.find(
      ({ federation }) => federation.slug === state.fields.license.value?.federation?.slug
    );
    console.debug({ selectedLicenseFederation });
    if (
      (state.fields.license.value?.id &&
        selectedLicenseFederation?.license?.id !== state.fields.license.value?.id) ||
      (state.fields.apfNumber?.value &&
        state.fields.apfNumber?.value !== selectedLicenseFederation?.uid)
    ) {
      await joinFederation({
        variables: {
          federation: Number(state.fields.license.value?.federation?.id),
          uid: state.fields?.apfNumber?.value,
          license: state.fields.license.value?.id ? Number(state.fields.license.value?.id) : null,
        },
      });
    }
  }, [
    joinFederation,
    mutationUpdateUser,
    state.fields.apfNumber?.value,
    state.fields.email.value,
    state.fields.exitWeight?.value,
    state.fields.license.value?.federation?.id,
    state.fields.license.value?.federation?.slug,
    state.fields.license.value?.id,
    state.fields.name.value,
    state.fields.phone.value,
    state.original?.id,
    state.original?.userFederations,
  ]);

  const snapPoints = React.useMemo(() => [740], []);

  return (
    <DialogOrSheet
      title="Update information"
      open={open}
      snapPoints={snapPoints}
      loading={mutationUpdateUser.loading}
      onClose={onClose}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <UserForm />
    </DialogOrSheet>
  );
}
