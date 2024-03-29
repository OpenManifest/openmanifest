import * as React from 'react';
import { capitalize } from 'lodash';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { useAppSelector } from 'app/state';
import { Permission } from 'app/api/schema.d';
import PermissionListItem from 'app/components/permissions/PermissionListItem';
import { FlatList } from 'react-native';
import { useDropzonePermissionsLazyQuery } from 'app/api/reflection';
import { Paragraph } from 'react-native-paper';

interface IPermissionWizardScreen extends IWizardStepProps {
  permission: Permission;
  title: string;
  description?: string;
}

function PermissionWizardScreen(props: IPermissionWizardScreen) {
  const { permission, description, ...rest } = props;
  const dropzoneForm = useAppSelector((root) => root.forms.dropzone);
  const [queryRoles, { data, loading, called }] = useDropzonePermissionsLazyQuery();

  React.useEffect(() => {
    if (dropzoneForm.original?.id) {
      queryRoles({
        variables: {
          id: dropzoneForm.original.id,
        },
      });
    }
  }, [dropzoneForm.original, queryRoles]);

  return (
    <Step {...rest}>
      {description && <Paragraph>{description}</Paragraph>}
      <Fields>
        {!(called && !loading && data?.dropzone?.roles?.length) ? null : (
          <FlatList
            data={data?.dropzone?.roles || []}
            contentContainerStyle={{ paddingBottom: 200 }}
            keyExtractor={(item) => item.id.toString()}
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
