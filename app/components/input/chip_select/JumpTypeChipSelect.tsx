import gql from 'graphql-tag';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { List } from 'react-native-paper';
import { createQuery } from '../../../api/createQuery';
import { JumpType } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IJumpTypeSelect {
  value?: JumpType | null;
  userId?: number | null;
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(jt: JumpType): void;
}

export const QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES = gql`
  query DropzoneUsersAllowedJumpTypes($dropzoneId: Int!, $userIds: [Int!]!) {
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

const useAllowedJumpTypes = createQuery<
  { jumpTypes: JumpType[]; allowedJumpTypes: JumpType[] },
  {
    dropzoneId: number;
    userIds: number[];
  }
>(QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES, {
  getPayload: (query) => ({
    allowedJumpTypes: query?.dropzone?.allowedJumpTypes || [],
    ticketTypes: query?.dropzone?.ticketTypes || [],
    jumpTypes: query?.jumpTypes || [],
  }),
});

export default function JumpTypeChipSelect(props: IJumpTypeSelect) {
  const { onLoadingStateChanged, userId, value, onSelect } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data, loading } = useAllowedJumpTypes({
    variables: {
      userIds: [Number(userId) || null].filter(Boolean) as number[],
      dropzoneId: Number(currentDropzoneId),
    },
    onError: console.error,
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <List.Subheader>Jump type</List.Subheader>
      <ChipSelect
        autoSelectFirst
        items={
          uniqBy([...(data?.allowedJumpTypes || []), ...(data?.jumpTypes || [])], ({ id }) => id) ||
          []
        }
        selected={[value].filter(Boolean) as JumpType[]}
        renderItemLabel={(jumpType) => jumpType?.name || 'Unknown'}
        isDisabled={(jumpType) =>
          !data?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType?.id)
        }
        onChangeSelected={([first]) => (first ? onSelect(first) : null)}
      />
    </>
  );
}
