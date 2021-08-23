/* eslint-disable */
import * as Operation from './operations';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}

export const QueryDropzoneUserProfileDocument = gql`
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

/**
 * __useQueryDropzoneUserProfile__
 *
 * To run a query within a React component, call `useQueryDropzoneUserProfile` and pass it any options that fit your needs.
 * When your component renders, `useQueryDropzoneUserProfile` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryDropzoneUserProfile({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      dropzoneUserId: // value for 'dropzoneUserId'
 *   },
 * });
 */
export function useQueryDropzoneUserProfile(baseOptions: Apollo.QueryHookOptions<Operation.QueryDropzoneUserProfileQuery, Operation.QueryDropzoneUserProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.QueryDropzoneUserProfileQuery, Operation.QueryDropzoneUserProfileQueryVariables>(QueryDropzoneUserProfileDocument, options);
      }
export function useQueryDropzoneUserProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.QueryDropzoneUserProfileQuery, Operation.QueryDropzoneUserProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.QueryDropzoneUserProfileQuery, Operation.QueryDropzoneUserProfileQueryVariables>(QueryDropzoneUserProfileDocument, options);
        }
export type QueryDropzoneUserProfileHookResult = ReturnType<typeof useQueryDropzoneUserProfile>;
export type QueryDropzoneUserProfileLazyQueryHookResult = ReturnType<typeof useQueryDropzoneUserProfileLazyQuery>;
export type QueryDropzoneUserProfileQueryResult = Apollo.QueryResult<Operation.QueryDropzoneUserProfileQuery, Operation.QueryDropzoneUserProfileQueryVariables>;