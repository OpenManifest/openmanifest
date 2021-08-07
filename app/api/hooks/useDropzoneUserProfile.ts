import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useAppSelector } from '../../state';
import { Query } from '../schema';

export const QUERY_DROPZONE_USER_PROFILE = gql`
  query QueryDropzoneUserProfile($dropzoneId: Int!, $dropzoneUserId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUser(id: $dropzoneUserId) {
        id
        credits
        expiresAt
        permissions

        role {
          id
          name
        }

        user {
          id
          name
          exitWeight
          email
          phone
          image
          rigs {
            id
            name
            model
            make
            serial
            canopySize
            repackExpiresAt
          }
          jumpTypes {
            id
            name
          }
          license {
            id
            name
            federation {
              id
              name
            }
          }
        }

        slots {
          edges {
            node {
              id
              createdAt
              load {
                id
                name
                loadNumber
                dispatchAt
                createdAt
              }
              jumpType {
                id
                name
              }
              ticketType {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

// Returns current user if no ID is provided
export default function useDropzoneUser(id: number) {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);

  const dropzoneUser = useQuery<Pick<Query, 'dropzone'>>(QUERY_DROPZONE_USER_PROFILE, {
    variables: {
      dropzoneId,
      dropzoneUserId: id,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    ...dropzoneUser,
    dropzoneUser: dropzoneUser?.data?.dropzone?.dropzoneUser,
  };
}
