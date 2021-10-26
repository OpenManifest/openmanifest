/* eslint-disable */
import * as Operation from './operations';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export const CurrentUserEssentialsFragmentDoc = gql`
    fragment currentUserEssentials on DropzoneUser {
  id
  credits
  hasCredits
  hasExitWeight
  hasMembership
  hasReserveInDate
  hasRigInspection
  hasLicense
  permissions
  expiresAt
  role {
    id
    name
  }
}
    `;
export const CurrentUserDetailedFragmentDoc = gql`
    fragment currentUserDetailed on DropzoneUser {
  ...currentUserEssentials
  rigInspections {
    id
    isOk
    inspectedBy {
      id
      user {
        id
        name
      }
    }
    rig {
      id
    }
  }
  orders {
    edges {
      node {
        id
        title
        state
        createdAt
        title
        amount
        buyer {
          __typename
          ... on DropzoneUser {
            id
            user {
              id
              name
            }
          }
          ... on Dropzone {
            id
            name
          }
        }
        seller {
          __typename
          ... on DropzoneUser {
            id
            user {
              id
              name
            }
          }
          ... on Dropzone {
            id
            name
          }
        }
        item {
          title
          cost
          ... on Slot {
            id
            ticketType {
              id
              name
              cost
            }
            extras {
              id
              name
              cost
            }
          }
          ... on TicketType {
            id
          }
          ... on Extra {
            id
            name
          }
        }
        receipts {
          id
          transactions {
            id
            message
            transactionType
            status
            createdAt
            amount
            sender {
              ... on DropzoneUser {
                id
                user {
                  id
                  name
                }
              }
              ... on Dropzone {
                id
                name
              }
            }
            receiver {
              ... on DropzoneUser {
                id
                user {
                  id
                  name
                }
              }
              ... on Dropzone {
                id
                name
              }
            }
          }
        }
      }
    }
  }
  availableRigs {
    name
    id
    make
    model
    canopySize
    serial
    user {
      id
    }
  }
  license {
    id
    name
  }
  user {
    id
    name
    exitWeight
    email
    phone
    pushToken
    image
    rigs {
      id
      name
      model
      make
      serial
      canopySize
      repackExpiresAt
      packingCard
      user {
        id
      }
    }
    jumpTypes {
      id
      name
    }
    license {
      id
      name
    }
  }
}
    ${CurrentUserEssentialsFragmentDoc}`;
export const DropzoneEssentialsFragmentDoc = gql`
    fragment dropzoneEssentials on Dropzone {
  id
  lat
  lng
  name
  primaryColor
  secondaryColor
  planes {
    id
    name
    registration
  }
  ticketTypes {
    id
    name
  }
}
    `;
export const DropzoneDetailedFragmentDoc = gql`
    fragment dropzoneDetailed on Dropzone {
  ...dropzoneEssentials
  currentConditions {
    id
    jumpRun
    temperature
    offsetDirection
    offsetMiles
    winds {
      altitude
      speed
      direction
    }
  }
  loads(earliestTimestamp: $earliestTimestamp) {
    edges {
      node {
        id
        name
        loadNumber
        isOpen
        maxSlots
        state
      }
    }
  }
}
    ${DropzoneEssentialsFragmentDoc}`;
export const SlotFragmentDoc = gql`
    fragment slot on Slot {
  id
  createdAt
  exitWeight
  passengerName
  passengerExitWeight
  wingLoading
  dropzoneUser {
    id
    role {
      id
      name
    }
    user {
      id
      name
      exitWeight
      image
      license {
        id
        name
      }
    }
  }
  ticketType {
    id
    name
    altitude
    isTandem
    extras {
      id
      name
      cost
    }
  }
  jumpType {
    id
    name
  }
  extras {
    id
    name
  }
}
    `;
export const LoadFragmentDoc = gql`
    fragment load on Load {
  id
  name
  createdAt
  dispatchAt
  hasLanded
  loadNumber
  isFull
  state
  isOpen
  weight
  maxSlots
  availableSlots
  occupiedSlots
  plane {
    id
    maxSlots
    name
  }
  gca {
    id
    user {
      id
      name
    }
  }
  pilot {
    id
    user {
      id
      name
    }
  }
  loadMaster {
    id
    user {
      id
      name
    }
  }
  slots {
    ...slot
  }
}
    ${SlotFragmentDoc}`;
