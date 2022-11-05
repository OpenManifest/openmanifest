import { useQueryDropzoneUserProfileLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { Card } from 'react-native-paper';
import DropzoneUserAutocomplete from 'app/components/autocomplete/DropzoneUserAutocomplete.web';
import { DropzoneUserProfileFragment } from 'app/api/operations';

interface IUserRigCardEmptyProps {
  dropzoneId: string;
  onSelectUser(user: DropzoneUserProfileFragment): void;
}

export default function UserCard(props: IUserRigCardEmptyProps) {
  const { dropzoneId, onSelectUser } = props;

  const [fetchProfile] = useQueryDropzoneUserProfileLazyQuery();

  return (
    <Card
      style={{
        marginBottom: 16,
        paddingLeft: 16,
        paddingTop: 4,
        paddingBottom: 4,
      }}
      elevation={2}
    >
      <DropzoneUserAutocomplete
        label="Search skydivers..."
        onChange={(user) => {
          fetchProfile({ variables: { dropzoneId, dropzoneUserId: Number(user.id) } }).then(
            (result) => {
              if (result.data?.dropzone?.dropzoneUser) {
                onSelectUser(result.data?.dropzone.dropzoneUser);
              }
            }
          );
        }}
      />
    </Card>
  );
}
