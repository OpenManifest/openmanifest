import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";
import { capitalize } from "lodash";
import WizardScreen from "../../../wizard/WizardScreen";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import { Permission, Query } from "../../../../graphql/schema.d";
import PermissionListItem from "../../../permissions/PermissionListItem";
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

interface IPermissionWizardScreen {
  permission: Permission,
  title: string;
}


function WingloadingWizardScreen(props: IPermissionWizardScreen) {
  const { title, permission } = props;
  const dropzoneForm = useAppSelector(state => state.forms.dropzone);
  const dispatch = useAppDispatch();
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
    <WizardScreen style={styles.container}>
      <Text style={styles.title}>{title}</Text>

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

export default WingloadingWizardScreen;