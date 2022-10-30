/* eslint-disable */
import * as Operation from './operations';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const RoleEssentialsFragmentDoc = gql`
    fragment roleEssentials on UserRole {
  id
  name
  dropzoneId
}
    `;
export const LicenseEssentialsFragmentDoc = gql`
    fragment licenseEssentials on License {
  id
  name
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
  apfNumber
}
    `;
export const DropzoneUserEssentialsFragmentDoc = gql`
    fragment dropzoneUserEssentials on DropzoneUser {
  id
  expiresAt
  hasCredits
  hasMembership
  hasLicense
  hasExitWeight
  role {
    ...roleEssentials
  }
  license {
    ...licenseEssentials
  }
  user {
    ...userEssentials
  }
}
    ${RoleEssentialsFragmentDoc}
${LicenseEssentialsFragmentDoc}
${UserEssentialsFragmentDoc}`;
export const ActivityEssentialsFragmentDoc = gql`
    fragment activityEssentials on Event {
  action
  id
  level
  message
  details
  createdAt
  createdBy {
    ...dropzoneUserEssentials
  }
}
    ${DropzoneUserEssentialsFragmentDoc}`;
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
  banner
  isCreditSystemEnabled
  createdAt
}
    `;
export const LoadEssentialsFragmentDoc = gql`
    fragment loadEssentials on Load {
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
}
    `;
export const TicketTypeEssentialsFragmentDoc = gql`
    fragment ticketTypeEssentials on TicketType {
  id
  name
  altitude
  cost
  isTandem
  allowManifestingSelf
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
export const SlotEssentialsFragmentDoc = gql`
    fragment slotEssentials on Slot {
  id
  createdAt
  exitWeight
  passengerName
  passengerExitWeight
  wingLoading
  groupNumber
  cost
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
    ${TicketTypeEssentialsFragmentDoc}
${JumpTypeEssentialsFragmentDoc}`;
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
  isPublic
  owner {
    id
    name
  }
  dropzone {
    id
  }
}
    `;
export const PlaneEssentialsFragmentDoc = gql`
    fragment planeEssentials on Plane {
  id
  minSlots
  maxSlots
  name
  registration
}
    `;
export const ActivityDetailsFragmentDoc = gql`
    fragment activityDetails on Event {
  ...activityEssentials
  resource {
    ... on Dropzone {
      ...dropzoneEssentials
    }
    ... on DropzoneUser {
      ...dropzoneUserEssentials
    }
    ... on Load {
      ...loadEssentials
    }
    ... on Slot {
      ...slotEssentials
    }
    ... on Rig {
      ...rigEssentials
    }
    ... on Plane {
      ...planeEssentials
    }
  }
}
    ${ActivityEssentialsFragmentDoc}
${DropzoneEssentialsFragmentDoc}
${DropzoneUserEssentialsFragmentDoc}
${LoadEssentialsFragmentDoc}
${SlotEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${PlaneEssentialsFragmentDoc}`;
export const FederationEssentialsFragmentDoc = gql`
    fragment federationEssentials on Federation {
  id
  name
  slug
}
    `;
export const LicenseDetailsFragmentDoc = gql`
    fragment licenseDetails on License {
  ...licenseEssentials
  federation {
    ...federationEssentials
  }
}
    ${LicenseEssentialsFragmentDoc}
${FederationEssentialsFragmentDoc}`;
export const UserFederationEssentialsFragmentDoc = gql`
    fragment userFederationEssentials on UserFederation {
  id
  uid
  federation {
    ...federationEssentials
  }
  license {
    ...licenseEssentials
  }
}
    ${FederationEssentialsFragmentDoc}
${LicenseEssentialsFragmentDoc}`;
export const UserRigDetailedFragmentDoc = gql`
    fragment userRigDetailed on Rig {
  ...rigEssentials
  owner {
    id
    rigs {
      ...rigEssentials
    }
  }
}
    ${RigEssentialsFragmentDoc}`;
export const UserDetailedFragmentDoc = gql`
    fragment userDetailed on User {
  ...userEssentials
  userFederations {
    ...userFederationEssentials
  }
  rigs {
    ...userRigDetailed
  }
}
    ${UserEssentialsFragmentDoc}
${UserFederationEssentialsFragmentDoc}
${UserRigDetailedFragmentDoc}`;
export const DropzoneUserDetailsFragmentDoc = gql`
    fragment dropzoneUserDetails on DropzoneUser {
  ...dropzoneUserEssentials
  credits
  license {
    ...licenseDetails
  }
  user {
    ...userDetailed
  }
  availableRigs {
    ...rigEssentials
  }
}
    ${DropzoneUserEssentialsFragmentDoc}
${LicenseDetailsFragmentDoc}
${UserDetailedFragmentDoc}
${RigEssentialsFragmentDoc}`;
export const RigInspectionEssentialsFragmentDoc = gql`
    fragment rigInspectionEssentials on RigInspection {
  id
  isOk
  definition
  inspectedBy {
    ...dropzoneUserEssentials
  }
  rig {
    ...rigEssentials
  }
}
    ${DropzoneUserEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}`;
export const TransactionEssentialsFragmentDoc = gql`
    fragment transactionEssentials on Transaction {
  id
  transactionType
  amount
  status
  createdAt
  message
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
export const ReceiptEssentialsFragmentDoc = gql`
    fragment receiptEssentials on Receipt {
  id
  amountCents
  createdAt
  updatedAt
  transactions {
    ...transactionEssentials
  }
}
    ${TransactionEssentialsFragmentDoc}`;
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
      ...dropzoneUserDetails
    }
    ... on Dropzone {
      id
      name
      banner
    }
  }
  seller {
    ... on DropzoneUser {
      ...dropzoneUserDetails
    }
    ... on Dropzone {
      ...dropzoneEssentials
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
    ...receiptEssentials
  }
}
    ${DropzoneUserDetailsFragmentDoc}
