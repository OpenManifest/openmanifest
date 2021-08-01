import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useAppSelector } from '../../state';
import { Query } from '../schema';
import useCurrentDropzone from './useCurrentDropzone';

export const QUERY_DROPZONE_USER = gql`
  query QueryDropzoneUser($dropzoneId: Int!, $dropzoneUserId: Int!) {
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
        rigInspections {
          id
          isOk
          rig {
            id
          }
        }

        notifications {
          edges {
            node {
              id
              message
              notificationType
              createdAt
            }
          }
        }

        transactions {
          edges {
            node {
              id
              status
              message
              amount
              createdAt
            }
          }
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
      }
    }
  }
`;

// Returns current user if no ID is provided
export default function useDropzoneUser(id?: number) {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const currentDropzone = useCurrentDropzone();

  const dropzoneUser = useQuery<Pick<Query, 'dropzone'>>(QUERY_DROPZONE_USER, {
    variables: {
      dropzoneId,
      dropzoneUserId: id || Number(currentDropzone?.data?.dropzone?.currentUser?.id),
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    ...dropzoneUser,
    dropzoneUser:
      !id || id === Number(currentDropzone?.data?.dropzone?.currentUser?.id)
        ? currentDropzone?.data?.dropzone?.currentUser
        : dropzoneUser?.data?.dropzone?.dropzoneUser,
  };
}
