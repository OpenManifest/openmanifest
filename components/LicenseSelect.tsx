import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { List, Menu } from "react-native-paper";
import { License, Query } from "../graphql/schema";
import { useAppSelector } from "../redux";


interface ILicenseSelect {
  value?: License | null;
  required?: boolean;
  federationId?: number | null;
  onSelect(jt: License): void;
}

const QUERY_LICENSES = gql`
  query Licenses($federationId: Int) {
    licenses(federationId: $federationId) {
      id
      name

      federation {
        id
        name
      }

    }
  }
`;

export default function LicenseSelect(props: ILicenseSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data, loading, refetch } = useQuery<Query>(QUERY_LICENSES, {
    variables: {
      federationId: props.federationId,
    }
  });
  return (
    <>
    <List.Subheader>
      License
    </List.Subheader>
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <List.Item
          onPress={() => {
            setMenuOpen(true);
          }}
          title={
            props.value?.name || "Please select a license"
          }
          description={!props.required ? "Optional" : null}
        />
      }>
      {
        data?.licenses?.map((license) => 
          <List.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(license);
            }}
            title={
              license.name || "-"
            }
          />
        )
      }
    </Menu>
    </>
  )
}