${DropzoneEssentialsFragmentDoc}
${ReceiptEssentialsFragmentDoc}`;
export const SlotDetailsFragmentDoc = gql`
    fragment slotDetails on Slot {
  ...slotEssentials
  rig {
    ...rigEssentials
  }
  dropzoneUser {
    ...dropzoneUserEssentials
  }
}
    ${SlotEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${DropzoneUserEssentialsFragmentDoc}`;
export const UserSlotDetailsFragmentDoc = gql`
    fragment userSlotDetails on Slot {
  ...slotDetails
  load {
    ...loadEssentials
  }
}
    ${SlotDetailsFragmentDoc}
${LoadEssentialsFragmentDoc}`;
export const DropzoneUserProfileFragmentDoc = gql`
    fragment dropzoneUserProfile on DropzoneUser {
  ...dropzoneUserDetails
  permissions
  rigInspections {
    ...rigInspectionEssentials
  }
  orders {
    edges {
      node {
        ...orderEssentials
      }
    }
  }
  slots {
    edges {
      node {
        ...userSlotDetails
      }
    }
  }
}
    ${DropzoneUserDetailsFragmentDoc}
${RigInspectionEssentialsFragmentDoc}
${OrderEssentialsFragmentDoc}
${UserSlotDetailsFragmentDoc}`;
export const DropzoneStatisticsEssentialsFragmentDoc = gql`
    fragment dropzoneStatisticsEssentials on Statistics {
  id
  activeUserCount
  totalUserCount
  slotsByJumpType(timeRange: $timeRange) {
    name
    count
  }
  slotsCount(timeRange: $timeRange)
  cancelledLoadsCount(timeRange: $timeRange)
  dzsoCount
  finalizedLoadsCount(timeRange: $timeRange)
  gcaCount
  pilotCount
  inactiveUserCount
  loadsCount(timeRange: $timeRange)
  loadCountByDay(timeRange: $timeRange) {
    date
    count
  }
  revenueCentsCount(timeRange: $timeRange)
  rigInspectorCount
}
    `;
export const DropzoneStatisticsFragmentDoc = gql`
    fragment dropzoneStatistics on Dropzone {
  ...dropzoneEssentials
  statistics {
    ...dropzoneStatisticsEssentials
  }
}
    ${DropzoneEssentialsFragmentDoc}
${DropzoneStatisticsEssentialsFragmentDoc}`;
export const WeatherConditionEssentialsFragmentDoc = gql`
    fragment weatherConditionEssentials on WeatherCondition {
  id
  jumpRun
  temperature
  offsetDirection
  offsetMiles
  createdAt
  exitSpotMiles
  winds {
    temperature
    altitude
    speed
    direction
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
  planes {
    ...planeEssentials
  }
  ticketTypes {
    ...ticketTypeEssentials
  }
  currentConditions {
    ...weatherConditionEssentials
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
    ${DropzoneEssentialsFragmentDoc}
${PlaneEssentialsFragmentDoc}
${TicketTypeEssentialsFragmentDoc}
${WeatherConditionEssentialsFragmentDoc}`;
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
    ...roleEssentials
  }
}
    ${RoleEssentialsFragmentDoc}`;
export const CurrentUserFragmentDoc = gql`
    fragment currentUser on User {
  ...userDetailed
  pushToken
}
    ${UserDetailedFragmentDoc}`;
export const CurrentUserDetailedFragmentDoc = gql`
    fragment currentUserDetailed on DropzoneUser {
  ...currentUserEssentials
  rigInspections {
    ...rigInspectionEssentials
  }
  orders {
    edges {
      node {
        ...orderEssentials
      }
    }
  }
  availableRigs {
    ...rigEssentials
  }
  license {
    id
    name
  }
  user {
    ...currentUser
  }
}
    ${CurrentUserEssentialsFragmentDoc}
${RigInspectionEssentialsFragmentDoc}
${OrderEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${CurrentUserFragmentDoc}`;
export const DropzoneExtensiveFragmentDoc = gql`
    fragment dropzoneExtensive on Dropzone {
  ...dropzoneDetailed
  currentUser {
    ...currentUserDetailed
  }
}
    ${DropzoneDetailedFragmentDoc}
${CurrentUserDetailedFragmentDoc}`;
export const TicketTypeExtraEssentialsFragmentDoc = gql`
    fragment ticketTypeExtraEssentials on Extra {
  id
  name
  createdAt
  cost
}
    `;
export const TicketTypeExtraDetailedFragmentDoc = gql`
    fragment ticketTypeExtraDetailed on Extra {
  ...ticketTypeExtraEssentials
  ticketTypes {
    ...ticketTypeEssentials
  }
}
    ${TicketTypeExtraEssentialsFragmentDoc}
${TicketTypeEssentialsFragmentDoc}`;
export const RigInspectionDetailedFragmentDoc = gql`
    fragment rigInspectionDetailed on RigInspection {
  ...rigInspectionEssentials
  rig {
    ...userRigDetailed
  }
}
    ${RigInspectionEssentialsFragmentDoc}
${UserRigDetailedFragmentDoc}`;
export const RigInspectionMutationEssentialsFragmentDoc = gql`
    fragment rigInspectionMutationEssentials on RigInspection {
  ...rigInspectionDetailed
  formTemplate {
    id
    definition
  }
  dropzoneUser {
    ...dropzoneUserEssentials
    rigInspections {
      ...rigInspectionEssentials
    }
  }
}
    ${RigInspectionDetailedFragmentDoc}
${DropzoneUserEssentialsFragmentDoc}
${RigInspectionEssentialsFragmentDoc}`;
export const RoleDetailedFragmentDoc = gql`
    fragment roleDetailed on UserRole {
  ...roleEssentials
  permissions
}
    ${RoleEssentialsFragmentDoc}`;
export const LoadDetailsFragmentDoc = gql`
    fragment loadDetails on Load {
  ...loadEssentials
  plane {
    ...planeEssentials
  }
  gca {
    ...dropzoneUserEssentials
  }
  pilot {
    ...dropzoneUserEssentials
  }
  loadMaster {
    ...dropzoneUserEssentials
  }
  slots {
    ...slotDetails
  }
}
    ${LoadEssentialsFragmentDoc}
${PlaneEssentialsFragmentDoc}
${DropzoneUserEssentialsFragmentDoc}
${SlotDetailsFragmentDoc}`;
export const SlotExhaustiveFragmentDoc = gql`
    fragment slotExhaustive on Slot {
  ...slotDetails
  dropzoneUser {
    ...dropzoneUserDetails
  }
  load {
    ...loadDetails
  }
  rig {
    ...rigEssentials
  }
}
    ${SlotDetailsFragmentDoc}
${DropzoneUserDetailsFragmentDoc}
${LoadDetailsFragmentDoc}
${RigEssentialsFragmentDoc}`;
export const ArchivePlaneDocument = gql`
    mutation ArchivePlane($id: Int!) {
  deletePlane(input: {id: $id}) {
    fieldErrors {
      field
      message
    }
    errors
    plane {
      ...planeEssentials
    }
  }
}
    ${PlaneEssentialsFragmentDoc}`;
export type ArchivePlaneMutationFn = Apollo.MutationFunction<Operation.ArchivePlaneMutation, Operation.ArchivePlaneMutationVariables>;

/**
 * __useArchivePlaneMutation__
 *
 * To run a mutation, you first call `useArchivePlaneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchivePlaneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archivePlaneMutation, { data, loading, error }] = useArchivePlaneMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchivePlaneMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ArchivePlaneMutation, Operation.ArchivePlaneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ArchivePlaneMutation, Operation.ArchivePlaneMutationVariables>(ArchivePlaneDocument, options);
      }
export type ArchivePlaneMutationHookResult = ReturnType<typeof useArchivePlaneMutation>;
export type ArchivePlaneMutationResult = Apollo.MutationResult<Operation.ArchivePlaneMutation>;
export type ArchivePlaneMutationOptions = Apollo.BaseMutationOptions<Operation.ArchivePlaneMutation, Operation.ArchivePlaneMutationVariables>;
export const ArchiveRigDocument = gql`
    mutation ArchiveRig($id: Int!) {
  archiveRig(input: {id: $id}) {
    fieldErrors {
      field
      message
    }
    errors
    rig {
      ...rigEssentials
    }
  }
}
    ${RigEssentialsFragmentDoc}`;
export type ArchiveRigMutationFn = Apollo.MutationFunction<Operation.ArchiveRigMutation, Operation.ArchiveRigMutationVariables>;

/**
 * __useArchiveRigMutation__
 *
 * To run a mutation, you first call `useArchiveRigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveRigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveRigMutation, { data, loading, error }] = useArchiveRigMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveRigMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ArchiveRigMutation, Operation.ArchiveRigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ArchiveRigMutation, Operation.ArchiveRigMutationVariables>(ArchiveRigDocument, options);
      }
export type ArchiveRigMutationHookResult = ReturnType<typeof useArchiveRigMutation>;
export type ArchiveRigMutationResult = Apollo.MutationResult<Operation.ArchiveRigMutation>;
export type ArchiveRigMutationOptions = Apollo.BaseMutationOptions<Operation.ArchiveRigMutation, Operation.ArchiveRigMutationVariables>;
export const ArchiveTicketTypeDocument = gql`
    mutation ArchiveTicketType($id: Int!) {
  archiveTicketType(input: {id: $id}) {
    fieldErrors {
      field
      message
    }
    errors
    ticketType {
      ...ticketTypeEssentials
    }
  }
}
    ${TicketTypeEssentialsFragmentDoc}`;
export type ArchiveTicketTypeMutationFn = Apollo.MutationFunction<Operation.ArchiveTicketTypeMutation, Operation.ArchiveTicketTypeMutationVariables>;

/**
 * __useArchiveTicketTypeMutation__
 *
 * To run a mutation, you first call `useArchiveTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveTicketTypeMutation, { data, loading, error }] = useArchiveTicketTypeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ArchiveTicketTypeMutation, Operation.ArchiveTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ArchiveTicketTypeMutation, Operation.ArchiveTicketTypeMutationVariables>(ArchiveTicketTypeDocument, options);
      }
export type ArchiveTicketTypeMutationHookResult = ReturnType<typeof useArchiveTicketTypeMutation>;
export type ArchiveTicketTypeMutationResult = Apollo.MutationResult<Operation.ArchiveTicketTypeMutation>;
export type ArchiveTicketTypeMutationOptions = Apollo.BaseMutationOptions<Operation.ArchiveTicketTypeMutation, Operation.ArchiveTicketTypeMutationVariables>;
export const ArchiveUserDocument = gql`
    mutation ArchiveUser($id: Int!) {
  deleteUser(input: {id: $id}) {
    errors
    fieldErrors {
      field
      message
    }
    dropzoneUser {
      ...dropzoneUserEssentials
    }
  }
}
    ${DropzoneUserEssentialsFragmentDoc}`;
export type ArchiveUserMutationFn = Apollo.MutationFunction<Operation.ArchiveUserMutation, Operation.ArchiveUserMutationVariables>;

/**
 * __useArchiveUserMutation__
 *
 * To run a mutation, you first call `useArchiveUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveUserMutation, { data, loading, error }] = useArchiveUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveUserMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ArchiveUserMutation, Operation.ArchiveUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ArchiveUserMutation, Operation.ArchiveUserMutationVariables>(ArchiveUserDocument, options);
      }
export type ArchiveUserMutationHookResult = ReturnType<typeof useArchiveUserMutation>;
export type ArchiveUserMutationResult = Apollo.MutationResult<Operation.ArchiveUserMutation>;
export type ArchiveUserMutationOptions = Apollo.BaseMutationOptions<Operation.ArchiveUserMutation, Operation.ArchiveUserMutationVariables>;
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
export const CreateDropzoneDocument = gql`
    mutation CreateDropzone($name: String!, $banner: String, $federation: Int!, $lat: Float, $lng: Float, $primaryColor: String, $secondaryColor: String, $earliestTimestamp: ISO8601DateTime) {
  createDropzone(
    input: {attributes: {name: $name, banner: $banner, federation: $federation, primaryColor: $primaryColor, secondaryColor: $secondaryColor, lat: $lat, lng: $lng}}
  ) {
    fieldErrors {
      field
      message
    }
    errors
    dropzone {
      ...dropzoneExtensive
    }
  }
}
    ${DropzoneExtensiveFragmentDoc}`;
export type CreateDropzoneMutationFn = Apollo.MutationFunction<Operation.CreateDropzoneMutation, Operation.CreateDropzoneMutationVariables>;

/**
 * __useCreateDropzoneMutation__
 *
 * To run a mutation, you first call `useCreateDropzoneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDropzoneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDropzoneMutation, { data, loading, error }] = useCreateDropzoneMutation({
 *   variables: {
 *      name: // value for 'name'
 *      banner: // value for 'banner'
 *      federation: // value for 'federation'
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      primaryColor: // value for 'primaryColor'
 *      secondaryColor: // value for 'secondaryColor'
 *      earliestTimestamp: // value for 'earliestTimestamp'
 *   },
 * });
 */
export function useCreateDropzoneMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateDropzoneMutation, Operation.CreateDropzoneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateDropzoneMutation, Operation.CreateDropzoneMutationVariables>(CreateDropzoneDocument, options);
      }
export type CreateDropzoneMutationHookResult = ReturnType<typeof useCreateDropzoneMutation>;
export type CreateDropzoneMutationResult = Apollo.MutationResult<Operation.CreateDropzoneMutation>;
export type CreateDropzoneMutationOptions = Apollo.BaseMutationOptions<Operation.CreateDropzoneMutation, Operation.CreateDropzoneMutationVariables>;
export const CreateLoadDocument = gql`
    mutation CreateLoad($name: String, $pilot: Int, $gca: Int, $maxSlots: Int!, $plane: Int, $state: LoadState) {
  createLoad(
    input: {attributes: {name: $name, pilot: $pilot, gca: $gca, maxSlots: $maxSlots, plane: $plane, state: $state}}
  ) {
    load {
      ...loadDetails
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${LoadDetailsFragmentDoc}`;
export type CreateLoadMutationFn = Apollo.MutationFunction<Operation.CreateLoadMutation, Operation.CreateLoadMutationVariables>;

/**
 * __useCreateLoadMutation__
 *
 * To run a mutation, you first call `useCreateLoadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLoadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLoadMutation, { data, loading, error }] = useCreateLoadMutation({
 *   variables: {
 *      name: // value for 'name'
 *      pilot: // value for 'pilot'
 *      gca: // value for 'gca'
 *      maxSlots: // value for 'maxSlots'
 *      plane: // value for 'plane'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useCreateLoadMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateLoadMutation, Operation.CreateLoadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateLoadMutation, Operation.CreateLoadMutationVariables>(CreateLoadDocument, options);
      }
export type CreateLoadMutationHookResult = ReturnType<typeof useCreateLoadMutation>;
export type CreateLoadMutationResult = Apollo.MutationResult<Operation.CreateLoadMutation>;
export type CreateLoadMutationOptions = Apollo.BaseMutationOptions<Operation.CreateLoadMutation, Operation.CreateLoadMutationVariables>;
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
export const CreatePlaneDocument = gql`
    mutation CreatePlane($name: String!, $registration: String!, $dropzoneId: Int!, $minSlots: Int!, $maxSlots: Int!, $hours: Int, $nextMaintenanceHours: Int) {
  createPlane(
    input: {attributes: {name: $name, registration: $registration, dropzoneId: $dropzoneId, minSlots: $minSlots, maxSlots: $maxSlots, hours: $hours, nextMaintenanceHours: $nextMaintenanceHours}}
  ) {
    plane {
      ...planeEssentials
      dropzone {
        id
        planes {
          ...planeEssentials
        }
      }
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${PlaneEssentialsFragmentDoc}`;
export type CreatePlaneMutationFn = Apollo.MutationFunction<Operation.CreatePlaneMutation, Operation.CreatePlaneMutationVariables>;

/**
 * __useCreatePlaneMutation__
 *
 * To run a mutation, you first call `useCreatePlaneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePlaneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPlaneMutation, { data, loading, error }] = useCreatePlaneMutation({
 *   variables: {
 *      name: // value for 'name'
 *      registration: // value for 'registration'
 *      dropzoneId: // value for 'dropzoneId'
 *      minSlots: // value for 'minSlots'
 *      maxSlots: // value for 'maxSlots'
 *      hours: // value for 'hours'
 *      nextMaintenanceHours: // value for 'nextMaintenanceHours'
 *   },
 * });
 */
export function useCreatePlaneMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreatePlaneMutation, Operation.CreatePlaneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreatePlaneMutation, Operation.CreatePlaneMutationVariables>(CreatePlaneDocument, options);
      }
export type CreatePlaneMutationHookResult = ReturnType<typeof useCreatePlaneMutation>;
export type CreatePlaneMutationResult = Apollo.MutationResult<Operation.CreatePlaneMutation>;
export type CreatePlaneMutationOptions = Apollo.BaseMutationOptions<Operation.CreatePlaneMutation, Operation.CreatePlaneMutationVariables>;
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
export const CreateRigInspectionDocument = gql`
    mutation CreateRigInspection($dropzone: Int, $rig: Int, $isOk: Boolean, $definition: String) {
  createRigInspection(
    input: {attributes: {dropzone: $dropzone, rig: $rig, isOk: $isOk, definition: $definition}}
  ) {
    rigInspection {
      ...rigInspectionMutationEssentials
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${RigInspectionMutationEssentialsFragmentDoc}`;
export type CreateRigInspectionMutationFn = Apollo.MutationFunction<Operation.CreateRigInspectionMutation, Operation.CreateRigInspectionMutationVariables>;

/**
 * __useCreateRigInspectionMutation__
 *
 * To run a mutation, you first call `useCreateRigInspectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRigInspectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRigInspectionMutation, { data, loading, error }] = useCreateRigInspectionMutation({
 *   variables: {
 *      dropzone: // value for 'dropzone'
 *      rig: // value for 'rig'
 *      isOk: // value for 'isOk'
 *      definition: // value for 'definition'
 *   },
 * });
 */
export function useCreateRigInspectionMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateRigInspectionMutation, Operation.CreateRigInspectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateRigInspectionMutation, Operation.CreateRigInspectionMutationVariables>(CreateRigInspectionDocument, options);
      }
export type CreateRigInspectionMutationHookResult = ReturnType<typeof useCreateRigInspectionMutation>;
export type CreateRigInspectionMutationResult = Apollo.MutationResult<Operation.CreateRigInspectionMutation>;
export type CreateRigInspectionMutationOptions = Apollo.BaseMutationOptions<Operation.CreateRigInspectionMutation, Operation.CreateRigInspectionMutationVariables>;
export const CreateGhostDocument = gql`
    mutation CreateGhost($name: String!, $phone: String, $email: String!, $federationNumber: String, $role: Int!, $license: Int, $dropzone: Int!, $exitWeight: Float!) {
  createGhost(
    input: {attributes: {role: $role, federationNumber: $federationNumber, name: $name, phone: $phone, email: $email, dropzone: $dropzone, license: $license, exitWeight: $exitWeight}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    user {
      ...userDetailed
    }
  }
}
    ${UserDetailedFragmentDoc}`;
export type CreateGhostMutationFn = Apollo.MutationFunction<Operation.CreateGhostMutation, Operation.CreateGhostMutationVariables>;

/**
 * __useCreateGhostMutation__
 *
 * To run a mutation, you first call `useCreateGhostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGhostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGhostMutation, { data, loading, error }] = useCreateGhostMutation({
 *   variables: {
 *      name: // value for 'name'
 *      phone: // value for 'phone'
 *      email: // value for 'email'
 *      federationNumber: // value for 'federationNumber'
 *      role: // value for 'role'
 *      license: // value for 'license'
 *      dropzone: // value for 'dropzone'
 *      exitWeight: // value for 'exitWeight'
 *   },
 * });
 */
export function useCreateGhostMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateGhostMutation, Operation.CreateGhostMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateGhostMutation, Operation.CreateGhostMutationVariables>(CreateGhostDocument, options);
      }
