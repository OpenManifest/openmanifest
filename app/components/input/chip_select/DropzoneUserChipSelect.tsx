import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List } from "react-native-paper";
import useCurrentDropzone from "../../../api/hooks/useCurrentDropzone";
import useQueryDropzoneUsers from "../../../api/hooks/useQueryDropzoneUsers";
import { DropzoneUser } from "../../../api/schema.d";
import { actions, useAppDispatch, useAppSelector } from "../../../state";
import ChipSelect from "./ChipSelect";
import ChipSelectSkeleton from "./ChipSelectSkeleton";


interface IDropzoneUserChipSelect {
  value?: DropzoneUser | null;
  label: string;
  icon?: string;
  required?: boolean;
  requiredPermissions: string[];
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(dzuser: DropzoneUser): void;
}

export default function DropzoneUserChipSelect(props: IDropzoneUserChipSelect) {
  const { label, requiredPermissions, icon, required, value, onLoadingStateChanged, onSelect } = props;
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

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading]);

  return (
    loading
    ? <ChipSelectSkeleton /> 
    : <>
      <List.Subheader>
        {label}
      </List.Subheader>
      <ChipSelect<DropzoneUser>
        autoSelectFirst
        icon={icon || "account"}
        items={data?.edges?.map((edge) => edge!.node!) || []}
        selected={[props.value].filter(Boolean) as DropzoneUser[]}
        isSelected={(item) => item.id === value?.id}
        renderItemLabel={(dzUser) => dzUser?.user.name}
        isDisabled={() => false}
        onChangeSelected={([first]) =>
          first ? onSelect(first) : null
        }
      />
    </>
  )
}