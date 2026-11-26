import * as React from 'react';
import { capitalize } from 'lodash';
import { useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Permission } from 'app/api/schema.d';
import PermissionListItem from 'app/components/permissions/PermissionListItem';
import { useOperatorPermissionsLazyQuery } from 'app/api/reflection';
import { Text, useTheme } from 'app/ui';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

interface IPermissionWizardScreen extends IWizardStepProps {
  permission: Permission;
  title: string;
  description?: string;
}

/** Which roles of the new operator hold one permission, as switches */
function PermissionWizardScreen(props: IPermissionWizardScreen) {
  const { permission, description, ...rest } = props;
  const theme = useTheme();
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

  const roles = called && !loading ? (data?.operator?.roles ?? []) : [];

  return (
    <Step {...rest}>
      {description ? <Text tone="muted">{description}</Text> : null}
      <Fields>
        <View style={{ paddingBottom: theme.space.xxxl }}>
          {roles.map((role) => (
            <PermissionListItem
              key={role.id}
              permissionName={permission}
              role={role}
              title={capitalize(role?.name?.replace(/_/, ' '))}
            />
          ))}
        </View>
      </Fields>
    </Step>
  );
}

export default PermissionWizardScreen;