export type CreateGhostMutationHookResult = ReturnType<typeof useCreateGhostMutation>;
export type CreateGhostMutationResult = Apollo.MutationResult<Operation.CreateGhostMutation>;
export type CreateGhostMutationOptions = Apollo.BaseMutationOptions<Operation.CreateGhostMutation, Operation.CreateGhostMutationVariables>;
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
export const GrantPermissionDocument = gql`
    mutation GrantPermission($dropzoneUserId: Int!, $permissionName: Permission!) {
  grantPermission(input: {id: $dropzoneUserId, permission: $permissionName}) {
    fieldErrors {
      message
      field
    }
    errors
    dropzoneUser {
      ...dropzoneUserEssentials
      permissions
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${DropzoneUserEssentialsFragmentDoc}`;
export type GrantPermissionMutationFn = Apollo.MutationFunction<Operation.GrantPermissionMutation, Operation.GrantPermissionMutationVariables>;

/**
 * __useGrantPermissionMutation__
 *
 * To run a mutation, you first call `useGrantPermissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGrantPermissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [grantPermissionMutation, { data, loading, error }] = useGrantPermissionMutation({
 *   variables: {
 *      dropzoneUserId: // value for 'dropzoneUserId'
 *      permissionName: // value for 'permissionName'
 *   },
 * });
 */
export function useGrantPermissionMutation(baseOptions?: Apollo.MutationHookOptions<Operation.GrantPermissionMutation, Operation.GrantPermissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.GrantPermissionMutation, Operation.GrantPermissionMutationVariables>(GrantPermissionDocument, options);
      }
