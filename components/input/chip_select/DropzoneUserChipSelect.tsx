import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List } from "react-native-paper";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import useQueryDropzoneUsers from "../../../graphql/hooks/useQueryDropzoneUsers";
import { DropzoneUser } from "../../../graphql/schema.d";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import ChipSelect from "./ChipSelect";


interface IDropzoneUserChipSelect {
  value?: DropzoneUser | null;
  label: string;
  icon?: string;
  required?: boolean;
  requiredPermissions: string[];
  onSelect(dzuser: DropzoneUser): void;
}

export default function DropzoneUserChipSelect(props: IDropzoneUserChipSelect) {
  const { label, requiredPermissions, icon, required, value } = props;
  const { currentDropzoneId } = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();

  const { data, loading, refetch } = useQueryDropzoneUsers({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      permissions: requiredPermissions
    },
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: "error" }))
  });

  return (
    <>
      <List.Subheader>
        {label}
      </List.Subheader>
      <ChipSelect<DropzoneUser>
        autoSelectFirst
        icon={icon || "account"}
        items={data?.edges?.map(({ node }) => node) || []}
        selected={[props.value].filter(Boolean) as DropzoneUser[]}
        isSelected={(item) => item.id === value?.id}
        renderItemLabel={(dzUser) => dzUser?.user.name}
        isDisabled={() => false}
        onChangeSelected={([first]) =>
          first ? props.onSelect(first) : null
        }
      />
    </>
  )
}