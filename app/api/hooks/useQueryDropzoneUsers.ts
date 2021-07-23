import gql from 'graphql-tag';
import { createQuery } from '../createQuery';
import { Query } from '../schema';

const QUERY_DROPZONE_USERS = gql`
  query QueryDropzoneUsers($dropzoneId: Int!, $permissions: [Permission!]) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(permissions: $permissions) {
        edges {
          node {
            id
            role {
              id
              name
            }
            user {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export default createQuery<
  Query['dropzone']['dropzoneUsers'],
  {
    dropzoneId: number;
    permissions: string[];
  }
>(QUERY_DROPZONE_USERS, {
  getPayload: (query) => query?.dropzone?.dropzoneUsers,
});
