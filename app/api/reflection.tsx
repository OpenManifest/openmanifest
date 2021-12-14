/* eslint-disable */
import * as Operation from './operations';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export const DropzoneUserProfileFragmentDoc = gql`
    fragment dropzoneUserProfile on DropzoneUser {
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
    `;
export const DropzoneEssentialsFragmentDoc = gql`
    fragment dropzoneEssentials on Dropzone {
  id
  lat
  lng
  name
  primaryColor
  secondaryColor
  isPublic
  requestPublication
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
  federation {
    id
    name
    slug
  }
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
export const UserEssentialsFragmentDoc = gql`
    fragment userEssentials on User {
  id
  name
  nickname
  phone
  email
  exitWeight
  moderationRole
  image
  license {
    id
    name
  }
}
    `;
export const TransactionEssentialsFragmentDoc = gql`
    fragment transactionEssentials on Transaction {
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
export const OrderEssentialsFragmentDoc = gql`
    fragment orderEssentials on Order {
  id
  state
  amount
  title
  orderNumber
  createdAt
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
      ...transactionEssentials
    }
  }
}
    ${TransactionEssentialsFragmentDoc}`;
export const CurrentUserDetailedFragmentDoc = gql`
    fragment currentUserDetailed on DropzoneUser {
  ...currentUserEssentials
  user {
    ...userEssentials
  }
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
        ...orderEssentials
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
    ${CurrentUserEssentialsFragmentDoc}
${UserEssentialsFragmentDoc}
${OrderEssentialsFragmentDoc}`;
export const DropzoneExtensiveFragmentDoc = gql`
    fragment dropzoneExtensive on Dropzone {
  ...dropzoneDetailed
  currentUser {
    ...currentUserDetailed
  }
}
    ${DropzoneDetailedFragmentDoc}
${CurrentUserDetailedFragmentDoc}`;
export const DropzoneUserEssentialsFragmentDoc = gql`
    fragment dropzoneUserEssentials on DropzoneUser {
  id
  role {
    id
    name
  }
  license {
    id
    name
  }
  user {
    ...userEssentials
  }
}
    ${UserEssentialsFragmentDoc}`;
export const TicketTypeEssentialsFragmentDoc = gql`
    fragment ticketTypeEssentials on TicketType {
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
    `;
export const JumpTypeEssentialsFragmentDoc = gql`
    fragment jumpTypeEssentials on JumpType {
  id
  name
}
    `;
export const SlotDetailsFragmentDoc = gql`
    fragment slotDetails on Slot {
  id
  createdAt
  exitWeight
  passengerName
  passengerExitWeight
  wingLoading
  dropzoneUser {
    ...dropzoneUserEssentials
  }
  ticketType {
    ...ticketTypeEssentials
  }
  jumpType {
    ...jumpTypeEssentials
  }
  extras {
    id
    name
  }
}
    ${DropzoneUserEssentialsFragmentDoc}
${TicketTypeEssentialsFragmentDoc}
${JumpTypeEssentialsFragmentDoc}`;
export const LoadDetailsFragmentDoc = gql`
    fragment loadDetails on Load {
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
    ...slotDetails
  }
}
    ${SlotDetailsFragmentDoc}`;
export const PlaneEssentialsFragmentDoc = gql`
    fragment planeEssentials on Plane {
  id
  maxSlots
  name
  registration
}
    `;
export const RigEssentialsFragmentDoc = gql`
    fragment rigEssentials on Rig {
  id
  name
  make
  model
  serial
  canopySize
  repackExpiresAt
  packValue
  maintainedAt
  rigType
  packingCard
}
    `;
export const UserRigDetailedFragmentDoc = gql`
    fragment userRigDetailed on Rig {
  ...rigEssentials
  user {
    id
    rigs {
      ...rigEssentials
    }
  }
}
    ${RigEssentialsFragmentDoc}`;
export const ConfirmUserDocument = gql`
    mutation ConfirmUser($token: String!) {
  userConfirmRegistrationWithToken(confirmationToken: $token) {
    authenticatable {
      id
      apfNumber
      phone
      pushToken
      email
    }
    credentials {
      accessToken
      client
      expiry
      tokenType
      uid
    }
  }
}
    `;
export type ConfirmUserMutationFn = Apollo.MutationFunction<Operation.ConfirmUserMutation, Operation.ConfirmUserMutationVariables>;

/**
 * __useConfirmUserMutation__
 *
 * To run a mutation, you first call `useConfirmUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmUserMutation, { data, loading, error }] = useConfirmUserMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useConfirmUserMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ConfirmUserMutation, Operation.ConfirmUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ConfirmUserMutation, Operation.ConfirmUserMutationVariables>(ConfirmUserDocument, options);
      }
export type ConfirmUserMutationHookResult = ReturnType<typeof useConfirmUserMutation>;
export type ConfirmUserMutationResult = Apollo.MutationResult<Operation.ConfirmUserMutation>;
export type ConfirmUserMutationOptions = Apollo.BaseMutationOptions<Operation.ConfirmUserMutation, Operation.ConfirmUserMutationVariables>;
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
      ...orderEssentials
    }
  }
}
    ${OrderEssentialsFragmentDoc}`;
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
export const CreateRigDocument = gql`
    mutation CreateRig($make: String, $name: String, $model: String, $serial: String, $rigType: String, $canopySize: Int, $repackExpiresAt: Int, $userId: Int, $dropzoneId: Int) {
  createRig(
    input: {attributes: {name: $name, make: $make, model: $model, serial: $serial, repackExpiresAt: $repackExpiresAt, dropzoneId: $dropzoneId, userId: $userId, canopySize: $canopySize, rigType: $rigType}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    rig {
      ...userRigDetailed
    }
  }
}
    ${UserRigDetailedFragmentDoc}`;
export type CreateRigMutationFn = Apollo.MutationFunction<Operation.CreateRigMutation, Operation.CreateRigMutationVariables>;

/**
 * __useCreateRigMutation__
 *
 * To run a mutation, you first call `useCreateRigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRigMutation, { data, loading, error }] = useCreateRigMutation({
 *   variables: {
 *      make: // value for 'make'
 *      name: // value for 'name'
 *      model: // value for 'model'
 *      serial: // value for 'serial'
 *      rigType: // value for 'rigType'
 *      canopySize: // value for 'canopySize'
 *      repackExpiresAt: // value for 'repackExpiresAt'
 *      userId: // value for 'userId'
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useCreateRigMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateRigMutation, Operation.CreateRigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateRigMutation, Operation.CreateRigMutationVariables>(CreateRigDocument, options);
      }
export type CreateRigMutationHookResult = ReturnType<typeof useCreateRigMutation>;
export type CreateRigMutationResult = Apollo.MutationResult<Operation.CreateRigMutation>;
export type CreateRigMutationOptions = Apollo.BaseMutationOptions<Operation.CreateRigMutation, Operation.CreateRigMutationVariables>;
export const FinalizeLoadDocument = gql`
    mutation FinalizeLoad($id: Int!, $state: LoadState!) {
  finalizeLoad(input: {id: $id, state: $state}) {
    fieldErrors {
      message
      field
    }
    errors
    load {
      ...loadDetails
    }
  }
}
    ${LoadDetailsFragmentDoc}`;
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
export const RecoverPasswordDocument = gql`
    mutation RecoverPassword($email: String!, $redirectUrl: String!) {
  userSendPasswordReset(email: $email, redirectUrl: $redirectUrl) {
    message
  }
}
    `;
export type RecoverPasswordMutationFn = Apollo.MutationFunction<Operation.RecoverPasswordMutation, Operation.RecoverPasswordMutationVariables>;

/**
 * __useRecoverPasswordMutation__
 *
 * To run a mutation, you first call `useRecoverPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecoverPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recoverPasswordMutation, { data, loading, error }] = useRecoverPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *      redirectUrl: // value for 'redirectUrl'
 *   },
 * });
 */
export function useRecoverPasswordMutation(baseOptions?: Apollo.MutationHookOptions<Operation.RecoverPasswordMutation, Operation.RecoverPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.RecoverPasswordMutation, Operation.RecoverPasswordMutationVariables>(RecoverPasswordDocument, options);
      }
export type RecoverPasswordMutationHookResult = ReturnType<typeof useRecoverPasswordMutation>;
export type RecoverPasswordMutationResult = Apollo.MutationResult<Operation.RecoverPasswordMutation>;
export type RecoverPasswordMutationOptions = Apollo.BaseMutationOptions<Operation.RecoverPasswordMutation, Operation.RecoverPasswordMutationVariables>;
export const ReloadWeatherDocument = gql`
    mutation ReloadWeather($id: Int!) {
  reloadWeatherCondition(input: {id: $id}) {
    errors
    fieldErrors {
      field
      message
    }
    weatherCondition {
      createdAt
      exitSpotMiles
      id
      jumpRun
      offsetDirection
      offsetMiles
      temperature
      updatedAt
      winds {
        altitude
        direction
        speed
        temperature
      }
    }
  }
}
    `;
export type ReloadWeatherMutationFn = Apollo.MutationFunction<Operation.ReloadWeatherMutation, Operation.ReloadWeatherMutationVariables>;

/**
 * __useReloadWeatherMutation__
 *
 * To run a mutation, you first call `useReloadWeatherMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReloadWeatherMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reloadWeatherMutation, { data, loading, error }] = useReloadWeatherMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useReloadWeatherMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ReloadWeatherMutation, Operation.ReloadWeatherMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ReloadWeatherMutation, Operation.ReloadWeatherMutationVariables>(ReloadWeatherDocument, options);
      }
export type ReloadWeatherMutationHookResult = ReturnType<typeof useReloadWeatherMutation>;
export type ReloadWeatherMutationResult = Apollo.MutationResult<Operation.ReloadWeatherMutation>;
export type ReloadWeatherMutationOptions = Apollo.BaseMutationOptions<Operation.ReloadWeatherMutation, Operation.ReloadWeatherMutationVariables>;
export const UpdateLostPasswordDocument = gql`
    mutation UpdateLostPassword($password: String!, $passwordConfirmation: String!, $token: String!) {
  userUpdatePasswordWithToken(
    password: $password
    passwordConfirmation: $passwordConfirmation
    resetPasswordToken: $token
  ) {
    authenticatable {
      ...userEssentials
    }
    credentials {
      accessToken
      client
      expiry
      tokenType
      uid
    }
  }
}
    ${UserEssentialsFragmentDoc}`;
export type UpdateLostPasswordMutationFn = Apollo.MutationFunction<Operation.UpdateLostPasswordMutation, Operation.UpdateLostPasswordMutationVariables>;

/**
 * __useUpdateLostPasswordMutation__
 *
 * To run a mutation, you first call `useUpdateLostPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLostPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLostPasswordMutation, { data, loading, error }] = useUpdateLostPasswordMutation({
 *   variables: {
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useUpdateLostPasswordMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateLostPasswordMutation, Operation.UpdateLostPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateLostPasswordMutation, Operation.UpdateLostPasswordMutationVariables>(UpdateLostPasswordDocument, options);
      }
export type UpdateLostPasswordMutationHookResult = ReturnType<typeof useUpdateLostPasswordMutation>;
export type UpdateLostPasswordMutationResult = Apollo.MutationResult<Operation.UpdateLostPasswordMutation>;
export type UpdateLostPasswordMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateLostPasswordMutation, Operation.UpdateLostPasswordMutationVariables>;
export const UpdateRigDocument = gql`
    mutation UpdateRig($id: Int!, $name: String, $make: String, $model: String, $serial: String, $rigType: String, $canopySize: Int, $packingCard: String, $repackExpiresAt: Int, $userId: Int, $dropzoneId: Int) {
  updateRig(
    input: {id: $id, attributes: {name: $name, make: $make, packingCard: $packingCard, model: $model, serial: $serial, repackExpiresAt: $repackExpiresAt, dropzoneId: $dropzoneId, userId: $userId, canopySize: $canopySize, rigType: $rigType}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    rig {
      ...userRigDetailed
    }
  }
}
    ${UserRigDetailedFragmentDoc}`;
export type UpdateRigMutationFn = Apollo.MutationFunction<Operation.UpdateRigMutation, Operation.UpdateRigMutationVariables>;

/**
 * __useUpdateRigMutation__
 *
 * To run a mutation, you first call `useUpdateRigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRigMutation, { data, loading, error }] = useUpdateRigMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      make: // value for 'make'
 *      model: // value for 'model'
 *      serial: // value for 'serial'
 *      rigType: // value for 'rigType'
 *      canopySize: // value for 'canopySize'
 *      packingCard: // value for 'packingCard'
 *      repackExpiresAt: // value for 'repackExpiresAt'
 *      userId: // value for 'userId'
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useUpdateRigMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateRigMutation, Operation.UpdateRigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateRigMutation, Operation.UpdateRigMutationVariables>(UpdateRigDocument, options);
      }
export type UpdateRigMutationHookResult = ReturnType<typeof useUpdateRigMutation>;
export type UpdateRigMutationResult = Apollo.MutationResult<Operation.UpdateRigMutation>;
export type UpdateRigMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateRigMutation, Operation.UpdateRigMutationVariables>;
export const UserSignUpDocument = gql`
    mutation UserSignUp($email: String!, $password: String!, $passwordConfirmation: String!, $name: String!, $phone: String!, $pushToken: String, $exitWeight: Float!, $licenseId: Int) {
  userSignUp(
    email: $email
    password: $password
    passwordConfirmation: $passwordConfirmation
    exitWeight: $exitWeight
    name: $name
    phone: $phone
    pushToken: $pushToken
    licenseId: $licenseId
    confirmSuccessUrl: "https://openmanifest.org/confirm/"
  ) {
    fieldErrors {
      field
      message
    }
    errors
    authenticatable {
      createdAt
      email
      id
      name
      phone
    }
    credentials {
      accessToken
      tokenType
      client
      expiry
      uid
    }
  }
}
    `;
export type UserSignUpMutationFn = Apollo.MutationFunction<Operation.UserSignUpMutation, Operation.UserSignUpMutationVariables>;

/**
 * __useUserSignUpMutation__
 *
 * To run a mutation, you first call `useUserSignUpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserSignUpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userSignUpMutation, { data, loading, error }] = useUserSignUpMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *      name: // value for 'name'
 *      phone: // value for 'phone'
 *      pushToken: // value for 'pushToken'
 *      exitWeight: // value for 'exitWeight'
 *      licenseId: // value for 'licenseId'
 *   },
 * });
 */
export function useUserSignUpMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UserSignUpMutation, Operation.UserSignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UserSignUpMutation, Operation.UserSignUpMutationVariables>(UserSignUpDocument, options);
      }
