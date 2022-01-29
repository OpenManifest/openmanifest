import * as React from 'react';
import { capitalize } from 'lodash';
import gql from 'graphql-tag';
import { useLazyQuery } from '@apollo/client';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard';
import { useAppSelector } from 'app/state';
import { Permission, Query } from 'app/api/schema.d';
import PermissionListItem from 'app/components/permissions/PermissionListItem';
import { FlatList } from 'react-native';

const QUERY_DROPZONE_PERMISSIONS = gql`
  query QueryDropzonePermissions($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      roles {
        id
        name
        permissions
      }
    }
  }
`;

interface IPermissionWizardScreen extends IWizardStepProps {
  permission: Permission;
  title: string;
}

function PermissionWizardScreen(props: IPermissionWizardScreen) {
  const { permission, ...rest } = props;
  const dropzoneForm = useAppSelector((root) => root.forms.dropzone);
  const [queryRoles, { data, loading, called }] = useLazyQuery<Query>(QUERY_DROPZONE_PERMISSIONS);

  React.useEffect(() => {
    if (dropzoneForm.original?.id) {
      queryRoles({
        variables: {
          dropzoneId: Number(dropzoneForm.original.id),
        },
      });
    }
  }, [dropzoneForm.original, queryRoles]);

  return (
    <Step {...rest}>
      <Fields>
        {!(called && !loading && data?.dropzone?.roles?.length) ? null : (
          <FlatList
            data={data?.dropzone?.roles || []}
            contentContainerStyle={{ paddingBottom: 200 }}
            renderItem={({ item: role }) => (
              <PermissionListItem
                permissionName={permission}
                role={role}
                title={capitalize(role?.name?.replace(/_/, ' '))}
              />
            )}
          />
        )}
      </Fields>
    </Step>
  );
}

export default PermissionWizardScreen;
