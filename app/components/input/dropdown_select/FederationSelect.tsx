import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { List, Menu, TextInput } from "react-native-paper";
import { Federation, Query } from "../../../api/schema.d";


interface IFederationSelect {
  value?: Federation | null;
  required?: boolean;
  onSelect(jt: Federation): void;
}

const QUERY_FEDERATIONS = gql`
  query Federations {
    federations {
      id
      name
    }
  }
`;

export default function FederationSelect(props: IFederationSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const { data } = useQuery<Query>(QUERY_FEDERATIONS);

  React.useEffect(() => {
    if (data?.federations?.length === 1 && !props.value) {
      props.onSelect(data.federations![0]);
    }
  }, [JSON.stringify(data?.federations)])

  return (
    <>
    <List.Subheader>
      Federation
    </List.Subheader>
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      
      anchor={
        <TouchableOpacity onPress={() => { setMenuOpen(true); }}>
          <TextInput
            mode="outlined"
            disabled
            style={{ minWidth: 200 }}
            value={
              props.value?.name || "Please select federation"
            }
          />
        </TouchableOpacity>
      }>
      {
        data?.federations?.map((federation) => 
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(federation);
            }}
            title={
              federation.name || "-"
            }
            key={`federation-select-${federation.id}`}
          />
        )
      }
    </Menu>
    </>
  )
}