export type UserSignUpMutationHookResult = ReturnType<typeof useUserSignUpMutation>;
export type UserSignUpMutationResult = Apollo.MutationResult<Operation.UserSignUpMutation>;
export type UserSignUpMutationOptions = Apollo.BaseMutationOptions<Operation.UserSignUpMutation, Operation.UserSignUpMutationVariables>;
export const QueryDropzoneDocument = gql`
    query QueryDropzone($dropzoneId: Int!, $earliestTimestamp: Int) {
  dropzone(id: $dropzoneId) {
    ...dropzoneExtensive
  }
}
    ${DropzoneExtensiveFragmentDoc}`;

/**
 * __useQueryDropzone__
 *
 * To run a query within a React component, call `useQueryDropzone` and pass it any options that fit your needs.
 * When your component renders, `useQueryDropzone` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryDropzone({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      earliestTimestamp: // value for 'earliestTimestamp'
 *   },
 * });
 */
export function useQueryDropzone(baseOptions: Apollo.QueryHookOptions<Operation.QueryDropzoneQuery, Operation.QueryDropzoneQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.QueryDropzoneQuery, Operation.QueryDropzoneQueryVariables>(QueryDropzoneDocument, options);
      }
export function useQueryDropzoneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.QueryDropzoneQuery, Operation.QueryDropzoneQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.QueryDropzoneQuery, Operation.QueryDropzoneQueryVariables>(QueryDropzoneDocument, options);
        }