export const TransactionFragmentDoc = gql`
    fragment transaction on Transaction {
  id
  transactionType
  amount
  status
  sender {
    ... on DropzoneUser {
      id
      user {
        id
        name
      }
    }
    ... on Dropzone {
      id
      name
    }
  }
  receiver {
    ... on DropzoneUser {
      id
      user {
        id
        name
      }
    }
    ... on Dropzone {
      id
      name
    }
  }
}
    `;
export const OrderFragmentDoc = gql`
    fragment order on Order {
  id
  state
  amount
  title
  orderNumber
  buyer {
    ... on DropzoneUser {
      id
      user {
        id
        name
      }
    }
    ... on Dropzone {
      id
      name
    }
  }
  seller {
    ... on DropzoneUser {
      id
      user {
        id
        name
      }
    }
    ... on Dropzone {
      id
      name
    }
  }
  item {
    title
    cost
    ... on Slot {
      id
      ticketType {
        id
        name
        cost
      }
      extras {
        id
        name
        cost
      }
    }
    ... on TicketType {
      id
    }
    ... on Extra {
      id
      name
    }
  }
  receipts {
    id
    amountCents
    createdAt
    updatedAt
    transactions {
      ...transaction
    }
  }
}
    ${TransactionFragmentDoc}`;
export const CreateOrderDocument = gql`
    mutation CreateOrder($buyer: WalletInput!, $seller: WalletInput!, $dropzoneId: Int!, $title: String, $amount: Int!) {
  createOrder(
    input: {attributes: {dropzoneId: $dropzoneId, title: $title, buyer: $buyer, seller: $seller, amount: $amount}}
  ) {
    fieldErrors {
      field
      message
    }
    errors
    order {
      ...order
    }
  }
}
    ${OrderFragmentDoc}`;
export type CreateOrderMutationFn = Apollo.MutationFunction<Operation.CreateOrderMutation, Operation.CreateOrderMutationVariables>;

/**
 * __useCreateOrderMutation__
 *
 * To run a mutation, you first call `useCreateOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrderMutation, { data, loading, error }] = useCreateOrderMutation({
 *   variables: {
 *      buyer: // value for 'buyer'
 *      seller: // value for 'seller'
 *      dropzoneId: // value for 'dropzoneId'
 *      title: // value for 'title'
 *      amount: // value for 'amount'
 *   },
 * });
 */
export function useCreateOrderMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateOrderMutation, Operation.CreateOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateOrderMutation, Operation.CreateOrderMutationVariables>(CreateOrderDocument, options);
      }
export type CreateOrderMutationHookResult = ReturnType<typeof useCreateOrderMutation>;
export type CreateOrderMutationResult = Apollo.MutationResult<Operation.CreateOrderMutation>;
export type CreateOrderMutationOptions = Apollo.BaseMutationOptions<Operation.CreateOrderMutation, Operation.CreateOrderMutationVariables>;
export const FinalizeLoadDocument = gql`
    mutation FinalizeLoad($id: Int!, $state: LoadState!) {
  finalizeLoad(input: {id: $id, state: $state}) {
    fieldErrors {
      message
      field
    }
    errors
    load {
      ...load
    }
  }
}
    ${LoadFragmentDoc}`;
export type FinalizeLoadMutationFn = Apollo.MutationFunction<Operation.FinalizeLoadMutation, Operation.FinalizeLoadMutationVariables>;

