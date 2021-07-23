import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";
import { capitalize } from "lodash";
import WizardScreen, { IWizardScreenProps } from "../../../../components/wizard/WizardScreen";
import { useAppDispatch, useAppSelector } from "../../../../state";
import { Permission, Query } from "../../../../api/schema.d";
import PermissionListItem from "../../../../components/permissions/PermissionListItem";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/client";

const QUERY_DROPZONE_PERMISSIONS = gql`
  query QueryDropzonePermissions(
    $dropzoneId: Int!
  ) {
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

interface IPermissionWizardScreen extends IWizardScreenProps {
  permission: Permission,
  title: string;
}


function PermissionWizardScreen(props: IPermissionWizardScreen) {
  const { permission, ...rest } = props;
  const dropzoneForm = useAppSelector(state => state.forms.dropzone);
  const [queryRoles, { data, loading, called }] = useLazyQuery<Query>(QUERY_DROPZONE_PERMISSIONS);

  React.useEffect(() => {
    if (dropzoneForm.original?.id) {
      queryRoles({
        variables: {
          dropzoneId: Number(dropzoneForm.original.id)
        }
      });
    }
  }, [dropzoneForm.original]);

  return (
    <WizardScreen style={styles.container} {...rest}>

      <View style={styles.content}>
        {
          !(called && !loading && data?.dropzone?.roles?.length) ? null : (
            <Card>
              <Card.Content style={{ alignItems: "center", justifyContent: "center" }}>
                {
                  data?.dropzone?.roles?.map((role) =>
                    <PermissionListItem
                      permissionName={permission}
                      role={role}
                      title={capitalize(role.name.replace(/_/, " "))}
                    />
                  )
                }
              </Card.Content>
            </Card>
          )
        }
      </View>
    </WizardScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: "center",
  },
  content: {
    width: "100%",
    justifyContent: "space-around",
    flexDirection: "column",
    marginBottom: 16,
  },
  card: { padding: 8, marginVertical: 16 },
  cardTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardValue: {
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 16,
    alignSelf: "center",
  },
  title: {
    color: "white",
    marginBottom: 50,
    fontWeight: "bold",
    fontSize: 25,
    textAlign: "center",
    
  },
  field: {
    marginBottom: 8,
  },
  slider: {
    flexDirection: "column",
  },
  sliderControl: { width: "100%", height: 40 },
  wingLoading: {
    alignSelf: "center",
  },
  wingLoadingCardLeft: {
    width: "30%",
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: "70%",
  },
});

export default PermissionWizardScreen;