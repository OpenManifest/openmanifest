import * as React from 'react';
import { capitalize } from 'lodash';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { useWatch } from 'react-hook-form';
import { useOperatorWizardFields } from '../useOperatorWizardForm';
import { Permission } from 'app/api/schema.d';
import PermissionListItem from 'app/components/permissions/PermissionListItem';
import { FlatList } from 'react-native';
import { useOperatorPermissionsLazyQuery } from 'app/api/reflection';
import { Paragraph } from 'react-native-paper';

interface IPermissionWizardScreen extends IWizardStepProps {
  permission: Permission;
  title: string;
  description?: string;
}

function PermissionWizardScreen(props: IPermissionWizardScreen) {
  const { permission, description, ...rest } = props;
  const { control } = useOperatorWizardFields();
  const operatorId = useWatch({ control, name: 'id' });
  const [queryRoles, { data, loading, called }] = useOperatorPermissionsLazyQuery();

  React.useEffect(() => {
    if (operatorId) {
      queryRoles({
        variables: {
          id: operatorId,
        },
      });
    }
  }, [operatorId, queryRoles]);

  return (
    <Step {...rest}>
      {description && <Paragraph>{description}</Paragraph>}
      <Fields>
        {!(called && !loading && data?.operator?.roles?.length) ? null : (
          <FlatList
            data={data?.operator?.roles || []}
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