export type GrantPermissionMutationHookResult = ReturnType<typeof useGrantPermissionMutation>;
export type GrantPermissionMutationResult = Apollo.MutationResult<Operation.GrantPermissionMutation>;
export type GrantPermissionMutationOptions = Apollo.BaseMutationOptions<Operation.GrantPermissionMutation, Operation.GrantPermissionMutationVariables>;
export const JoinFederationDocument = gql`
    mutation JoinFederation($federation: Int!, $uid: String, $license: Int) {
  joinFederation(
    input: {attributes: {federation: $federation, uid: $uid, license: $license}}
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
 *      federation: // value for 'federation'
 *      uid: // value for 'uid'
 *      license: // value for 'license'
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
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  userLogin(email: $email, password: $password) {
    authenticatable {
      id
      email
      name
      phone
      createdAt
      updatedAt
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
export type LoginMutationFn = Apollo.MutationFunction<Operation.LoginMutation, Operation.LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<Operation.LoginMutation, Operation.LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.LoginMutation, Operation.LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<Operation.LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<Operation.LoginMutation, Operation.LoginMutationVariables>;
export const LoginWithAppleDocument = gql`
    mutation LoginWithApple($token: String!, $userIdentity: String!, $pushToken: String) {
  loginWithApple(
    token: $token
    userIdentity: $userIdentity
    pushToken: $pushToken
    confirmUrl: "https://openmanifest.org/confirm/"
  ) {
    authenticatable {
      id
      email
      name
      phone
      createdAt
      updatedAt
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
export type LoginWithAppleMutationFn = Apollo.MutationFunction<Operation.LoginWithAppleMutation, Operation.LoginWithAppleMutationVariables>;

/**
 * __useLoginWithAppleMutation__
 *
 * To run a mutation, you first call `useLoginWithAppleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginWithAppleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginWithAppleMutation, { data, loading, error }] = useLoginWithAppleMutation({
 *   variables: {
 *      token: // value for 'token'
 *      userIdentity: // value for 'userIdentity'
 *      pushToken: // value for 'pushToken'
 *   },
 * });
 */
export function useLoginWithAppleMutation(baseOptions?: Apollo.MutationHookOptions<Operation.LoginWithAppleMutation, Operation.LoginWithAppleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.LoginWithAppleMutation, Operation.LoginWithAppleMutationVariables>(LoginWithAppleDocument, options);
      }
export type LoginWithAppleMutationHookResult = ReturnType<typeof useLoginWithAppleMutation>;
export type LoginWithAppleMutationResult = Apollo.MutationResult<Operation.LoginWithAppleMutation>;
export type LoginWithAppleMutationOptions = Apollo.BaseMutationOptions<Operation.LoginWithAppleMutation, Operation.LoginWithAppleMutationVariables>;
export const LoginWithFacebookDocument = gql`
    mutation LoginWithFacebook($token: String!, $pushToken: String) {
  loginWithFacebook(
    token: $token
    pushToken: $pushToken
    confirmUrl: "https://openmanifest.org/confirm/"
  ) {
    authenticatable {
      id
      email
      name
      phone
      createdAt
      updatedAt
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
export type LoginWithFacebookMutationFn = Apollo.MutationFunction<Operation.LoginWithFacebookMutation, Operation.LoginWithFacebookMutationVariables>;

/**
 * __useLoginWithFacebookMutation__
 *
 * To run a mutation, you first call `useLoginWithFacebookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginWithFacebookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginWithFacebookMutation, { data, loading, error }] = useLoginWithFacebookMutation({
 *   variables: {
 *      token: // value for 'token'
 *      pushToken: // value for 'pushToken'
 *   },
 * });
 */
export function useLoginWithFacebookMutation(baseOptions?: Apollo.MutationHookOptions<Operation.LoginWithFacebookMutation, Operation.LoginWithFacebookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.LoginWithFacebookMutation, Operation.LoginWithFacebookMutationVariables>(LoginWithFacebookDocument, options);
      }
export type LoginWithFacebookMutationHookResult = ReturnType<typeof useLoginWithFacebookMutation>;
export type LoginWithFacebookMutationResult = Apollo.MutationResult<Operation.LoginWithFacebookMutation>;
export type LoginWithFacebookMutationOptions = Apollo.BaseMutationOptions<Operation.LoginWithFacebookMutation, Operation.LoginWithFacebookMutationVariables>;
export const ManifestGroupDocument = gql`
    mutation ManifestGroup($jumpType: Int, $extras: [Int!], $load: Int, $ticketType: Int, $groupNumber: Int, $userGroup: [SlotUser!]!) {
  createSlots(
    input: {attributes: {jumpType: $jumpType, groupNumber: $groupNumber, extras: $extras, load: $load, ticketType: $ticketType, userGroup: $userGroup}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    load {
      ...loadDetails
    }
  }
}
    ${LoadDetailsFragmentDoc}`;
export type ManifestGroupMutationFn = Apollo.MutationFunction<Operation.ManifestGroupMutation, Operation.ManifestGroupMutationVariables>;

/**
 * __useManifestGroupMutation__
 *
 * To run a mutation, you first call `useManifestGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useManifestGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [manifestGroupMutation, { data, loading, error }] = useManifestGroupMutation({
 *   variables: {
 *      jumpType: // value for 'jumpType'
 *      extras: // value for 'extras'
 *      load: // value for 'load'
 *      ticketType: // value for 'ticketType'
 *      groupNumber: // value for 'groupNumber'
 *      userGroup: // value for 'userGroup'
 *   },
 * });
 */
export function useManifestGroupMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ManifestGroupMutation, Operation.ManifestGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ManifestGroupMutation, Operation.ManifestGroupMutationVariables>(ManifestGroupDocument, options);
      }
export type ManifestGroupMutationHookResult = ReturnType<typeof useManifestGroupMutation>;
export type ManifestGroupMutationResult = Apollo.MutationResult<Operation.ManifestGroupMutation>;
export type ManifestGroupMutationOptions = Apollo.BaseMutationOptions<Operation.ManifestGroupMutation, Operation.ManifestGroupMutationVariables>;
export const ManifestUserDocument = gql`
    mutation ManifestUser($jumpType: Int, $extras: [Int!], $load: Int, $rig: Int, $ticketType: Int, $dropzoneUser: Int, $exitWeight: Float, $passengerName: String, $groupNumber: Int, $passengerExitWeight: Float) {
  createSlot(
    input: {attributes: {jumpType: $jumpType, extras: $extras, load: $load, rig: $rig, groupNumber: $groupNumber, ticketType: $ticketType, dropzoneUser: $dropzoneUser, exitWeight: $exitWeight, passengerExitWeight: $passengerExitWeight, passengerName: $passengerName}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    slot {
      ...slotExhaustive
    }
  }
}
    ${SlotExhaustiveFragmentDoc}`;
export type ManifestUserMutationFn = Apollo.MutationFunction<Operation.ManifestUserMutation, Operation.ManifestUserMutationVariables>;

/**
 * __useManifestUserMutation__
 *
 * To run a mutation, you first call `useManifestUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useManifestUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [manifestUserMutation, { data, loading, error }] = useManifestUserMutation({
 *   variables: {
 *      jumpType: // value for 'jumpType'
 *      extras: // value for 'extras'
 *      load: // value for 'load'
 *      rig: // value for 'rig'
 *      ticketType: // value for 'ticketType'
 *      dropzoneUser: // value for 'dropzoneUser'
 *      exitWeight: // value for 'exitWeight'
 *      passengerName: // value for 'passengerName'
 *      groupNumber: // value for 'groupNumber'
 *      passengerExitWeight: // value for 'passengerExitWeight'
 *   },
 * });
 */
export function useManifestUserMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ManifestUserMutation, Operation.ManifestUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ManifestUserMutation, Operation.ManifestUserMutationVariables>(ManifestUserDocument, options);
      }
export type ManifestUserMutationHookResult = ReturnType<typeof useManifestUserMutation>;
export type ManifestUserMutationResult = Apollo.MutationResult<Operation.ManifestUserMutation>;
export type ManifestUserMutationOptions = Apollo.BaseMutationOptions<Operation.ManifestUserMutation, Operation.ManifestUserMutationVariables>;
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
export const RevokePermissionDocument = gql`
    mutation RevokePermission($dropzoneUserId: Int!, $permissionName: Permission!) {
  revokePermission(input: {id: $dropzoneUserId, permission: $permissionName}) {
    fieldErrors {
      message
      field
    }
    errors
    dropzoneUser {
      ...dropzoneUserEssentials
      permissions
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${DropzoneUserEssentialsFragmentDoc}`;
export type RevokePermissionMutationFn = Apollo.MutationFunction<Operation.RevokePermissionMutation, Operation.RevokePermissionMutationVariables>;

/**
 * __useRevokePermissionMutation__
 *
 * To run a mutation, you first call `useRevokePermissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokePermissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokePermissionMutation, { data, loading, error }] = useRevokePermissionMutation({
 *   variables: {
 *      dropzoneUserId: // value for 'dropzoneUserId'
 *      permissionName: // value for 'permissionName'
 *   },
 * });
 */
export function useRevokePermissionMutation(baseOptions?: Apollo.MutationHookOptions<Operation.RevokePermissionMutation, Operation.RevokePermissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.RevokePermissionMutation, Operation.RevokePermissionMutationVariables>(RevokePermissionDocument, options);
      }
export type RevokePermissionMutationHookResult = ReturnType<typeof useRevokePermissionMutation>;
export type RevokePermissionMutationResult = Apollo.MutationResult<Operation.RevokePermissionMutation>;
export type RevokePermissionMutationOptions = Apollo.BaseMutationOptions<Operation.RevokePermissionMutation, Operation.RevokePermissionMutationVariables>;
export const UpdateDropzoneDocument = gql`
    mutation UpdateDropzone($id: Int!, $name: String!, $requestPublication: Boolean, $banner: String, $federation: Int!, $lat: Float, $lng: Float, $primaryColor: String, $secondaryColor: String, $isCreditSystemEnabled: Boolean, $isPublic: Boolean, $earliestTimestamp: ISO8601DateTime) {
  updateDropzone(
    input: {id: $id, attributes: {name: $name, banner: $banner, lat: $lat, lng: $lng, requestPublication: $requestPublication, federation: $federation, primaryColor: $primaryColor, secondaryColor: $secondaryColor, isCreditSystemEnabled: $isCreditSystemEnabled, isPublic: $isPublic}}
  ) {
    fieldErrors {
      field
      message
    }
    errors
    dropzone {
      ...dropzoneExtensive
    }
  }
}
    ${DropzoneExtensiveFragmentDoc}`;
export type UpdateDropzoneMutationFn = Apollo.MutationFunction<Operation.UpdateDropzoneMutation, Operation.UpdateDropzoneMutationVariables>;

/**
 * __useUpdateDropzoneMutation__
 *
 * To run a mutation, you first call `useUpdateDropzoneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDropzoneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDropzoneMutation, { data, loading, error }] = useUpdateDropzoneMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      requestPublication: // value for 'requestPublication'
 *      banner: // value for 'banner'
 *      federation: // value for 'federation'
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      primaryColor: // value for 'primaryColor'
 *      secondaryColor: // value for 'secondaryColor'
 *      isCreditSystemEnabled: // value for 'isCreditSystemEnabled'
 *      isPublic: // value for 'isPublic'
 *      earliestTimestamp: // value for 'earliestTimestamp'
 *   },
 * });
 */
export function useUpdateDropzoneMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateDropzoneMutation, Operation.UpdateDropzoneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateDropzoneMutation, Operation.UpdateDropzoneMutationVariables>(UpdateDropzoneDocument, options);
      }
export type UpdateDropzoneMutationHookResult = ReturnType<typeof useUpdateDropzoneMutation>;
export type UpdateDropzoneMutationResult = Apollo.MutationResult<Operation.UpdateDropzoneMutation>;
export type UpdateDropzoneMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateDropzoneMutation, Operation.UpdateDropzoneMutationVariables>;
export const UpdateDropzoneUserDocument = gql`
    mutation UpdateDropzoneUser($userRoleId: Int, $expiresAt: Int, $dropzoneUserId: Int) {
  updateDropzoneUser(
    input: {id: $dropzoneUserId, attributes: {userRoleId: $userRoleId, expiresAt: $expiresAt}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    dropzoneUser {
      ...dropzoneUserDetails
    }
  }
}
    ${DropzoneUserDetailsFragmentDoc}`;
