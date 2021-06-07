import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List } from "react-native-paper";
import { License, Query } from "../../../graphql/schema";
import ChipSelect from "./ChipSelect";


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

export default function LicenseChipSelect(props: ILicenseSelect) {

  const { data } = useQuery<Query>(QUERY_LICENSES, {
    variables: {
      federationId: props.federationId,
    }
  });
  return (
    <>
      <List.Subheader>
        License
      </List.Subheader>
      <ChipSelect<License>
        autoSelectFirst
        icon="ticket-account"
        items={data?.licenses || []}
        selected={[props.value].filter(Boolean) as License[]}
        isSelected={(item) => item.id === props.value?.id}
        renderItemLabel={(license) => license?.name}
        isDisabled={() => false}
        onChangeSelected={([first]) =>
          first ? props.onSelect(first) : null
        }
      />
    </>
  )
}