export type QueryDropzoneHookResult = ReturnType<typeof useQueryDropzone>;
export type QueryDropzoneLazyQueryHookResult = ReturnType<typeof useQueryDropzoneLazyQuery>;
export type QueryDropzoneQueryResult = Apollo.QueryResult<Operation.QueryDropzoneQuery, Operation.QueryDropzoneQueryVariables>;
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
      ...dropzoneUserProfile
    }
  }
}
    ${DropzoneUserProfileFragmentDoc}`;

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
export const AddressToLocationDocument = gql`
    query AddressToLocation($search: String!) {
  geocode(search: $search) {
    formattedString
    id
    lat
    lng
  }
}
    `;

/**
 * __useAddressToLocationQuery__
 *
 * To run a query within a React component, call `useAddressToLocationQuery` and pass it any options that fit your needs.
 * When your component renders, `useAddressToLocationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAddressToLocationQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useAddressToLocationQuery(baseOptions: Apollo.QueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>(AddressToLocationDocument, options);
      }
export function useAddressToLocationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>(AddressToLocationDocument, options);
        }
export type AddressToLocationQueryHookResult = ReturnType<typeof useAddressToLocationQuery>;
export type AddressToLocationLazyQueryHookResult = ReturnType<typeof useAddressToLocationLazyQuery>;
export type AddressToLocationQueryResult = Apollo.QueryResult<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>;
export const LoadDocument = gql`
    query Load($id: Int!) {
  load(id: $id) {
    ...loadDetails
  }
}
    ${LoadDetailsFragmentDoc}`;

/**
 * __useLoadQuery__
 *
 * To run a query within a React component, call `useLoadQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoadQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLoadQuery(baseOptions: Apollo.QueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.LoadQuery, Operation.LoadQueryVariables>(LoadDocument, options);
      }
export function useLoadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.LoadQuery, Operation.LoadQueryVariables>(LoadDocument, options);
        }
export type LoadQueryHookResult = ReturnType<typeof useLoadQuery>;
export type LoadLazyQueryHookResult = ReturnType<typeof useLoadLazyQuery>;
export type LoadQueryResult = Apollo.QueryResult<Operation.LoadQuery, Operation.LoadQueryVariables>;
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