export type UpdateDropzoneUserMutationFn = Apollo.MutationFunction<Operation.UpdateDropzoneUserMutation, Operation.UpdateDropzoneUserMutationVariables>;

/**
 * __useUpdateDropzoneUserMutation__
 *
 * To run a mutation, you first call `useUpdateDropzoneUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDropzoneUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDropzoneUserMutation, { data, loading, error }] = useUpdateDropzoneUserMutation({
 *   variables: {
 *      userRoleId: // value for 'userRoleId'
 *      expiresAt: // value for 'expiresAt'
 *      dropzoneUserId: // value for 'dropzoneUserId'
 *   },
 * });
 */
export function useUpdateDropzoneUserMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateDropzoneUserMutation, Operation.UpdateDropzoneUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateDropzoneUserMutation, Operation.UpdateDropzoneUserMutationVariables>(UpdateDropzoneUserDocument, options);
      }
export type UpdateDropzoneUserMutationHookResult = ReturnType<typeof useUpdateDropzoneUserMutation>;
export type UpdateDropzoneUserMutationResult = Apollo.MutationResult<Operation.UpdateDropzoneUserMutation>;
export type UpdateDropzoneUserMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateDropzoneUserMutation, Operation.UpdateDropzoneUserMutationVariables>;
export const UpdateExtraDocument = gql`
    mutation UpdateExtra($id: Int!, $name: String, $ticketTypeIds: [Int!], $cost: Float, $dropzoneId: Int) {
  updateExtra(
    input: {id: $id, attributes: {name: $name, ticketTypeIds: $ticketTypeIds, cost: $cost, dropzoneId: $dropzoneId}}
  ) {
    extra {
      ...ticketTypeExtraDetailed
    }
  }
}
    ${TicketTypeExtraDetailedFragmentDoc}`;
export type UpdateExtraMutationFn = Apollo.MutationFunction<Operation.UpdateExtraMutation, Operation.UpdateExtraMutationVariables>;

/**
 * __useUpdateExtraMutation__
 *
 * To run a mutation, you first call `useUpdateExtraMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateExtraMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateExtraMutation, { data, loading, error }] = useUpdateExtraMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      ticketTypeIds: // value for 'ticketTypeIds'
 *      cost: // value for 'cost'
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useUpdateExtraMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateExtraMutation, Operation.UpdateExtraMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateExtraMutation, Operation.UpdateExtraMutationVariables>(UpdateExtraDocument, options);
      }
export type UpdateExtraMutationHookResult = ReturnType<typeof useUpdateExtraMutation>;
export type UpdateExtraMutationResult = Apollo.MutationResult<Operation.UpdateExtraMutation>;
export type UpdateExtraMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateExtraMutation, Operation.UpdateExtraMutationVariables>;
export const UpdateLoadDocument = gql`
    mutation UpdateLoad($id: Int!, $pilot: Int, $gca: Int, $plane: Int, $loadMaster: Int, $dispatchAt: ISO8601DateTime) {
  updateLoad(
    input: {id: $id, attributes: {pilot: $pilot, gca: $gca, plane: $plane, loadMaster: $loadMaster, dispatchAt: $dispatchAt}}
  ) {
    fieldErrors {
      field
      message
    }
    errors
    load {
      ...loadDetails
    }
  }
}
    ${LoadDetailsFragmentDoc}`;
export type UpdateLoadMutationFn = Apollo.MutationFunction<Operation.UpdateLoadMutation, Operation.UpdateLoadMutationVariables>;

/**
 * __useUpdateLoadMutation__
 *
 * To run a mutation, you first call `useUpdateLoadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLoadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLoadMutation, { data, loading, error }] = useUpdateLoadMutation({
 *   variables: {
 *      id: // value for 'id'
 *      pilot: // value for 'pilot'
 *      gca: // value for 'gca'
 *      plane: // value for 'plane'
 *      loadMaster: // value for 'loadMaster'
 *      dispatchAt: // value for 'dispatchAt'
 *   },
 * });
 */
export function useUpdateLoadMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateLoadMutation, Operation.UpdateLoadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateLoadMutation, Operation.UpdateLoadMutationVariables>(UpdateLoadDocument, options);
      }
export type UpdateLoadMutationHookResult = ReturnType<typeof useUpdateLoadMutation>;
export type UpdateLoadMutationResult = Apollo.MutationResult<Operation.UpdateLoadMutation>;
export type UpdateLoadMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateLoadMutation, Operation.UpdateLoadMutationVariables>;
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
export const UpdatePlaneDocument = gql`
    mutation UpdatePlane($id: Int!, $name: String!, $registration: String!, $minSlots: Int!, $maxSlots: Int!, $hours: Int, $nextMaintenanceHours: Int) {
  updatePlane(
    input: {id: $id, attributes: {name: $name, registration: $registration, minSlots: $minSlots, maxSlots: $maxSlots, hours: $hours, nextMaintenanceHours: $nextMaintenanceHours}}
  ) {
    plane {
      ...planeEssentials
      dropzone {
        id
        name
        planes {
          id
          name
          registration
          minSlots
          maxSlots
          hours
          nextMaintenanceHours
        }
      }
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${PlaneEssentialsFragmentDoc}`;
export type UpdatePlaneMutationFn = Apollo.MutationFunction<Operation.UpdatePlaneMutation, Operation.UpdatePlaneMutationVariables>;

/**
 * __useUpdatePlaneMutation__
 *
 * To run a mutation, you first call `useUpdatePlaneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlaneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlaneMutation, { data, loading, error }] = useUpdatePlaneMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      registration: // value for 'registration'
 *      minSlots: // value for 'minSlots'
 *      maxSlots: // value for 'maxSlots'
 *      hours: // value for 'hours'
 *      nextMaintenanceHours: // value for 'nextMaintenanceHours'
 *   },
 * });
 */
export function useUpdatePlaneMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdatePlaneMutation, Operation.UpdatePlaneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdatePlaneMutation, Operation.UpdatePlaneMutationVariables>(UpdatePlaneDocument, options);
      }
