import gql from "graphql-tag";
import { uniqBy } from "lodash";
import React from "react";
import { List } from "react-native-paper";
import { createQuery } from "../../../graphql/createQuery";
import { JumpType } from "../../../graphql/schema";
import { useAppSelector } from "../../../redux";
import ChipSelect from "./ChipSelect";


interface IJumpTypeSelect {
  value?: JumpType | null;
  required?: boolean;
  userId?: number | null;
  onSelect(jt: JumpType): void;
}

export const QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES = gql`
query DropzoneUsersAllowedJumpTypes(
  $dropzoneId: Int!,
  $userIds: [Int!]!
) {
  dropzone(id: $dropzoneId) {
    id

    allowedJumpTypes(userId: $userIds) {
      id
      name
    }
  }
  jumpTypes {
    id
    name
  }
}

`;

const useAllowedJumpTypes = createQuery<{ jumpTypes: JumpType[], allowedJumpTypes: JumpType[] }, {
  dropzoneId: number,
  userIds: number[],
 }>(QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES, {
   getPayload: (query) => ({
     allowedJumpTypes: query?.dropzone?.allowedJumpTypes || [],
     ticketTypes: query?.dropzone?.ticketTypes || [],
     jumpTypes: query?.jumpTypes || [],
   })
 });

export default function JumpTypeChipSelect(props: IJumpTypeSelect) {
  const globalState = useAppSelector(state => state.global);
  
  const { data, loading } = useAllowedJumpTypes({
    variables: {
      userIds: [Number(props.userId) || null].filter(Boolean) as number[],
      dropzoneId: Number(globalState?.currentDropzone?.id)
    },
    onError: console.error
  });

  return (
    <>
      <List.Subheader>
        Jump type
      </List.Subheader>
      <ChipSelect
        autoSelectFirst
        items={uniqBy([
            ...(data?.allowedJumpTypes || []),
            ...(data?.jumpTypes || [])
          ], ({ id }) => id) || []
        }
        selected={[props.value].filter(Boolean)}
        renderItemLabel={(jumpType) => jumpType?.name}
        isDisabled={(jumpType) => !data?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType!.id)}
        onChangeSelected={([first]) =>
          first ? props.onSelect(first) : null
        }
      />
    </>
  )
}