/**
 * __useFinalizeLoadMutation__
 *
 * To run a mutation, you first call `useFinalizeLoadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFinalizeLoadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [finalizeLoadMutation, { data, loading, error }] = useFinalizeLoadMutation({
 *   variables: {
 *      id: // value for 'id'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useFinalizeLoadMutation(baseOptions?: Apollo.MutationHookOptions<Operation.FinalizeLoadMutation, Operation.FinalizeLoadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.FinalizeLoadMutation, Operation.FinalizeLoadMutationVariables>(FinalizeLoadDocument, options);
      }
export type FinalizeLoadMutationHookResult = ReturnType<typeof useFinalizeLoadMutation>;
export type FinalizeLoadMutationResult = Apollo.MutationResult<Operation.FinalizeLoadMutation>;
export type FinalizeLoadMutationOptions = Apollo.BaseMutationOptions<Operation.FinalizeLoadMutation, Operation.FinalizeLoadMutationVariables>;
export const JoinFederationDocument = gql`
    mutation JoinFederation($federationId: Int!, $uid: String, $licenseId: Int) {
  joinFederation(
    input: {attributes: {federationId: $federationId, uid: $uid, licenseId: $licenseId}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    userFederation {
      id
      uid
      qualifications {
        id
        name
        uid
        expiresAt
      }
      license {
        id
        name
      }
      user {
        id
        name
        nickname
        userFederations {
          federation {
            id
            name
            slug
          }
          license {
            id
            name
          }
        }
      }
    }
  }
}
    `;
export type JoinFederationMutationFn = Apollo.MutationFunction<Operation.JoinFederationMutation, Operation.JoinFederationMutationVariables>;

/**
 * __useJoinFederationMutation__
 *
 * To run a mutation, you first call `useJoinFederationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinFederationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinFederationMutation, { data, loading, error }] = useJoinFederationMutation({
 *   variables: {
 *      federationId: // value for 'federationId'
 *      uid: // value for 'uid'
 *      licenseId: // value for 'licenseId'
 *   },
 * });
 */
export function useJoinFederationMutation(baseOptions?: Apollo.MutationHookOptions<Operation.JoinFederationMutation, Operation.JoinFederationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.JoinFederationMutation, Operation.JoinFederationMutationVariables>(JoinFederationDocument, options);
      }
export type JoinFederationMutationHookResult = ReturnType<typeof useJoinFederationMutation>;
export type JoinFederationMutationResult = Apollo.MutationResult<Operation.JoinFederationMutation>;
export type JoinFederationMutationOptions = Apollo.BaseMutationOptions<Operation.JoinFederationMutation, Operation.JoinFederationMutationVariables>;
export const DropzoneTransactionsDocument = gql`
    query DropzoneTransactions($dropzoneId: Int!, $after: String) {
  dropzone(id: $dropzoneId) {
    ...dropzoneEssentials
    orders(after: $after) {
      edges {
        node {
          id
        }
      }
    }
  }
}
    ${DropzoneEssentialsFragmentDoc}`;

/**
 * __useDropzoneTransactionsQuery__
 *
 * To run a query within a React component, call `useDropzoneTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzoneTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzoneTransactionsQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useDropzoneTransactionsQuery(baseOptions: Apollo.QueryHookOptions<Operation.DropzoneTransactionsQuery, Operation.DropzoneTransactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzoneTransactionsQuery, Operation.DropzoneTransactionsQueryVariables>(DropzoneTransactionsDocument, options);
      }
export function useDropzoneTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzoneTransactionsQuery, Operation.DropzoneTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzoneTransactionsQuery, Operation.DropzoneTransactionsQueryVariables>(DropzoneTransactionsDocument, options);
        }
export type DropzoneTransactionsQueryHookResult = ReturnType<typeof useDropzoneTransactionsQuery>;
export type DropzoneTransactionsLazyQueryHookResult = ReturnType<typeof useDropzoneTransactionsLazyQuery>;
export type DropzoneTransactionsQueryResult = Apollo.QueryResult<Operation.DropzoneTransactionsQuery, Operation.DropzoneTransactionsQueryVariables>;
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
export const CurrentUserPermissionsDocument = gql`
    query CurrentUserPermissions($dropzoneId: Int!) {
  dropzone(id: $dropzoneId) {
    id
    name
    primaryColor
    secondaryColor
    currentUser {
      id
      role {
        id
        name
      }
      permissions
    }
  }
}
    `;

/**
 * __useCurrentUserPermissionsQuery__
 *
 * To run a query within a React component, call `useCurrentUserPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserPermissionsQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useCurrentUserPermissionsQuery(baseOptions: Apollo.QueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>(CurrentUserPermissionsDocument, options);
      }
export function useCurrentUserPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>(CurrentUserPermissionsDocument, options);
        }
export type CurrentUserPermissionsQueryHookResult = ReturnType<typeof useCurrentUserPermissionsQuery>;
export type CurrentUserPermissionsLazyQueryHookResult = ReturnType<typeof useCurrentUserPermissionsLazyQuery>;
export type CurrentUserPermissionsQueryResult = Apollo.QueryResult<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>;