export type UpdatePlaneMutationHookResult = ReturnType<typeof useUpdatePlaneMutation>;
export type UpdatePlaneMutationResult = Apollo.MutationResult<Operation.UpdatePlaneMutation>;
export type UpdatePlaneMutationOptions = Apollo.BaseMutationOptions<Operation.UpdatePlaneMutation, Operation.UpdatePlaneMutationVariables>;
export const UpdateRigDocument = gql`
    mutation UpdateRig($id: Int!, $name: String, $make: String, $model: String, $serial: String, $isPublic: Boolean, $rigType: String, $canopySize: Int, $packingCard: String, $repackExpiresAt: Int, $userId: Int, $dropzoneId: Int) {
  updateRig(
    input: {id: $id, attributes: {name: $name, make: $make, packingCard: $packingCard, isPublic: $isPublic, model: $model, serial: $serial, repackExpiresAt: $repackExpiresAt, dropzoneId: $dropzoneId, userId: $userId, canopySize: $canopySize, rigType: $rigType}}
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
 *      isPublic: // value for 'isPublic'
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
export const UpdateRigInspectionTemplateDocument = gql`
    mutation UpdateRigInspectionTemplate($dropzoneId: Int, $formId: Int, $definition: String) {
  updateFormTemplate(
    input: {id: $formId, attributes: {dropzoneId: $dropzoneId, definition: $definition}}
  ) {
    formTemplate {
      id
      name
      definition
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    `;
export type UpdateRigInspectionTemplateMutationFn = Apollo.MutationFunction<Operation.UpdateRigInspectionTemplateMutation, Operation.UpdateRigInspectionTemplateMutationVariables>;

/**
 * __useUpdateRigInspectionTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateRigInspectionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRigInspectionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRigInspectionTemplateMutation, { data, loading, error }] = useUpdateRigInspectionTemplateMutation({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      formId: // value for 'formId'
 *      definition: // value for 'definition'
 *   },
 * });
 */
export function useUpdateRigInspectionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateRigInspectionTemplateMutation, Operation.UpdateRigInspectionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateRigInspectionTemplateMutation, Operation.UpdateRigInspectionTemplateMutationVariables>(UpdateRigInspectionTemplateDocument, options);
      }
export type UpdateRigInspectionTemplateMutationHookResult = ReturnType<typeof useUpdateRigInspectionTemplateMutation>;
export type UpdateRigInspectionTemplateMutationResult = Apollo.MutationResult<Operation.UpdateRigInspectionTemplateMutation>;
export type UpdateRigInspectionTemplateMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateRigInspectionTemplateMutation, Operation.UpdateRigInspectionTemplateMutationVariables>;
export const UpdateRoleDocument = gql`
    mutation UpdateRole($roleId: Int!, $permissionName: String!, $enabled: Boolean!) {
  updateRole(input: {id: $roleId, permission: $permissionName, enabled: $enabled}) {
    role {
      id
      name
      permissions
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    `;
export type UpdateRoleMutationFn = Apollo.MutationFunction<Operation.UpdateRoleMutation, Operation.UpdateRoleMutationVariables>;

/**
 * __useUpdateRoleMutation__
 *
 * To run a mutation, you first call `useUpdateRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRoleMutation, { data, loading, error }] = useUpdateRoleMutation({
 *   variables: {
 *      roleId: // value for 'roleId'
 *      permissionName: // value for 'permissionName'
 *      enabled: // value for 'enabled'
 *   },
 * });
 */
export function useUpdateRoleMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateRoleMutation, Operation.UpdateRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateRoleMutation, Operation.UpdateRoleMutationVariables>(UpdateRoleDocument, options);
      }
export type UpdateRoleMutationHookResult = ReturnType<typeof useUpdateRoleMutation>;
export type UpdateRoleMutationResult = Apollo.MutationResult<Operation.UpdateRoleMutation>;
export type UpdateRoleMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateRoleMutation, Operation.UpdateRoleMutationVariables>;
export const UpdateTicketTypeDocument = gql`
    mutation UpdateTicketType($id: Int!, $name: String, $cost: Float, $altitude: Int, $allowManifestingSelf: Boolean, $isTandem: Boolean, $extraIds: [Int!]) {
  updateTicketType(
    input: {id: $id, attributes: {name: $name, cost: $cost, altitude: $altitude, allowManifestingSelf: $allowManifestingSelf, isTandem: $isTandem, extraIds: $extraIds}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    ticketType {
      ...ticketTypeEssentials
      id
      name
      altitude
      cost
      allowManifestingSelf
      extras {
        id
        name
        cost
      }
      dropzone {
        ...dropzoneEssentials
        ticketTypes {
          ...ticketTypeEssentials
        }
      }
    }
  }
}
    ${TicketTypeEssentialsFragmentDoc}
${DropzoneEssentialsFragmentDoc}`;
export type UpdateTicketTypeMutationFn = Apollo.MutationFunction<Operation.UpdateTicketTypeMutation, Operation.UpdateTicketTypeMutationVariables>;

/**
 * __useUpdateTicketTypeMutation__
 *
 * To run a mutation, you first call `useUpdateTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTicketTypeMutation, { data, loading, error }] = useUpdateTicketTypeMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      cost: // value for 'cost'
 *      altitude: // value for 'altitude'
 *      allowManifestingSelf: // value for 'allowManifestingSelf'
 *      isTandem: // value for 'isTandem'
 *      extraIds: // value for 'extraIds'
 *   },
 * });
 */
export function useUpdateTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateTicketTypeMutation, Operation.UpdateTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateTicketTypeMutation, Operation.UpdateTicketTypeMutationVariables>(UpdateTicketTypeDocument, options);
      }
export type UpdateTicketTypeMutationHookResult = ReturnType<typeof useUpdateTicketTypeMutation>;
export type UpdateTicketTypeMutationResult = Apollo.MutationResult<Operation.UpdateTicketTypeMutation>;
export type UpdateTicketTypeMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateTicketTypeMutation, Operation.UpdateTicketTypeMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($dropzoneUser: Int, $name: String, $phone: String, $email: String, $image: String, $pushToken: String, $nickname: String, $license: Int, $exitWeight: Float) {
  updateUser(
    input: {dropzoneUser: $dropzoneUser, attributes: {pushToken: $pushToken, name: $name, phone: $phone, email: $email, image: $image, nickname: $nickname, license: $license, exitWeight: $exitWeight}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    dropzoneUser {
      ...dropzoneUserDetails
    }
  }
}
    ${DropzoneUserDetailsFragmentDoc}`;
export type UpdateUserMutationFn = Apollo.MutationFunction<Operation.UpdateUserMutation, Operation.UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      dropzoneUser: // value for 'dropzoneUser'
 *      name: // value for 'name'
 *      phone: // value for 'phone'
 *      email: // value for 'email'
 *      image: // value for 'image'
 *      pushToken: // value for 'pushToken'
 *      nickname: // value for 'nickname'
 *      license: // value for 'license'
 *      exitWeight: // value for 'exitWeight'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateUserMutation, Operation.UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateUserMutation, Operation.UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<Operation.UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateUserMutation, Operation.UpdateUserMutationVariables>;
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
export const ActivityDocument = gql`
    query Activity($dropzone: [Int!], $levels: [EventLevel!], $actions: [EventAction!], $accessLevels: [EventAccessLevel!], $timeRange: TimeRangeInput, $createdBy: [Int!]) {
  activity(
    dropzone: $dropzone
    timeRange: $timeRange
    accessLevels: $accessLevels
    levels: $levels
    actions: $actions
    createdBy: $createdBy
  ) {
    edges {
      node {
        ...activityEssentials
      }
    }
  }
}
    ${ActivityEssentialsFragmentDoc}`;

/**
 * __useActivityQuery__
 *
 * To run a query within a React component, call `useActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityQuery({
 *   variables: {
 *      dropzone: // value for 'dropzone'
 *      levels: // value for 'levels'
 *      actions: // value for 'actions'
 *      accessLevels: // value for 'accessLevels'
 *      timeRange: // value for 'timeRange'
 *      createdBy: // value for 'createdBy'
 *   },
 * });
 */
export function useActivityQuery(baseOptions?: Apollo.QueryHookOptions<Operation.ActivityQuery, Operation.ActivityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.ActivityQuery, Operation.ActivityQueryVariables>(ActivityDocument, options);
      }
export function useActivityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.ActivityQuery, Operation.ActivityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.ActivityQuery, Operation.ActivityQueryVariables>(ActivityDocument, options);
        }
export type ActivityQueryHookResult = ReturnType<typeof useActivityQuery>;
export type ActivityLazyQueryHookResult = ReturnType<typeof useActivityLazyQuery>;
export type ActivityQueryResult = Apollo.QueryResult<Operation.ActivityQuery, Operation.ActivityQueryVariables>;
export const ActivityDetailsDocument = gql`
    query ActivityDetails($dropzone: [Int!], $levels: [EventLevel!], $actions: [EventAction!], $accessLevels: [EventAccessLevel!], $timeRange: TimeRangeInput, $createdBy: [Int!], $after: String) {
  activity(
    dropzone: $dropzone
    timeRange: $timeRange
    accessLevels: $accessLevels
    levels: $levels
    actions: $actions
    createdBy: $createdBy
    after: $after
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...activityDetails
      }
    }
  }
}
    ${ActivityDetailsFragmentDoc}`;

/**
 * __useActivityDetailsQuery__
 *
 * To run a query within a React component, call `useActivityDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivityDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityDetailsQuery({
 *   variables: {
 *      dropzone: // value for 'dropzone'
 *      levels: // value for 'levels'
 *      actions: // value for 'actions'
 *      accessLevels: // value for 'accessLevels'
 *      timeRange: // value for 'timeRange'
 *      createdBy: // value for 'createdBy'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useActivityDetailsQuery(baseOptions?: Apollo.QueryHookOptions<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>(ActivityDetailsDocument, options);
      }
export function useActivityDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>(ActivityDetailsDocument, options);
        }
export type ActivityDetailsQueryHookResult = ReturnType<typeof useActivityDetailsQuery>;
export type ActivityDetailsLazyQueryHookResult = ReturnType<typeof useActivityDetailsLazyQuery>;
export type ActivityDetailsQueryResult = Apollo.QueryResult<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>;
export const DropzoneDocument = gql`
    query Dropzone($dropzoneId: Int!, $earliestTimestamp: ISO8601DateTime) {
  dropzone(id: $dropzoneId) {
    ...dropzoneExtensive
  }
}
    ${DropzoneExtensiveFragmentDoc}`;

/**
 * __useDropzoneQuery__
 *
 * To run a query within a React component, call `useDropzoneQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzoneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzoneQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      earliestTimestamp: // value for 'earliestTimestamp'
 *   },
 * });
 */
export function useDropzoneQuery(baseOptions: Apollo.QueryHookOptions<Operation.DropzoneQuery, Operation.DropzoneQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzoneQuery, Operation.DropzoneQueryVariables>(DropzoneDocument, options);
      }
export function useDropzoneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzoneQuery, Operation.DropzoneQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzoneQuery, Operation.DropzoneQueryVariables>(DropzoneDocument, options);
        }
export type DropzoneQueryHookResult = ReturnType<typeof useDropzoneQuery>;
export type DropzoneLazyQueryHookResult = ReturnType<typeof useDropzoneLazyQuery>;
export type DropzoneQueryResult = Apollo.QueryResult<Operation.DropzoneQuery, Operation.DropzoneQueryVariables>;
export const DropzoneStatisticsDocument = gql`
    query DropzoneStatistics($dropzoneId: Int!, $timeRange: TimeRangeInput) {
  dropzone(id: $dropzoneId) {
    ...dropzoneStatistics
  }
}
    ${DropzoneStatisticsFragmentDoc}`;

/**
 * __useDropzoneStatisticsQuery__
 *
 * To run a query within a React component, call `useDropzoneStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzoneStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzoneStatisticsQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      timeRange: // value for 'timeRange'
 *   },
 * });
 */
export function useDropzoneStatisticsQuery(baseOptions: Apollo.QueryHookOptions<Operation.DropzoneStatisticsQuery, Operation.DropzoneStatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzoneStatisticsQuery, Operation.DropzoneStatisticsQueryVariables>(DropzoneStatisticsDocument, options);
      }
export function useDropzoneStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzoneStatisticsQuery, Operation.DropzoneStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzoneStatisticsQuery, Operation.DropzoneStatisticsQueryVariables>(DropzoneStatisticsDocument, options);
        }
export type DropzoneStatisticsQueryHookResult = ReturnType<typeof useDropzoneStatisticsQuery>;
export type DropzoneStatisticsLazyQueryHookResult = ReturnType<typeof useDropzoneStatisticsLazyQuery>;
export type DropzoneStatisticsQueryResult = Apollo.QueryResult<Operation.DropzoneStatisticsQuery, Operation.DropzoneStatisticsQueryVariables>;
export const DropzonesStatisticsDocument = gql`
    query DropzonesStatistics($timeRange: TimeRangeInput, $after: String) {
  dropzones(after: $after) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
    }
    edges {
      cursor
      node {
        ...dropzoneStatistics
      }
    }
  }
}
    ${DropzoneStatisticsFragmentDoc}`;

/**
 * __useDropzonesStatisticsQuery__
 *
 * To run a query within a React component, call `useDropzonesStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzonesStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzonesStatisticsQuery({
 *   variables: {
 *      timeRange: // value for 'timeRange'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useDropzonesStatisticsQuery(baseOptions?: Apollo.QueryHookOptions<Operation.DropzonesStatisticsQuery, Operation.DropzonesStatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzonesStatisticsQuery, Operation.DropzonesStatisticsQueryVariables>(DropzonesStatisticsDocument, options);
      }
export function useDropzonesStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzonesStatisticsQuery, Operation.DropzonesStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzonesStatisticsQuery, Operation.DropzonesStatisticsQueryVariables>(DropzonesStatisticsDocument, options);
        }
export type DropzonesStatisticsQueryHookResult = ReturnType<typeof useDropzonesStatisticsQuery>;
export type DropzonesStatisticsLazyQueryHookResult = ReturnType<typeof useDropzonesStatisticsLazyQuery>;
export type DropzonesStatisticsQueryResult = Apollo.QueryResult<Operation.DropzonesStatisticsQuery, Operation.DropzonesStatisticsQueryVariables>;
export const DropzoneRigsDocument = gql`
    query DropzoneRigs($dropzoneId: Int!) {
  dropzone(id: $dropzoneId) {
    id
    rigs {
      ...rigEssentials
    }
  }
}
    ${RigEssentialsFragmentDoc}`;

/**
 * __useDropzoneRigsQuery__
 *
 * To run a query within a React component, call `useDropzoneRigsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzoneRigsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzoneRigsQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useDropzoneRigsQuery(baseOptions: Apollo.QueryHookOptions<Operation.DropzoneRigsQuery, Operation.DropzoneRigsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzoneRigsQuery, Operation.DropzoneRigsQueryVariables>(DropzoneRigsDocument, options);
      }
export function useDropzoneRigsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzoneRigsQuery, Operation.DropzoneRigsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzoneRigsQuery, Operation.DropzoneRigsQueryVariables>(DropzoneRigsDocument, options);
        }
export type DropzoneRigsQueryHookResult = ReturnType<typeof useDropzoneRigsQuery>;
export type DropzoneRigsLazyQueryHookResult = ReturnType<typeof useDropzoneRigsLazyQuery>;
export type DropzoneRigsQueryResult = Apollo.QueryResult<Operation.DropzoneRigsQuery, Operation.DropzoneRigsQueryVariables>;
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
export const DropzoneUsersDocument = gql`
    query DropzoneUsers($dropzoneId: Int!, $search: String, $permissions: [Permission!], $first: Int, $after: String, $licensed: Boolean) {
  dropzone(id: $dropzoneId) {
    id
    name
    dropzoneUsers(
      licensed: $licensed
      search: $search
      permissions: $permissions
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          ...dropzoneUserEssentials
        }
      }
    }
  }
}
    ${DropzoneUserEssentialsFragmentDoc}`;

/**
 * __useDropzoneUsersQuery__
 *
 * To run a query within a React component, call `useDropzoneUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzoneUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzoneUsersQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      search: // value for 'search'
 *      permissions: // value for 'permissions'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      licensed: // value for 'licensed'
 *   },
 * });
 */
export function useDropzoneUsersQuery(baseOptions: Apollo.QueryHookOptions<Operation.DropzoneUsersQuery, Operation.DropzoneUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzoneUsersQuery, Operation.DropzoneUsersQueryVariables>(DropzoneUsersDocument, options);
      }
export function useDropzoneUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzoneUsersQuery, Operation.DropzoneUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzoneUsersQuery, Operation.DropzoneUsersQueryVariables>(DropzoneUsersDocument, options);
        }
export type DropzoneUsersQueryHookResult = ReturnType<typeof useDropzoneUsersQuery>;
export type DropzoneUsersLazyQueryHookResult = ReturnType<typeof useDropzoneUsersLazyQuery>;
export type DropzoneUsersQueryResult = Apollo.QueryResult<Operation.DropzoneUsersQuery, Operation.DropzoneUsersQueryVariables>;
export const DropzoneUsersDetailedDocument = gql`
    query DropzoneUsersDetailed($dropzoneId: Int!, $search: String, $permissions: [Permission!], $first: Int, $after: String, $licensed: Boolean) {
  dropzone(id: $dropzoneId) {
    id
    name
    dropzoneUsers(
      licensed: $licensed
      search: $search
      permissions: $permissions
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          ...dropzoneUserDetails
        }
      }
    }
  }
}
    ${DropzoneUserDetailsFragmentDoc}`;

/**
 * __useDropzoneUsersDetailedQuery__
 *
 * To run a query within a React component, call `useDropzoneUsersDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzoneUsersDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzoneUsersDetailedQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      search: // value for 'search'
 *      permissions: // value for 'permissions'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      licensed: // value for 'licensed'
 *   },
 * });
 */
export function useDropzoneUsersDetailedQuery(baseOptions: Apollo.QueryHookOptions<Operation.DropzoneUsersDetailedQuery, Operation.DropzoneUsersDetailedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzoneUsersDetailedQuery, Operation.DropzoneUsersDetailedQueryVariables>(DropzoneUsersDetailedDocument, options);
      }
export function useDropzoneUsersDetailedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzoneUsersDetailedQuery, Operation.DropzoneUsersDetailedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzoneUsersDetailedQuery, Operation.DropzoneUsersDetailedQueryVariables>(DropzoneUsersDetailedDocument, options);
        }
export type DropzoneUsersDetailedQueryHookResult = ReturnType<typeof useDropzoneUsersDetailedQuery>;
export type DropzoneUsersDetailedLazyQueryHookResult = ReturnType<typeof useDropzoneUsersDetailedLazyQuery>;
export type DropzoneUsersDetailedQueryResult = Apollo.QueryResult<Operation.DropzoneUsersDetailedQuery, Operation.DropzoneUsersDetailedQueryVariables>;
export const QueryDropzoneUserProfileDocument = gql`
    query QueryDropzoneUserProfile($dropzoneId: Int!, $dropzoneUserId: Int!) {
  dropzone(id: $dropzoneId) {
    id
    name
    rigInspectionTemplate {
      id
      name
      definition
    }
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
export const DropzonesDocument = gql`
    query Dropzones($isPublic: Boolean, $requestedPublication: Boolean) {
  dropzones(isPublic: $isPublic, requestedPublication: $requestedPublication) {
    edges {
      node {
        ...dropzoneEssentials
      }
    }
  }
}
    ${DropzoneEssentialsFragmentDoc}`;

/**
 * __useDropzonesQuery__
 *
 * To run a query within a React component, call `useDropzonesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDropzonesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDropzonesQuery({
 *   variables: {
 *      isPublic: // value for 'isPublic'
 *      requestedPublication: // value for 'requestedPublication'
 *   },
 * });
 */
export function useDropzonesQuery(baseOptions?: Apollo.QueryHookOptions<Operation.DropzonesQuery, Operation.DropzonesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DropzonesQuery, Operation.DropzonesQueryVariables>(DropzonesDocument, options);
      }
export function useDropzonesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DropzonesQuery, Operation.DropzonesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DropzonesQuery, Operation.DropzonesQueryVariables>(DropzonesDocument, options);
        }
export type DropzonesQueryHookResult = ReturnType<typeof useDropzonesQuery>;
export type DropzonesLazyQueryHookResult = ReturnType<typeof useDropzonesLazyQuery>;
export type DropzonesQueryResult = Apollo.QueryResult<Operation.DropzonesQuery, Operation.DropzonesQueryVariables>;
export const TicketTypeExtrasDocument = gql`
    query TicketTypeExtras($dropzoneId: Int!) {
  extras(dropzone: $dropzoneId) {
    ...ticketTypeExtraDetailed
  }
}
    ${TicketTypeExtraDetailedFragmentDoc}`;

/**
 * __useTicketTypeExtrasQuery__
 *
 * To run a query within a React component, call `useTicketTypeExtrasQuery` and pass it any options that fit your needs.
 * When your component renders, `useTicketTypeExtrasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTicketTypeExtrasQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useTicketTypeExtrasQuery(baseOptions: Apollo.QueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>(TicketTypeExtrasDocument, options);
      }
export function useTicketTypeExtrasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>(TicketTypeExtrasDocument, options);
        }
export type TicketTypeExtrasQueryHookResult = ReturnType<typeof useTicketTypeExtrasQuery>;
export type TicketTypeExtrasLazyQueryHookResult = ReturnType<typeof useTicketTypeExtrasLazyQuery>;
export type TicketTypeExtrasQueryResult = Apollo.QueryResult<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>;
export const FederationsDocument = gql`
    query Federations {
  federations {
    ...federationEssentials
  }
}
    ${FederationEssentialsFragmentDoc}`;

/**
 * __useFederationsQuery__
 *
 * To run a query within a React component, call `useFederationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFederationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFederationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFederationsQuery(baseOptions?: Apollo.QueryHookOptions<Operation.FederationsQuery, Operation.FederationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.FederationsQuery, Operation.FederationsQueryVariables>(FederationsDocument, options);
      }
export function useFederationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.FederationsQuery, Operation.FederationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.FederationsQuery, Operation.FederationsQueryVariables>(FederationsDocument, options);
        }
export type FederationsQueryHookResult = ReturnType<typeof useFederationsQuery>;
export type FederationsLazyQueryHookResult = ReturnType<typeof useFederationsLazyQuery>;
export type FederationsQueryResult = Apollo.QueryResult<Operation.FederationsQuery, Operation.FederationsQueryVariables>;
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
export const JumpTypesDocument = gql`
    query JumpTypes($allowedForDropzoneUserIds: [Int!]) {
  jumpTypes(dropzoneUsers: $allowedForDropzoneUserIds) {
    ...jumpTypeEssentials
  }
}
    ${JumpTypeEssentialsFragmentDoc}`;

/**
 * __useJumpTypesQuery__
 *
 * To run a query within a React component, call `useJumpTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useJumpTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJumpTypesQuery({
 *   variables: {
 *      allowedForDropzoneUserIds: // value for 'allowedForDropzoneUserIds'
 *   },
 * });
 */
export function useJumpTypesQuery(baseOptions?: Apollo.QueryHookOptions<Operation.JumpTypesQuery, Operation.JumpTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.JumpTypesQuery, Operation.JumpTypesQueryVariables>(JumpTypesDocument, options);
      }
export function useJumpTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.JumpTypesQuery, Operation.JumpTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.JumpTypesQuery, Operation.JumpTypesQueryVariables>(JumpTypesDocument, options);
        }
export type JumpTypesQueryHookResult = ReturnType<typeof useJumpTypesQuery>;
export type JumpTypesLazyQueryHookResult = ReturnType<typeof useJumpTypesLazyQuery>;
export type JumpTypesQueryResult = Apollo.QueryResult<Operation.JumpTypesQuery, Operation.JumpTypesQueryVariables>;
export const AllowedJumpTypesDocument = gql`
    query AllowedJumpTypes($dropzoneId: Int!, $allowedForDropzoneUserIds: [Int!]!, $isPublic: Boolean) {
  dropzone(id: $dropzoneId) {
    id
    allowedJumpTypes(userId: $allowedForDropzoneUserIds) {
      ...jumpTypeEssentials
    }
    ticketTypes(isPublic: $isPublic) {
      ...ticketTypeEssentials
    }
  }
  jumpTypes {
    ...jumpTypeEssentials
  }
}
    ${JumpTypeEssentialsFragmentDoc}
${TicketTypeEssentialsFragmentDoc}`;

/**
 * __useAllowedJumpTypesQuery__
 *
 * To run a query within a React component, call `useAllowedJumpTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllowedJumpTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllowedJumpTypesQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      allowedForDropzoneUserIds: // value for 'allowedForDropzoneUserIds'
 *      isPublic: // value for 'isPublic'
 *   },
 * });
 */
export function useAllowedJumpTypesQuery(baseOptions: Apollo.QueryHookOptions<Operation.AllowedJumpTypesQuery, Operation.AllowedJumpTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AllowedJumpTypesQuery, Operation.AllowedJumpTypesQueryVariables>(AllowedJumpTypesDocument, options);
      }
export function useAllowedJumpTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AllowedJumpTypesQuery, Operation.AllowedJumpTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AllowedJumpTypesQuery, Operation.AllowedJumpTypesQueryVariables>(AllowedJumpTypesDocument, options);
        }
export type AllowedJumpTypesQueryHookResult = ReturnType<typeof useAllowedJumpTypesQuery>;
export type AllowedJumpTypesLazyQueryHookResult = ReturnType<typeof useAllowedJumpTypesLazyQuery>;
export type AllowedJumpTypesQueryResult = Apollo.QueryResult<Operation.AllowedJumpTypesQuery, Operation.AllowedJumpTypesQueryVariables>;
export const LicensesDocument = gql`
    query Licenses($federationId: Int) {
  licenses(federationId: $federationId) {
    ...licenseDetails
  }
}
    ${LicenseDetailsFragmentDoc}`;

/**
 * __useLicensesQuery__
 *
 * To run a query within a React component, call `useLicensesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLicensesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLicensesQuery({
 *   variables: {
 *      federationId: // value for 'federationId'
 *   },
 * });
 */
export function useLicensesQuery(baseOptions?: Apollo.QueryHookOptions<Operation.LicensesQuery, Operation.LicensesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.LicensesQuery, Operation.LicensesQueryVariables>(LicensesDocument, options);
      }
export function useLicensesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.LicensesQuery, Operation.LicensesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.LicensesQuery, Operation.LicensesQueryVariables>(LicensesDocument, options);
        }
export type LicensesQueryHookResult = ReturnType<typeof useLicensesQuery>;
export type LicensesLazyQueryHookResult = ReturnType<typeof useLicensesLazyQuery>;
export type LicensesQueryResult = Apollo.QueryResult<Operation.LicensesQuery, Operation.LicensesQueryVariables>;
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
export const PlanesDocument = gql`
    query Planes($dropzoneId: Int!) {
  planes(dropzoneId: $dropzoneId) {
    ...planeEssentials
  }
}
    ${PlaneEssentialsFragmentDoc}`;

/**
 * __usePlanesQuery__
 *
 * To run a query within a React component, call `usePlanesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlanesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlanesQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function usePlanesQuery(baseOptions: Apollo.QueryHookOptions<Operation.PlanesQuery, Operation.PlanesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.PlanesQuery, Operation.PlanesQueryVariables>(PlanesDocument, options);
      }
export function usePlanesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.PlanesQuery, Operation.PlanesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.PlanesQuery, Operation.PlanesQueryVariables>(PlanesDocument, options);
        }
export type PlanesQueryHookResult = ReturnType<typeof usePlanesQuery>;
export type PlanesLazyQueryHookResult = ReturnType<typeof usePlanesLazyQuery>;
export type PlanesQueryResult = Apollo.QueryResult<Operation.PlanesQuery, Operation.PlanesQueryVariables>;
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
        ...roleEssentials
      }
      permissions
    }
  }
}
    ${RoleEssentialsFragmentDoc}`;

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
export const RigInspectionTemplateDocument = gql`
    query RigInspectionTemplate($dropzoneId: Int!) {
  dropzone(id: $dropzoneId) {
    id
    rigInspectionTemplate {
      id
      name
      definition
    }
  }
}
    `;

/**
 * __useRigInspectionTemplateQuery__
 *
 * To run a query within a React component, call `useRigInspectionTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useRigInspectionTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRigInspectionTemplateQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *   },
 * });
 */
export function useRigInspectionTemplateQuery(baseOptions: Apollo.QueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>(RigInspectionTemplateDocument, options);
      }
export function useRigInspectionTemplateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>(RigInspectionTemplateDocument, options);
        }
export type RigInspectionTemplateQueryHookResult = ReturnType<typeof useRigInspectionTemplateQuery>;
export type RigInspectionTemplateLazyQueryHookResult = ReturnType<typeof useRigInspectionTemplateLazyQuery>;
export type RigInspectionTemplateQueryResult = Apollo.QueryResult<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>;
export const AvailableRigsDocument = gql`
    query AvailableRigs($dropzoneUserId: Int!, $isTandem: Boolean, $loadId: Int) {
  availableRigs(
    dropzoneUser: $dropzoneUserId
    isTandem: $isTandem
    loadId: $loadId
  ) {
    ...userRigDetailed
  }
}
    ${UserRigDetailedFragmentDoc}`;

/**
 * __useAvailableRigsQuery__
 *
 * To run a query within a React component, call `useAvailableRigsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailableRigsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableRigsQuery({
 *   variables: {
 *      dropzoneUserId: // value for 'dropzoneUserId'
 *      isTandem: // value for 'isTandem'
 *      loadId: // value for 'loadId'
 *   },
 * });
 */
export function useAvailableRigsQuery(baseOptions: Apollo.QueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>(AvailableRigsDocument, options);
      }
export function useAvailableRigsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>(AvailableRigsDocument, options);
        }
export type AvailableRigsQueryHookResult = ReturnType<typeof useAvailableRigsQuery>;
export type AvailableRigsLazyQueryHookResult = ReturnType<typeof useAvailableRigsLazyQuery>;
export type AvailableRigsQueryResult = Apollo.QueryResult<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>;
export const RolesDocument = gql`
    query Roles($dropzoneId: Int!, $selectable: Boolean) {
  dropzone(id: $dropzoneId) {
    id
    roles(selectable: $selectable) {
      ...roleDetailed
    }
  }
}
    ${RoleDetailedFragmentDoc}`;

/**
 * __useRolesQuery__
 *
 * To run a query within a React component, call `useRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRolesQuery({
 *   variables: {
 *      dropzoneId: // value for 'dropzoneId'
 *      selectable: // value for 'selectable'
 *   },
 * });
 */
export function useRolesQuery(baseOptions: Apollo.QueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.RolesQuery, Operation.RolesQueryVariables>(RolesDocument, options);
      }
export function useRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.RolesQuery, Operation.RolesQueryVariables>(RolesDocument, options);
        }
export type RolesQueryHookResult = ReturnType<typeof useRolesQuery>;
export type RolesLazyQueryHookResult = ReturnType<typeof useRolesLazyQuery>;
export type RolesQueryResult = Apollo.QueryResult<Operation.RolesQuery, Operation.RolesQueryVariables>;
export const AllowedTicketTypesDocument = gql`
    query AllowedTicketTypes($dropzone: Int!, $onlyPublicTickets: Boolean) {
  dropzone(id: $dropzone) {
    id
    ticketTypes(isPublic: $onlyPublicTickets) {
      ...ticketTypeEssentials
      extras {
        id
        cost
        name
      }
    }
  }
}
    ${TicketTypeEssentialsFragmentDoc}`;

/**
 * __useAllowedTicketTypesQuery__
 *
 * To run a query within a React component, call `useAllowedTicketTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllowedTicketTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllowedTicketTypesQuery({
 *   variables: {
 *      dropzone: // value for 'dropzone'
 *      onlyPublicTickets: // value for 'onlyPublicTickets'
 *   },
 * });
 */
export function useAllowedTicketTypesQuery(baseOptions: Apollo.QueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>(AllowedTicketTypesDocument, options);
      }
export function useAllowedTicketTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>(AllowedTicketTypesDocument, options);
        }
export type AllowedTicketTypesQueryHookResult = ReturnType<typeof useAllowedTicketTypesQuery>;
export type AllowedTicketTypesLazyQueryHookResult = ReturnType<typeof useAllowedTicketTypesLazyQuery>;
export type AllowedTicketTypesQueryResult = Apollo.QueryResult<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>;
export const TicketTypesDocument = gql`
    query TicketTypes($dropzone: Int!, $allowManifestingSelf: Boolean) {
  ticketTypes(dropzone: $dropzone, allowManifestingSelf: $allowManifestingSelf) {
    ...ticketTypeEssentials
  }
}
    ${TicketTypeEssentialsFragmentDoc}`;

/**
 * __useTicketTypesQuery__
 *
 * To run a query within a React component, call `useTicketTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTicketTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTicketTypesQuery({
 *   variables: {
 *      dropzone: // value for 'dropzone'
 *      allowManifestingSelf: // value for 'allowManifestingSelf'
 *   },
 * });
 */
export function useTicketTypesQuery(baseOptions: Apollo.QueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>(TicketTypesDocument, options);
      }
export function useTicketTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>(TicketTypesDocument, options);
        }
export type TicketTypesQueryHookResult = ReturnType<typeof useTicketTypesQuery>;
export type TicketTypesLazyQueryHookResult = ReturnType<typeof useTicketTypesLazyQuery>;
export type TicketTypesQueryResult = Apollo.QueryResult<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>;