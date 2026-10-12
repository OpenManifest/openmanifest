/* eslint-disable */
import * as Operation from './operations';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const RoleEssentialsFragmentDoc = gql`
    fragment roleEssentials on UserRole {
  id
  name
  operatorId
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
  bodyMassKg
  moderationRole
  image
  apfNumber
}
    `;
export const MembershipEssentialsFragmentDoc = gql`
    fragment membershipEssentials on Membership {
  id
  walletId
  expiresAt
  hasCredits
  hasMembership
  hasLicense
  hasBodyMassKg
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
    ...membershipEssentials
  }
}
    ${MembershipEssentialsFragmentDoc}`;
export const OperatorEssentialsFragmentDoc = gql`
    fragment operatorEssentials on Operator {
  id
  walletId
  lat
  lng
  name
  status: state
  primaryColor
  secondaryColor
  banner
  isCreditSystemEnabled
  createdAt
  timeZone
  terminology
  industry
  modules
  settings {
    allowManifestBypass
    allowNegativeCredits
    allowDoubleManifesting
    allowSelfManifest
    requireCredits
    requireLicense
    requireMembership
    requireRigInspection
    requireEquipment
    requireReserveInDate
  }
}
    `;
export const LoadEssentialsFragmentDoc = gql`
    fragment loadEssentials on Load {
  id
  lockVersion
  name
  createdAt
  dispatchAt
  hasCompleted
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
  costCents
  isTandem
  allowManifestingSelf
}
    `;
export const TicketTypeAddonEssentialsFragmentDoc = gql`
    fragment ticketTypeAddonEssentials on Extra {
  id
  name
  costCents
}
    `;
export const TicketTypeDetailsFragmentDoc = gql`
    fragment ticketTypeDetails on TicketType {
  ...ticketTypeEssentials
  extras {
    ...ticketTypeAddonEssentials
  }
}
    ${TicketTypeEssentialsFragmentDoc}
${TicketTypeAddonEssentialsFragmentDoc}`;
export const ActivityTypeEssentialsFragmentDoc = gql`
    fragment activityTypeEssentials on ActivityType {
  id
  name
}
    `;
export const SlotEssentialsFragmentDoc = gql`
    fragment slotEssentials on Slot {
  id
  lockVersion
  createdAt
  bodyMassKg
  guestName
  guestBodyMassKg
  wingLoading
  groupNumber
  costCents
  ticketType {
    ...ticketTypeDetails
  }
  activityType {
    ...activityTypeEssentials
  }
  extras {
    id
    name
  }
}
    ${TicketTypeDetailsFragmentDoc}
${ActivityTypeEssentialsFragmentDoc}`;
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
  operator {
    id
  }
}
    `;
export const VehicleEssentialsFragmentDoc = gql`
    fragment vehicleEssentials on Vehicle {
  id
  minCapacity
  capacity
  name
  registration
}
    `;
export const ActivityDetailsFragmentDoc = gql`
    fragment activityDetails on Event {
  ...activityEssentials
  resource {
    ... on Operator {
      ...operatorEssentials
    }
    ... on Membership {
      ...membershipEssentials
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
    ... on Vehicle {
      ...vehicleEssentials
    }
  }
}
    ${ActivityEssentialsFragmentDoc}
${OperatorEssentialsFragmentDoc}
${MembershipEssentialsFragmentDoc}
${LoadEssentialsFragmentDoc}
${SlotEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${VehicleEssentialsFragmentDoc}`;
export const DailyLogUserFragmentDoc = gql`
    fragment dailyLogUser on DailyLogUser {
  id
  email
  name
  nickname
  phone
}
    `;
export const DailyLogVehicleFragmentDoc = gql`
    fragment dailyLogVehicle on DailyLogVehicle {
  id
  name
  registration
}
    `;
export const DailyLogSlotFragmentDoc = gql`
    fragment dailyLogSlot on DailyLogSlot {
  id
  altitude
  activityType
  name
}
    `;
export const DailyLogLoadFragmentDoc = gql`
    fragment dailyLogLoad on DailyLogLoad {
  id
  loadNumber
  dispatchAt
  vehicle {
    ...dailyLogVehicle
  }
  gca {
    ...dailyLogUser
  }
  pilot {
    ...dailyLogUser
  }
  loadMaster {
    ...dailyLogUser
  }
  slots {
    ...dailyLogSlot
  }
}
    ${DailyLogVehicleFragmentDoc}
${DailyLogUserFragmentDoc}
${DailyLogSlotFragmentDoc}`;
export const LocationFragmentDoc = gql`
    fragment location on GeocodedLocation {
  id
  lat
  lng
  formattedString
}
    `;
export const DailyLogEntryFragmentDoc = gql`
    fragment dailyLogEntry on DailyLogEntry {
  id
  date
  notes
  downloadUrl
  dutyOfficer {
    ...dailyLogUser
  }
  loads {
    ...dailyLogLoad
  }
  location {
    ...location
  }
}
    ${DailyLogUserFragmentDoc}
${DailyLogLoadFragmentDoc}
${LocationFragmentDoc}`;
export const TicketTypeExtraEssentialsFragmentDoc = gql`
    fragment ticketTypeExtraEssentials on Extra {
  id
  name
  createdAt
  costCents
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
export const MembershipDetailsFragmentDoc = gql`
    fragment membershipDetails on Membership {
  ...membershipEssentials
  creditsCents
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
    ${MembershipEssentialsFragmentDoc}
${LicenseDetailsFragmentDoc}
${UserDetailedFragmentDoc}
${RigEssentialsFragmentDoc}`;
export const RigInspectionEssentialsFragmentDoc = gql`
    fragment rigInspectionEssentials on RigInspection {
  id
  isOk
  definition
  inspectedBy {
    ...membershipEssentials
  }
  rig {
    ...rigEssentials
  }
}
    ${MembershipEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}`;
export const TransactionEssentialsFragmentDoc = gql`
    fragment transactionEssentials on Transaction {
  id
  transactionType
  amountCents
  status
  createdAt
  message
  sender {
    ... on Membership {
      id
      user {
        id
        name
      }
    }
    ... on Operator {
      id
      name
    }
  }
  receiver {
    ... on Membership {
      id
      user {
        id
        name
      }
    }
    ... on Operator {
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
  amountCents
  title
  orderNumber
  createdAt
  buyer {
    ... on Membership {
      ...membershipDetails
    }
    ... on Operator {
      id
      name
      banner
    }
  }
  seller {
    ... on Membership {
      ...membershipDetails
    }
    ... on Operator {
      ...operatorEssentials
    }
  }
  item {
    title
    costCents
    ... on Slot {
      id
      ticketType {
        id
        name
        costCents
      }
      extras {
        id
        name
        costCents
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
    ${MembershipDetailsFragmentDoc}
${OperatorEssentialsFragmentDoc}
${ReceiptEssentialsFragmentDoc}`;
export const SlotDetailsFragmentDoc = gql`
    fragment slotDetails on Slot {
  ...slotEssentials
  rig {
    ...rigEssentials
  }
  membership {
    ...membershipEssentials
  }
}
    ${SlotEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${MembershipEssentialsFragmentDoc}`;
export const UserSlotDetailsFragmentDoc = gql`
    fragment userSlotDetails on Slot {
  ...slotDetails
  load {
    ...loadEssentials
  }
}
    ${SlotDetailsFragmentDoc}
${LoadEssentialsFragmentDoc}`;
export const MembershipProfileFragmentDoc = gql`
    fragment membershipProfile on Membership {
  ...membershipDetails
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
    ${MembershipDetailsFragmentDoc}
${RigInspectionEssentialsFragmentDoc}
${OrderEssentialsFragmentDoc}
${UserSlotDetailsFragmentDoc}`;
export const OperatorStatisticsEssentialsFragmentDoc = gql`
    fragment operatorStatisticsEssentials on Statistics {
  id
  activeUserCount
  totalUserCount
  slotsByActivityType(timeRange: $timeRange) {
    name
    count
  }
  slotsCount(timeRange: $timeRange)
  cancelledLoadsCount(timeRange: $timeRange)
  dutyOfficerCount
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
export const OperatorStatisticsFragmentDoc = gql`
    fragment operatorStatistics on Operator {
  ...operatorEssentials
  statistics {
    ...operatorStatisticsEssentials
  }
}
    ${OperatorEssentialsFragmentDoc}
${OperatorStatisticsEssentialsFragmentDoc}`;
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
export const OperatorDetailedFragmentDoc = gql`
    fragment operatorDetailed on Operator {
  ...operatorEssentials
  federation {
    id
    name
    slug
  }
  currentConditions {
    ...weatherConditionEssentials
  }
}
    ${OperatorEssentialsFragmentDoc}
${WeatherConditionEssentialsFragmentDoc}`;
export const CurrentUserEssentialsFragmentDoc = gql`
    fragment currentUserEssentials on Membership {
  id
  walletId
  creditsCents
  hasCredits
  hasBodyMassKg
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
  memberships {
    ...membershipDetails
  }
  pushToken
}
    ${UserDetailedFragmentDoc}
${MembershipDetailsFragmentDoc}`;
export const CurrentUserDetailedFragmentDoc = gql`
    fragment currentUserDetailed on Membership {
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
    ...licenseDetails
  }
  user {
    ...currentUser
  }
}
    ${CurrentUserEssentialsFragmentDoc}
${RigInspectionEssentialsFragmentDoc}
${OrderEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${LicenseDetailsFragmentDoc}
${CurrentUserFragmentDoc}`;
export const OperatorExtensiveFragmentDoc = gql`
    fragment operatorExtensive on Operator {
  ...operatorDetailed
  currentUser {
    ...currentUserDetailed
  }
}
    ${OperatorDetailedFragmentDoc}
${CurrentUserDetailedFragmentDoc}`;
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
  membership {
    ...membershipEssentials
    rigInspections {
      ...rigInspectionEssentials
    }
  }
}
    ${RigInspectionDetailedFragmentDoc}
${MembershipEssentialsFragmentDoc}
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
  vehicle {
    ...vehicleEssentials
  }
  gca {
    ...membershipEssentials
  }
  pilot {
    ...membershipEssentials
  }
  loadMaster {
    ...membershipEssentials
  }
  slots {
    ...slotDetails
  }
}
    ${LoadEssentialsFragmentDoc}
${VehicleEssentialsFragmentDoc}
${MembershipEssentialsFragmentDoc}
${SlotDetailsFragmentDoc}`;
export const SlotExhaustiveFragmentDoc = gql`
    fragment slotExhaustive on Slot {
  ...slotDetails
  membership {
    ...membershipDetails
  }
  load {
    ...loadDetails
  }
  rig {
    ...rigEssentials
  }
}
    ${SlotDetailsFragmentDoc}
${MembershipDetailsFragmentDoc}
${LoadDetailsFragmentDoc}
${RigEssentialsFragmentDoc}`;
export const TicketTypeAddonDetailsFragmentDoc = gql`
    fragment ticketTypeAddonDetails on Extra {
  ...ticketTypeAddonEssentials
  ticketTypes {
    ...ticketTypeEssentials
  }
}
    ${TicketTypeAddonEssentialsFragmentDoc}
${TicketTypeEssentialsFragmentDoc}`;
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
    membership {
      ...membershipEssentials
    }
  }
}
    ${MembershipEssentialsFragmentDoc}`;
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
export const ArchiveVehicleDocument = gql`
    mutation ArchiveVehicle($id: Int!) {
  deleteVehicle(input: {id: $id}) {
    fieldErrors {
      field
      message
    }
    errors
    vehicle {
      ...vehicleEssentials
    }
  }
}
    ${VehicleEssentialsFragmentDoc}`;
export type ArchiveVehicleMutationFn = Apollo.MutationFunction<Operation.ArchiveVehicleMutation, Operation.ArchiveVehicleMutationVariables>;

/**
 * __useArchiveVehicleMutation__
 *
 * To run a mutation, you first call `useArchiveVehicleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveVehicleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveVehicleMutation, { data, loading, error }] = useArchiveVehicleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveVehicleMutation(baseOptions?: Apollo.MutationHookOptions<Operation.ArchiveVehicleMutation, Operation.ArchiveVehicleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.ArchiveVehicleMutation, Operation.ArchiveVehicleMutationVariables>(ArchiveVehicleDocument, options);
      }
export type ArchiveVehicleMutationHookResult = ReturnType<typeof useArchiveVehicleMutation>;
export type ArchiveVehicleMutationResult = Apollo.MutationResult<Operation.ArchiveVehicleMutation>;
export type ArchiveVehicleMutationOptions = Apollo.BaseMutationOptions<Operation.ArchiveVehicleMutation, Operation.ArchiveVehicleMutationVariables>;
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
export const CreateEquipmentDocument = gql`
    mutation CreateEquipment($make: String, $name: String, $model: String, $serial: String, $rigType: String, $canopySize: Int, $repackExpiresAt: Int, $userId: Int, $operatorId: Int) {
  createEquipment(
    input: {attributes: {name: $name, make: $make, model: $model, serial: $serial, repackExpiresAt: $repackExpiresAt, operatorId: $operatorId, userId: $userId, canopySize: $canopySize, rigType: $rigType}}
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
export type CreateEquipmentMutationFn = Apollo.MutationFunction<Operation.CreateEquipmentMutation, Operation.CreateEquipmentMutationVariables>;

/**
 * __useCreateEquipmentMutation__
 *
 * To run a mutation, you first call `useCreateEquipmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEquipmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEquipmentMutation, { data, loading, error }] = useCreateEquipmentMutation({
 *   variables: {
 *      make: // value for 'make'
 *      name: // value for 'name'
 *      model: // value for 'model'
 *      serial: // value for 'serial'
 *      rigType: // value for 'rigType'
 *      canopySize: // value for 'canopySize'
 *      repackExpiresAt: // value for 'repackExpiresAt'
 *      userId: // value for 'userId'
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useCreateEquipmentMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateEquipmentMutation, Operation.CreateEquipmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateEquipmentMutation, Operation.CreateEquipmentMutationVariables>(CreateEquipmentDocument, options);
      }
export type CreateEquipmentMutationHookResult = ReturnType<typeof useCreateEquipmentMutation>;
export type CreateEquipmentMutationResult = Apollo.MutationResult<Operation.CreateEquipmentMutation>;
export type CreateEquipmentMutationOptions = Apollo.BaseMutationOptions<Operation.CreateEquipmentMutation, Operation.CreateEquipmentMutationVariables>;
export const CreateEquipmentInspectionDocument = gql`
    mutation CreateEquipmentInspection($operator: ID, $rig: ID, $isOk: Boolean, $definition: String) {
  createEquipmentInspection(
    input: {attributes: {operator: $operator, rig: $rig, isOk: $isOk, definition: $definition}}
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
export type CreateEquipmentInspectionMutationFn = Apollo.MutationFunction<Operation.CreateEquipmentInspectionMutation, Operation.CreateEquipmentInspectionMutationVariables>;

/**
 * __useCreateEquipmentInspectionMutation__
 *
 * To run a mutation, you first call `useCreateEquipmentInspectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEquipmentInspectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEquipmentInspectionMutation, { data, loading, error }] = useCreateEquipmentInspectionMutation({
 *   variables: {
 *      operator: // value for 'operator'
 *      rig: // value for 'rig'
 *      isOk: // value for 'isOk'
 *      definition: // value for 'definition'
 *   },
 * });
 */
export function useCreateEquipmentInspectionMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateEquipmentInspectionMutation, Operation.CreateEquipmentInspectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateEquipmentInspectionMutation, Operation.CreateEquipmentInspectionMutationVariables>(CreateEquipmentInspectionDocument, options);
      }
export type CreateEquipmentInspectionMutationHookResult = ReturnType<typeof useCreateEquipmentInspectionMutation>;
export type CreateEquipmentInspectionMutationResult = Apollo.MutationResult<Operation.CreateEquipmentInspectionMutation>;
export type CreateEquipmentInspectionMutationOptions = Apollo.BaseMutationOptions<Operation.CreateEquipmentInspectionMutation, Operation.CreateEquipmentInspectionMutationVariables>;
export const CreateLoadDocument = gql`
    mutation CreateLoad($name: String, $pilot: ID, $gca: ID, $maxSlots: Int, $vehicle: ID, $state: LoadState) {
  createLoad(
    input: {attributes: {name: $name, pilot: $pilot, gca: $gca, maxSlots: $maxSlots, vehicle: $vehicle, state: $state}}
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
 *      vehicle: // value for 'vehicle'
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
export const CreateOperatorDocument = gql`
    mutation CreateOperator($industry: Industry!, $name: String!, $banner: String, $federation: Int!, $timeZone: String!, $lat: Float, $lng: Float, $primaryColor: String, $secondaryColor: String) {
  createOperator(
    input: {industry: $industry, attributes: {name: $name, banner: $banner, federation: $federation, timeZone: $timeZone, primaryColor: $primaryColor, secondaryColor: $secondaryColor, lat: $lat, lng: $lng}}
  ) {
    fieldErrors {
      field
      message
    }
    errors
    operator {
      ...operatorExtensive
    }
  }
}
    ${OperatorExtensiveFragmentDoc}`;
export type CreateOperatorMutationFn = Apollo.MutationFunction<Operation.CreateOperatorMutation, Operation.CreateOperatorMutationVariables>;

/**
 * __useCreateOperatorMutation__
 *
 * To run a mutation, you first call `useCreateOperatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOperatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOperatorMutation, { data, loading, error }] = useCreateOperatorMutation({
 *   variables: {
 *      industry: // value for 'industry'
 *      name: // value for 'name'
 *      banner: // value for 'banner'
 *      federation: // value for 'federation'
 *      timeZone: // value for 'timeZone'
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      primaryColor: // value for 'primaryColor'
 *      secondaryColor: // value for 'secondaryColor'
 *   },
 * });
 */
export function useCreateOperatorMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateOperatorMutation, Operation.CreateOperatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateOperatorMutation, Operation.CreateOperatorMutationVariables>(CreateOperatorDocument, options);
      }
export type CreateOperatorMutationHookResult = ReturnType<typeof useCreateOperatorMutation>;
export type CreateOperatorMutationResult = Apollo.MutationResult<Operation.CreateOperatorMutation>;
export type CreateOperatorMutationOptions = Apollo.BaseMutationOptions<Operation.CreateOperatorMutation, Operation.CreateOperatorMutationVariables>;
export const CreateOrderDocument = gql`
    mutation CreateOrder($buyer: ID!, $seller: ID!, $operator: ID!, $title: String, $amountCents: Int!) {
  createOrder(
    input: {attributes: {operator: $operator, title: $title, buyer: $buyer, seller: $seller, amountCents: $amountCents}}
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
 *      operator: // value for 'operator'
 *      title: // value for 'title'
 *      amountCents: // value for 'amountCents'
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
export const CreateTicketAddonDocument = gql`
    mutation CreateTicketAddon($attributes: ExtraInput!) {
  createExtra(input: {attributes: $attributes}) {
    errors
    fieldErrors {
      field
      message
    }
    extra {
      ...ticketTypeAddonDetails
      operator {
        id
        extras {
          ...ticketTypeAddonDetails
        }
      }
    }
  }
}
    ${TicketTypeAddonDetailsFragmentDoc}`;
export type CreateTicketAddonMutationFn = Apollo.MutationFunction<Operation.CreateTicketAddonMutation, Operation.CreateTicketAddonMutationVariables>;

/**
 * __useCreateTicketAddonMutation__
 *
 * To run a mutation, you first call `useCreateTicketAddonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTicketAddonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTicketAddonMutation, { data, loading, error }] = useCreateTicketAddonMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateTicketAddonMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateTicketAddonMutation, Operation.CreateTicketAddonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateTicketAddonMutation, Operation.CreateTicketAddonMutationVariables>(CreateTicketAddonDocument, options);
      }
export type CreateTicketAddonMutationHookResult = ReturnType<typeof useCreateTicketAddonMutation>;
export type CreateTicketAddonMutationResult = Apollo.MutationResult<Operation.CreateTicketAddonMutation>;
export type CreateTicketAddonMutationOptions = Apollo.BaseMutationOptions<Operation.CreateTicketAddonMutation, Operation.CreateTicketAddonMutationVariables>;
export const CreateTicketTypeDocument = gql`
    mutation CreateTicketType($attributes: TicketTypeInput!) {
  createTicketType(input: {attributes: $attributes}) {
    errors
    fieldErrors {
      field
      message
    }
    ticketType {
      id
      name
      altitude
      costCents
      allowManifestingSelf
      extras {
        id
        name
        costCents
      }
      operator {
        id
        ticketTypes {
          id
          name
          altitude
          costCents
          allowManifestingSelf
          extras {
            id
            name
            costCents
          }
        }
      }
    }
  }
}
    `;
export type CreateTicketTypeMutationFn = Apollo.MutationFunction<Operation.CreateTicketTypeMutation, Operation.CreateTicketTypeMutationVariables>;

/**
 * __useCreateTicketTypeMutation__
 *
 * To run a mutation, you first call `useCreateTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTicketTypeMutation, { data, loading, error }] = useCreateTicketTypeMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateTicketTypeMutation, Operation.CreateTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateTicketTypeMutation, Operation.CreateTicketTypeMutationVariables>(CreateTicketTypeDocument, options);
      }
export type CreateTicketTypeMutationHookResult = ReturnType<typeof useCreateTicketTypeMutation>;
export type CreateTicketTypeMutationResult = Apollo.MutationResult<Operation.CreateTicketTypeMutation>;
export type CreateTicketTypeMutationOptions = Apollo.BaseMutationOptions<Operation.CreateTicketTypeMutation, Operation.CreateTicketTypeMutationVariables>;
export const CreateGhostDocument = gql`
    mutation CreateGhost($name: String!, $phone: String, $email: String!, $federationNumber: String, $role: Int!, $license: Int, $operator: Int!, $bodyMassKg: Float!) {
  createGhost(
    input: {attributes: {role: $role, federationNumber: $federationNumber, name: $name, phone: $phone, email: $email, operator: $operator, license: $license, bodyMassKg: $bodyMassKg}}
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
 *      operator: // value for 'operator'
 *      bodyMassKg: // value for 'bodyMassKg'
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
export const CreateVehicleDocument = gql`
    mutation CreateVehicle($attributes: VehicleInput!) {
  createVehicle(input: {attributes: $attributes}) {
    vehicle {
      ...vehicleEssentials
      operator {
        id
        vehicles {
          ...vehicleEssentials
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
    ${VehicleEssentialsFragmentDoc}`;
export type CreateVehicleMutationFn = Apollo.MutationFunction<Operation.CreateVehicleMutation, Operation.CreateVehicleMutationVariables>;

/**
 * __useCreateVehicleMutation__
 *
 * To run a mutation, you first call `useCreateVehicleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateVehicleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createVehicleMutation, { data, loading, error }] = useCreateVehicleMutation({
 *   variables: {
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useCreateVehicleMutation(baseOptions?: Apollo.MutationHookOptions<Operation.CreateVehicleMutation, Operation.CreateVehicleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.CreateVehicleMutation, Operation.CreateVehicleMutationVariables>(CreateVehicleDocument, options);
      }
export type CreateVehicleMutationHookResult = ReturnType<typeof useCreateVehicleMutation>;
export type CreateVehicleMutationResult = Apollo.MutationResult<Operation.CreateVehicleMutation>;
export type CreateVehicleMutationOptions = Apollo.BaseMutationOptions<Operation.CreateVehicleMutation, Operation.CreateVehicleMutationVariables>;
export const DeleteSlotDocument = gql`
    mutation DeleteSlot($id: Int!) {
  deleteSlot(input: {id: $id}) {
    slot {
      ...slotExhaustive
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${SlotExhaustiveFragmentDoc}`;
export type DeleteSlotMutationFn = Apollo.MutationFunction<Operation.DeleteSlotMutation, Operation.DeleteSlotMutationVariables>;

/**
 * __useDeleteSlotMutation__
 *
 * To run a mutation, you first call `useDeleteSlotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSlotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSlotMutation, { data, loading, error }] = useDeleteSlotMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSlotMutation(baseOptions?: Apollo.MutationHookOptions<Operation.DeleteSlotMutation, Operation.DeleteSlotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.DeleteSlotMutation, Operation.DeleteSlotMutationVariables>(DeleteSlotDocument, options);
      }
export type DeleteSlotMutationHookResult = ReturnType<typeof useDeleteSlotMutation>;
export type DeleteSlotMutationResult = Apollo.MutationResult<Operation.DeleteSlotMutation>;
export type DeleteSlotMutationOptions = Apollo.BaseMutationOptions<Operation.DeleteSlotMutation, Operation.DeleteSlotMutationVariables>;
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
    mutation GrantPermission($membershipId: ID!, $permissionName: Permission!) {
  grantPermission(input: {membership: $membershipId, permission: $permissionName}) {
    fieldErrors {
      message
      field
    }
    errors
    membership {
      ...membershipEssentials
      permissions
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${MembershipEssentialsFragmentDoc}`;
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
 *      membershipId: // value for 'membershipId'
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
    mutation JoinFederation($federation: ID!, $uid: String, $license: ID) {
  joinFederation(
    input: {attributes: {federation: $federation, uid: $uid, license: $license}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    userFederation {
      ...userFederationEssentials
    }
  }
}
    ${UserFederationEssentialsFragmentDoc}`;
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
export const JoinOperatorDocument = gql`
    mutation JoinOperator($operator: ID!) {
  joinOperator(input: {operator: $operator}) {
    membership {
      id
    }
    errors
    fieldErrors {
      field
      message
    }
  }
}
    `;
export type JoinOperatorMutationFn = Apollo.MutationFunction<Operation.JoinOperatorMutation, Operation.JoinOperatorMutationVariables>;

/**
 * __useJoinOperatorMutation__
 *
 * To run a mutation, you first call `useJoinOperatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinOperatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinOperatorMutation, { data, loading, error }] = useJoinOperatorMutation({
 *   variables: {
 *      operator: // value for 'operator'
 *   },
 * });
 */
export function useJoinOperatorMutation(baseOptions?: Apollo.MutationHookOptions<Operation.JoinOperatorMutation, Operation.JoinOperatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.JoinOperatorMutation, Operation.JoinOperatorMutationVariables>(JoinOperatorDocument, options);
      }
export type JoinOperatorMutationHookResult = ReturnType<typeof useJoinOperatorMutation>;
export type JoinOperatorMutationResult = Apollo.MutationResult<Operation.JoinOperatorMutation>;
export type JoinOperatorMutationOptions = Apollo.BaseMutationOptions<Operation.JoinOperatorMutation, Operation.JoinOperatorMutationVariables>;
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
export const ManifestGroupDocument = gql`
    mutation ManifestGroup($activityType: ID, $extras: [ID!], $load: ID, $ticketType: ID, $groupNumber: Int, $userGroup: [SlotUser!]!) {
  createSlots(
    input: {attributes: {activityType: $activityType, groupNumber: $groupNumber, extras: $extras, load: $load, ticketType: $ticketType, userGroup: $userGroup}}
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
 *      activityType: // value for 'activityType'
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
    mutation ManifestUser($activityType: ID, $extras: [ID!], $load: ID, $rig: ID, $ticketType: ID, $membership: ID, $bodyMassKg: Float, $guestName: String, $groupNumber: Int, $guestBodyMassKg: Float) {
  createSlot(
    input: {attributes: {activityType: $activityType, extras: $extras, load: $load, rig: $rig, groupNumber: $groupNumber, ticketType: $ticketType, membership: $membership, bodyMassKg: $bodyMassKg, guestBodyMassKg: $guestBodyMassKg, guestName: $guestName}}
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
 *      activityType: // value for 'activityType'
 *      extras: // value for 'extras'
 *      load: // value for 'load'
 *      rig: // value for 'rig'
 *      ticketType: // value for 'ticketType'
 *      membership: // value for 'membership'
 *      bodyMassKg: // value for 'bodyMassKg'
 *      guestName: // value for 'guestName'
 *      groupNumber: // value for 'groupNumber'
 *      guestBodyMassKg: // value for 'guestBodyMassKg'
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
export const MoveSlotDocument = gql`
    mutation MoveSlot($sourceSlot: Int!, $targetSlot: Int, $targetLoad: Int!) {
  moveSlot(
    input: {sourceSlot: $sourceSlot, targetSlot: $targetSlot, targetLoad: $targetLoad}
  ) {
    loads {
      ...loadDetails
    }
    errors
    fieldErrors {
      field
      message
    }
  }
}
    ${LoadDetailsFragmentDoc}`;
export type MoveSlotMutationFn = Apollo.MutationFunction<Operation.MoveSlotMutation, Operation.MoveSlotMutationVariables>;

/**
 * __useMoveSlotMutation__
 *
 * To run a mutation, you first call `useMoveSlotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveSlotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveSlotMutation, { data, loading, error }] = useMoveSlotMutation({
 *   variables: {
 *      sourceSlot: // value for 'sourceSlot'
 *      targetSlot: // value for 'targetSlot'
 *      targetLoad: // value for 'targetLoad'
 *   },
 * });
 */
export function useMoveSlotMutation(baseOptions?: Apollo.MutationHookOptions<Operation.MoveSlotMutation, Operation.MoveSlotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.MoveSlotMutation, Operation.MoveSlotMutationVariables>(MoveSlotDocument, options);
      }
export type MoveSlotMutationHookResult = ReturnType<typeof useMoveSlotMutation>;
export type MoveSlotMutationResult = Apollo.MutationResult<Operation.MoveSlotMutation>;
export type MoveSlotMutationOptions = Apollo.BaseMutationOptions<Operation.MoveSlotMutation, Operation.MoveSlotMutationVariables>;
export const RecoverPasswordDocument = gql`
    mutation RecoverPassword($email: String!, $redirectUrl: String!) {
  userSendPasswordResetWithToken(email: $email, redirectUrl: $redirectUrl) {
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
    mutation RevokePermission($membershipId: ID!, $permissionName: Permission!) {
  revokePermission(
    input: {membership: $membershipId, permission: $permissionName}
  ) {
    fieldErrors {
      message
      field
    }
    errors
    membership {
      ...membershipEssentials
      permissions
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
    ${MembershipEssentialsFragmentDoc}`;
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
 *      membershipId: // value for 'membershipId'
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
export const UpdateDailyLogDocument = gql`
    mutation UpdateDailyLog($date: ISO8601Date!, $operator: ID!, $attributes: DailyLogInput!) {
  updateDailyLog(
    input: {operator: $operator, date: $date, attributes: $attributes}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    dailyLog {
      ...dailyLogEntry
    }
  }
}
    ${DailyLogEntryFragmentDoc}`;
export type UpdateDailyLogMutationFn = Apollo.MutationFunction<Operation.UpdateDailyLogMutation, Operation.UpdateDailyLogMutationVariables>;

/**
 * __useUpdateDailyLogMutation__
 *
 * To run a mutation, you first call `useUpdateDailyLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDailyLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDailyLogMutation, { data, loading, error }] = useUpdateDailyLogMutation({
 *   variables: {
 *      date: // value for 'date'
 *      operator: // value for 'operator'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateDailyLogMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateDailyLogMutation, Operation.UpdateDailyLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateDailyLogMutation, Operation.UpdateDailyLogMutationVariables>(UpdateDailyLogDocument, options);
      }
export type UpdateDailyLogMutationHookResult = ReturnType<typeof useUpdateDailyLogMutation>;
export type UpdateDailyLogMutationResult = Apollo.MutationResult<Operation.UpdateDailyLogMutation>;
export type UpdateDailyLogMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateDailyLogMutation, Operation.UpdateDailyLogMutationVariables>;
export const UpdateEquipmentDocument = gql`
    mutation UpdateEquipment($id: Int!, $name: String, $make: String, $model: String, $serial: String, $isPublic: Boolean, $rigType: String, $canopySize: Int, $packingCard: String, $repackExpiresAt: Int, $userId: Int, $operatorId: Int) {
  updateEquipment(
    input: {id: $id, attributes: {name: $name, make: $make, packingCard: $packingCard, isPublic: $isPublic, model: $model, serial: $serial, repackExpiresAt: $repackExpiresAt, operatorId: $operatorId, userId: $userId, canopySize: $canopySize, rigType: $rigType}}
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
export type UpdateEquipmentMutationFn = Apollo.MutationFunction<Operation.UpdateEquipmentMutation, Operation.UpdateEquipmentMutationVariables>;

/**
 * __useUpdateEquipmentMutation__
 *
 * To run a mutation, you first call `useUpdateEquipmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEquipmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEquipmentMutation, { data, loading, error }] = useUpdateEquipmentMutation({
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
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useUpdateEquipmentMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateEquipmentMutation, Operation.UpdateEquipmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateEquipmentMutation, Operation.UpdateEquipmentMutationVariables>(UpdateEquipmentDocument, options);
      }
export type UpdateEquipmentMutationHookResult = ReturnType<typeof useUpdateEquipmentMutation>;
export type UpdateEquipmentMutationResult = Apollo.MutationResult<Operation.UpdateEquipmentMutation>;
export type UpdateEquipmentMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateEquipmentMutation, Operation.UpdateEquipmentMutationVariables>;
export const UpdateEquipmentInspectionTemplateDocument = gql`
    mutation UpdateEquipmentInspectionTemplate($operatorId: Int, $formId: Int, $definition: String) {
  updateFormTemplate(
    input: {id: $formId, attributes: {operatorId: $operatorId, definition: $definition}}
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
export type UpdateEquipmentInspectionTemplateMutationFn = Apollo.MutationFunction<Operation.UpdateEquipmentInspectionTemplateMutation, Operation.UpdateEquipmentInspectionTemplateMutationVariables>;

/**
 * __useUpdateEquipmentInspectionTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateEquipmentInspectionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEquipmentInspectionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEquipmentInspectionTemplateMutation, { data, loading, error }] = useUpdateEquipmentInspectionTemplateMutation({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      formId: // value for 'formId'
 *      definition: // value for 'definition'
 *   },
 * });
 */
export function useUpdateEquipmentInspectionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateEquipmentInspectionTemplateMutation, Operation.UpdateEquipmentInspectionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateEquipmentInspectionTemplateMutation, Operation.UpdateEquipmentInspectionTemplateMutationVariables>(UpdateEquipmentInspectionTemplateDocument, options);
      }
export type UpdateEquipmentInspectionTemplateMutationHookResult = ReturnType<typeof useUpdateEquipmentInspectionTemplateMutation>;
export type UpdateEquipmentInspectionTemplateMutationResult = Apollo.MutationResult<Operation.UpdateEquipmentInspectionTemplateMutation>;
export type UpdateEquipmentInspectionTemplateMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateEquipmentInspectionTemplateMutation, Operation.UpdateEquipmentInspectionTemplateMutationVariables>;
export const UpdateLoadDocument = gql`
    mutation UpdateLoad($id: ID!, $attributes: LoadInput!) {
  updateLoad(input: {id: $id, attributes: $attributes}) {
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
 *      attributes: // value for 'attributes'
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
export const UpdateMembershipDocument = gql`
    mutation UpdateMembership($membershipId: ID!, $attributes: MembershipInput!) {
  updateMembership(input: {membership: $membershipId, attributes: $attributes}) {
    errors
    fieldErrors {
      field
      message
    }
    membership {
      ...membershipDetails
    }
  }
}
    ${MembershipDetailsFragmentDoc}`;
export type UpdateMembershipMutationFn = Apollo.MutationFunction<Operation.UpdateMembershipMutation, Operation.UpdateMembershipMutationVariables>;

/**
 * __useUpdateMembershipMutation__
 *
 * To run a mutation, you first call `useUpdateMembershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMembershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMembershipMutation, { data, loading, error }] = useUpdateMembershipMutation({
 *   variables: {
 *      membershipId: // value for 'membershipId'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateMembershipMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateMembershipMutation, Operation.UpdateMembershipMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateMembershipMutation, Operation.UpdateMembershipMutationVariables>(UpdateMembershipDocument, options);
      }
export type UpdateMembershipMutationHookResult = ReturnType<typeof useUpdateMembershipMutation>;
export type UpdateMembershipMutationResult = Apollo.MutationResult<Operation.UpdateMembershipMutation>;
export type UpdateMembershipMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateMembershipMutation, Operation.UpdateMembershipMutationVariables>;
export const UpdateOperatorDocument = gql`
    mutation UpdateOperator($id: Int!, $attributes: OperatorInput!) {
  updateOperator(input: {id: $id, attributes: $attributes}) {
    fieldErrors {
      field
      message
    }
    errors
    operator {
      ...operatorExtensive
    }
  }
}
    ${OperatorExtensiveFragmentDoc}`;
export type UpdateOperatorMutationFn = Apollo.MutationFunction<Operation.UpdateOperatorMutation, Operation.UpdateOperatorMutationVariables>;

/**
 * __useUpdateOperatorMutation__
 *
 * To run a mutation, you first call `useUpdateOperatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOperatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOperatorMutation, { data, loading, error }] = useUpdateOperatorMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateOperatorMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateOperatorMutation, Operation.UpdateOperatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateOperatorMutation, Operation.UpdateOperatorMutationVariables>(UpdateOperatorDocument, options);
      }
export type UpdateOperatorMutationHookResult = ReturnType<typeof useUpdateOperatorMutation>;
export type UpdateOperatorMutationResult = Apollo.MutationResult<Operation.UpdateOperatorMutation>;
export type UpdateOperatorMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateOperatorMutation, Operation.UpdateOperatorMutationVariables>;
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
export const UpdateTicketAddonDocument = gql`
    mutation UpdateTicketAddon($id: Int!, $attributes: ExtraInput!) {
  updateExtra(input: {id: $id, attributes: $attributes}) {
    errors
    fieldErrors {
      message
      field
    }
    extra {
      ...ticketTypeExtraDetailed
    }
  }
}
    ${TicketTypeExtraDetailedFragmentDoc}`;
export type UpdateTicketAddonMutationFn = Apollo.MutationFunction<Operation.UpdateTicketAddonMutation, Operation.UpdateTicketAddonMutationVariables>;

/**
 * __useUpdateTicketAddonMutation__
 *
 * To run a mutation, you first call `useUpdateTicketAddonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTicketAddonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTicketAddonMutation, { data, loading, error }] = useUpdateTicketAddonMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateTicketAddonMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateTicketAddonMutation, Operation.UpdateTicketAddonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateTicketAddonMutation, Operation.UpdateTicketAddonMutationVariables>(UpdateTicketAddonDocument, options);
      }
export type UpdateTicketAddonMutationHookResult = ReturnType<typeof useUpdateTicketAddonMutation>;
export type UpdateTicketAddonMutationResult = Apollo.MutationResult<Operation.UpdateTicketAddonMutation>;
export type UpdateTicketAddonMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateTicketAddonMutation, Operation.UpdateTicketAddonMutationVariables>;
export const UpdateTicketTypeDocument = gql`
    mutation UpdateTicketType($id: Int!, $attributes: TicketTypeInput!) {
  updateTicketType(input: {id: $id, attributes: $attributes}) {
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
      costCents
      allowManifestingSelf
      extras {
        id
        name
        costCents
      }
      operator {
        ...operatorEssentials
        ticketTypes {
          ...ticketTypeEssentials
        }
      }
    }
  }
}
    ${TicketTypeEssentialsFragmentDoc}
${OperatorEssentialsFragmentDoc}`;
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
 *      attributes: // value for 'attributes'
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
    mutation UpdateUser($membership: ID, $name: String, $phone: String, $email: String, $image: String, $pushToken: String, $nickname: String, $license: Int, $bodyMassKg: Float) {
  updateUser(
    input: {membership: $membership, attributes: {pushToken: $pushToken, name: $name, phone: $phone, email: $email, image: $image, nickname: $nickname, license: $license, bodyMassKg: $bodyMassKg}}
  ) {
    errors
    fieldErrors {
      field
      message
    }
    membership {
      ...membershipDetails
    }
  }
}
    ${MembershipDetailsFragmentDoc}`;
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
 *      membership: // value for 'membership'
 *      name: // value for 'name'
 *      phone: // value for 'phone'
 *      email: // value for 'email'
 *      image: // value for 'image'
 *      pushToken: // value for 'pushToken'
 *      nickname: // value for 'nickname'
 *      license: // value for 'license'
 *      bodyMassKg: // value for 'bodyMassKg'
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
export const UpdateVehicleDocument = gql`
    mutation UpdateVehicle($id: Int!, $attributes: VehicleInput!) {
  updateVehicle(input: {id: $id, attributes: $attributes}) {
    vehicle {
      ...vehicleEssentials
      operator {
        id
        name
        vehicles {
          id
          name
          registration
          minCapacity
          capacity
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
    ${VehicleEssentialsFragmentDoc}`;
export type UpdateVehicleMutationFn = Apollo.MutationFunction<Operation.UpdateVehicleMutation, Operation.UpdateVehicleMutationVariables>;

/**
 * __useUpdateVehicleMutation__
 *
 * To run a mutation, you first call `useUpdateVehicleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVehicleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVehicleMutation, { data, loading, error }] = useUpdateVehicleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useUpdateVehicleMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateVehicleMutation, Operation.UpdateVehicleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateVehicleMutation, Operation.UpdateVehicleMutationVariables>(UpdateVehicleDocument, options);
      }
export type UpdateVehicleMutationHookResult = ReturnType<typeof useUpdateVehicleMutation>;
export type UpdateVehicleMutationResult = Apollo.MutationResult<Operation.UpdateVehicleMutation>;
export type UpdateVehicleMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateVehicleMutation, Operation.UpdateVehicleMutationVariables>;
export const UpdateVisibilityDocument = gql`
    mutation UpdateVisibility($operator: ID!, $event: OperatorStateEvent!) {
  updateVisibility(input: {operator: $operator, event: $event}) {
    errors
    fieldErrors {
      field
      message
    }
    operator {
      ...operatorDetailed
    }
  }
}
    ${OperatorDetailedFragmentDoc}`;
export type UpdateVisibilityMutationFn = Apollo.MutationFunction<Operation.UpdateVisibilityMutation, Operation.UpdateVisibilityMutationVariables>;

/**
 * __useUpdateVisibilityMutation__
 *
 * To run a mutation, you first call `useUpdateVisibilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVisibilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVisibilityMutation, { data, loading, error }] = useUpdateVisibilityMutation({
 *   variables: {
 *      operator: // value for 'operator'
 *      event: // value for 'event'
 *   },
 * });
 */
export function useUpdateVisibilityMutation(baseOptions?: Apollo.MutationHookOptions<Operation.UpdateVisibilityMutation, Operation.UpdateVisibilityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Operation.UpdateVisibilityMutation, Operation.UpdateVisibilityMutationVariables>(UpdateVisibilityDocument, options);
      }
export type UpdateVisibilityMutationHookResult = ReturnType<typeof useUpdateVisibilityMutation>;
export type UpdateVisibilityMutationResult = Apollo.MutationResult<Operation.UpdateVisibilityMutation>;
export type UpdateVisibilityMutationOptions = Apollo.BaseMutationOptions<Operation.UpdateVisibilityMutation, Operation.UpdateVisibilityMutationVariables>;
export const UserSignUpDocument = gql`
    mutation UserSignUp($email: String!, $password: String!, $passwordConfirmation: String!, $name: String!, $phone: String!, $pushToken: String, $bodyMassKg: Float!, $licenseId: Int) {
  userRegister(
    email: $email
    password: $password
    passwordConfirmation: $passwordConfirmation
    bodyMassKg: $bodyMassKg
    name: $name
    phone: $phone
    pushToken: $pushToken
    licenseId: $licenseId
    confirmUrl: "https://openmanifest.org/confirm/"
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
 *      bodyMassKg: // value for 'bodyMassKg'
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
    query Activity($operator: [ID!], $levels: [EventLevel!], $actions: [EventAction!], $accessLevels: [EventAccessLevel!], $timeRange: TimeRangeInput, $createdBy: [ID!]) {
  activity(
    operator: $operator
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
 *      operator: // value for 'operator'
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
// @ts-ignore
export function useActivitySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.ActivityQuery, Operation.ActivityQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.ActivityQuery, Operation.ActivityQueryVariables>;
export function useActivitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.ActivityQuery, Operation.ActivityQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.ActivityQuery | undefined, Operation.ActivityQueryVariables>;
export function useActivitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.ActivityQuery, Operation.ActivityQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.ActivityQuery, Operation.ActivityQueryVariables>(ActivityDocument, options);
        }
export type ActivityQueryHookResult = ReturnType<typeof useActivityQuery>;
export type ActivityLazyQueryHookResult = ReturnType<typeof useActivityLazyQuery>;
export type ActivitySuspenseQueryHookResult = ReturnType<typeof useActivitySuspenseQuery>;
export type ActivityQueryResult = Apollo.QueryResult<Operation.ActivityQuery, Operation.ActivityQueryVariables>;
export const ActivityDetailsDocument = gql`
    query ActivityDetails($operator: [ID!], $levels: [EventLevel!], $actions: [EventAction!], $accessLevels: [EventAccessLevel!], $timeRange: TimeRangeInput, $createdBy: [ID!], $after: String) {
  activity(
    operator: $operator
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
 *      operator: // value for 'operator'
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
// @ts-ignore
export function useActivityDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>;
export function useActivityDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.ActivityDetailsQuery | undefined, Operation.ActivityDetailsQueryVariables>;
export function useActivityDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>(ActivityDetailsDocument, options);
        }
export type ActivityDetailsQueryHookResult = ReturnType<typeof useActivityDetailsQuery>;
export type ActivityDetailsLazyQueryHookResult = ReturnType<typeof useActivityDetailsLazyQuery>;
export type ActivityDetailsSuspenseQueryHookResult = ReturnType<typeof useActivityDetailsSuspenseQuery>;
export type ActivityDetailsQueryResult = Apollo.QueryResult<Operation.ActivityDetailsQuery, Operation.ActivityDetailsQueryVariables>;
export const ActivityTypesDocument = gql`
    query ActivityTypes($allowedForMembershipIds: [Int!]) {
  activityTypes(memberships: $allowedForMembershipIds) {
    ...activityTypeEssentials
  }
}
    ${ActivityTypeEssentialsFragmentDoc}`;

/**
 * __useActivityTypesQuery__
 *
 * To run a query within a React component, call `useActivityTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivityTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityTypesQuery({
 *   variables: {
 *      allowedForMembershipIds: // value for 'allowedForMembershipIds'
 *   },
 * });
 */
export function useActivityTypesQuery(baseOptions?: Apollo.QueryHookOptions<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>(ActivityTypesDocument, options);
      }
export function useActivityTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>(ActivityTypesDocument, options);
        }
// @ts-ignore
export function useActivityTypesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>;
export function useActivityTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.ActivityTypesQuery | undefined, Operation.ActivityTypesQueryVariables>;
export function useActivityTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>(ActivityTypesDocument, options);
        }
export type ActivityTypesQueryHookResult = ReturnType<typeof useActivityTypesQuery>;
export type ActivityTypesLazyQueryHookResult = ReturnType<typeof useActivityTypesLazyQuery>;
export type ActivityTypesSuspenseQueryHookResult = ReturnType<typeof useActivityTypesSuspenseQuery>;
export type ActivityTypesQueryResult = Apollo.QueryResult<Operation.ActivityTypesQuery, Operation.ActivityTypesQueryVariables>;
export const AllowedActivityTypesDocument = gql`
    query AllowedActivityTypes($operatorId: ID!, $allowedForMembershipIds: [Int!]!, $isPublic: Boolean) {
  operator(id: $operatorId) {
    id
    allowedActivityTypes(userId: $allowedForMembershipIds) {
      ...activityTypeEssentials
    }
    ticketTypes(isPublic: $isPublic) {
      ...ticketTypeEssentials
    }
  }
  activityTypes {
    ...activityTypeEssentials
  }
}
    ${ActivityTypeEssentialsFragmentDoc}
${TicketTypeEssentialsFragmentDoc}`;

/**
 * __useAllowedActivityTypesQuery__
 *
 * To run a query within a React component, call `useAllowedActivityTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllowedActivityTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllowedActivityTypesQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      allowedForMembershipIds: // value for 'allowedForMembershipIds'
 *      isPublic: // value for 'isPublic'
 *   },
 * });
 */
export function useAllowedActivityTypesQuery(baseOptions: Apollo.QueryHookOptions<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables> & ({ variables: Operation.AllowedActivityTypesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>(AllowedActivityTypesDocument, options);
      }
export function useAllowedActivityTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>(AllowedActivityTypesDocument, options);
        }
// @ts-ignore
export function useAllowedActivityTypesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>;
export function useAllowedActivityTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AllowedActivityTypesQuery | undefined, Operation.AllowedActivityTypesQueryVariables>;
export function useAllowedActivityTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>(AllowedActivityTypesDocument, options);
        }
export type AllowedActivityTypesQueryHookResult = ReturnType<typeof useAllowedActivityTypesQuery>;
export type AllowedActivityTypesLazyQueryHookResult = ReturnType<typeof useAllowedActivityTypesLazyQuery>;
export type AllowedActivityTypesSuspenseQueryHookResult = ReturnType<typeof useAllowedActivityTypesSuspenseQuery>;
export type AllowedActivityTypesQueryResult = Apollo.QueryResult<Operation.AllowedActivityTypesQuery, Operation.AllowedActivityTypesQueryVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  currentUser {
    ...currentUser
  }
}
    ${CurrentUserFragmentDoc}`;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
// @ts-ignore
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.CurrentUserQuery | undefined, Operation.CurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<Operation.CurrentUserQuery, Operation.CurrentUserQueryVariables>;
export const DailyLogDocument = gql`
    query DailyLog($operatorId: ID!, $date: ISO8601Date!) {
  dailyLog(operator: $operatorId, date: $date) {
    ...dailyLogEntry
  }
}
    ${DailyLogEntryFragmentDoc}`;

/**
 * __useDailyLogQuery__
 *
 * To run a query within a React component, call `useDailyLogQuery` and pass it any options that fit your needs.
 * When your component renders, `useDailyLogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDailyLogQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      date: // value for 'date'
 *   },
 * });
 */
export function useDailyLogQuery(baseOptions: Apollo.QueryHookOptions<Operation.DailyLogQuery, Operation.DailyLogQueryVariables> & ({ variables: Operation.DailyLogQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>(DailyLogDocument, options);
      }
export function useDailyLogLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>(DailyLogDocument, options);
        }
// @ts-ignore
export function useDailyLogSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>;
export function useDailyLogSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.DailyLogQuery | undefined, Operation.DailyLogQueryVariables>;
export function useDailyLogSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>(DailyLogDocument, options);
        }
export type DailyLogQueryHookResult = ReturnType<typeof useDailyLogQuery>;
export type DailyLogLazyQueryHookResult = ReturnType<typeof useDailyLogLazyQuery>;
export type DailyLogSuspenseQueryHookResult = ReturnType<typeof useDailyLogSuspenseQuery>;
export type DailyLogQueryResult = Apollo.QueryResult<Operation.DailyLogQuery, Operation.DailyLogQueryVariables>;
export const TicketTypeExtrasDocument = gql`
    query TicketTypeExtras($operatorId: ID!) {
  extras(operator: $operatorId) {
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
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useTicketTypeExtrasQuery(baseOptions: Apollo.QueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables> & ({ variables: Operation.TicketTypeExtrasQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>(TicketTypeExtrasDocument, options);
      }
export function useTicketTypeExtrasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>(TicketTypeExtrasDocument, options);
        }
// @ts-ignore
export function useTicketTypeExtrasSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>;
export function useTicketTypeExtrasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.TicketTypeExtrasQuery | undefined, Operation.TicketTypeExtrasQueryVariables>;
export function useTicketTypeExtrasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.TicketTypeExtrasQuery, Operation.TicketTypeExtrasQueryVariables>(TicketTypeExtrasDocument, options);
        }
export type TicketTypeExtrasQueryHookResult = ReturnType<typeof useTicketTypeExtrasQuery>;
export type TicketTypeExtrasLazyQueryHookResult = ReturnType<typeof useTicketTypeExtrasLazyQuery>;
export type TicketTypeExtrasSuspenseQueryHookResult = ReturnType<typeof useTicketTypeExtrasSuspenseQuery>;
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
// @ts-ignore
export function useFederationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.FederationsQuery, Operation.FederationsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.FederationsQuery, Operation.FederationsQueryVariables>;
export function useFederationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.FederationsQuery, Operation.FederationsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.FederationsQuery | undefined, Operation.FederationsQueryVariables>;
export function useFederationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.FederationsQuery, Operation.FederationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.FederationsQuery, Operation.FederationsQueryVariables>(FederationsDocument, options);
        }
export type FederationsQueryHookResult = ReturnType<typeof useFederationsQuery>;
export type FederationsLazyQueryHookResult = ReturnType<typeof useFederationsLazyQuery>;
export type FederationsSuspenseQueryHookResult = ReturnType<typeof useFederationsSuspenseQuery>;
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
export function useAddressToLocationQuery(baseOptions: Apollo.QueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables> & ({ variables: Operation.AddressToLocationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>(AddressToLocationDocument, options);
      }
export function useAddressToLocationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>(AddressToLocationDocument, options);
        }
// @ts-ignore
export function useAddressToLocationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>;
export function useAddressToLocationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AddressToLocationQuery | undefined, Operation.AddressToLocationQueryVariables>;
export function useAddressToLocationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>(AddressToLocationDocument, options);
        }
export type AddressToLocationQueryHookResult = ReturnType<typeof useAddressToLocationQuery>;
export type AddressToLocationLazyQueryHookResult = ReturnType<typeof useAddressToLocationLazyQuery>;
export type AddressToLocationSuspenseQueryHookResult = ReturnType<typeof useAddressToLocationSuspenseQuery>;
export type AddressToLocationQueryResult = Apollo.QueryResult<Operation.AddressToLocationQuery, Operation.AddressToLocationQueryVariables>;
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
// @ts-ignore
export function useLicensesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.LicensesQuery, Operation.LicensesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.LicensesQuery, Operation.LicensesQueryVariables>;
export function useLicensesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.LicensesQuery, Operation.LicensesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.LicensesQuery | undefined, Operation.LicensesQueryVariables>;
export function useLicensesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.LicensesQuery, Operation.LicensesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.LicensesQuery, Operation.LicensesQueryVariables>(LicensesDocument, options);
        }
export type LicensesQueryHookResult = ReturnType<typeof useLicensesQuery>;
export type LicensesLazyQueryHookResult = ReturnType<typeof useLicensesLazyQuery>;
export type LicensesSuspenseQueryHookResult = ReturnType<typeof useLicensesSuspenseQuery>;
export type LicensesQueryResult = Apollo.QueryResult<Operation.LicensesQuery, Operation.LicensesQueryVariables>;
export const LoadDocument = gql`
    query Load($id: ID!) {
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
export function useLoadQuery(baseOptions: Apollo.QueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables> & ({ variables: Operation.LoadQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.LoadQuery, Operation.LoadQueryVariables>(LoadDocument, options);
      }
export function useLoadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.LoadQuery, Operation.LoadQueryVariables>(LoadDocument, options);
        }
// @ts-ignore
export function useLoadSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.LoadQuery, Operation.LoadQueryVariables>;
export function useLoadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.LoadQuery | undefined, Operation.LoadQueryVariables>;
export function useLoadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.LoadQuery, Operation.LoadQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.LoadQuery, Operation.LoadQueryVariables>(LoadDocument, options);
        }
export type LoadQueryHookResult = ReturnType<typeof useLoadQuery>;
export type LoadLazyQueryHookResult = ReturnType<typeof useLoadLazyQuery>;
export type LoadSuspenseQueryHookResult = ReturnType<typeof useLoadSuspenseQuery>;
export type LoadQueryResult = Apollo.QueryResult<Operation.LoadQuery, Operation.LoadQueryVariables>;
export const LoadsDocument = gql`
    query Loads($date: ISO8601Date, $operator: ID!) {
  loads(date: $date, operator: $operator) {
    edges {
      node {
        ...loadEssentials
      }
    }
  }
}
    ${LoadEssentialsFragmentDoc}`;

/**
 * __useLoadsQuery__
 *
 * To run a query within a React component, call `useLoadsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoadsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoadsQuery({
 *   variables: {
 *      date: // value for 'date'
 *      operator: // value for 'operator'
 *   },
 * });
 */
export function useLoadsQuery(baseOptions: Apollo.QueryHookOptions<Operation.LoadsQuery, Operation.LoadsQueryVariables> & ({ variables: Operation.LoadsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.LoadsQuery, Operation.LoadsQueryVariables>(LoadsDocument, options);
      }
export function useLoadsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.LoadsQuery, Operation.LoadsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.LoadsQuery, Operation.LoadsQueryVariables>(LoadsDocument, options);
        }
// @ts-ignore
export function useLoadsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.LoadsQuery, Operation.LoadsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.LoadsQuery, Operation.LoadsQueryVariables>;
export function useLoadsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.LoadsQuery, Operation.LoadsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.LoadsQuery | undefined, Operation.LoadsQueryVariables>;
export function useLoadsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.LoadsQuery, Operation.LoadsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.LoadsQuery, Operation.LoadsQueryVariables>(LoadsDocument, options);
        }
export type LoadsQueryHookResult = ReturnType<typeof useLoadsQuery>;
export type LoadsLazyQueryHookResult = ReturnType<typeof useLoadsLazyQuery>;
export type LoadsSuspenseQueryHookResult = ReturnType<typeof useLoadsSuspenseQuery>;
export type LoadsQueryResult = Apollo.QueryResult<Operation.LoadsQuery, Operation.LoadsQueryVariables>;
export const MembershipsDocument = gql`
    query Memberships($operatorId: ID!, $search: String, $permissions: [Permission!], $first: Int, $after: String, $licensed: Boolean) {
  memberships(
    operator: $operatorId
    licensed: $licensed
    search: $search
    permissions: $permissions
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        ...membershipEssentials
      }
    }
  }
}
    ${MembershipEssentialsFragmentDoc}`;

/**
 * __useMembershipsQuery__
 *
 * To run a query within a React component, call `useMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipsQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      search: // value for 'search'
 *      permissions: // value for 'permissions'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      licensed: // value for 'licensed'
 *   },
 * });
 */
export function useMembershipsQuery(baseOptions: Apollo.QueryHookOptions<Operation.MembershipsQuery, Operation.MembershipsQueryVariables> & ({ variables: Operation.MembershipsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>(MembershipsDocument, options);
      }
export function useMembershipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>(MembershipsDocument, options);
        }
// @ts-ignore
export function useMembershipsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>;
export function useMembershipsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipsQuery | undefined, Operation.MembershipsQueryVariables>;
export function useMembershipsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>(MembershipsDocument, options);
        }
export type MembershipsQueryHookResult = ReturnType<typeof useMembershipsQuery>;
export type MembershipsLazyQueryHookResult = ReturnType<typeof useMembershipsLazyQuery>;
export type MembershipsSuspenseQueryHookResult = ReturnType<typeof useMembershipsSuspenseQuery>;
export type MembershipsQueryResult = Apollo.QueryResult<Operation.MembershipsQuery, Operation.MembershipsQueryVariables>;
export const MembershipsDetailedDocument = gql`
    query MembershipsDetailed($operatorId: ID!, $search: String, $permissions: [Permission!], $first: Int, $after: String, $licensed: Boolean) {
  memberships(
    operator: $operatorId
    licensed: $licensed
    search: $search
    permissions: $permissions
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        ...membershipEssentials
      }
    }
  }
}
    ${MembershipEssentialsFragmentDoc}`;

/**
 * __useMembershipsDetailedQuery__
 *
 * To run a query within a React component, call `useMembershipsDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipsDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipsDetailedQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      search: // value for 'search'
 *      permissions: // value for 'permissions'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      licensed: // value for 'licensed'
 *   },
 * });
 */
export function useMembershipsDetailedQuery(baseOptions: Apollo.QueryHookOptions<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables> & ({ variables: Operation.MembershipsDetailedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>(MembershipsDetailedDocument, options);
      }
export function useMembershipsDetailedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>(MembershipsDetailedDocument, options);
        }
// @ts-ignore
export function useMembershipsDetailedSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>;
export function useMembershipsDetailedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipsDetailedQuery | undefined, Operation.MembershipsDetailedQueryVariables>;
export function useMembershipsDetailedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>(MembershipsDetailedDocument, options);
        }
export type MembershipsDetailedQueryHookResult = ReturnType<typeof useMembershipsDetailedQuery>;
export type MembershipsDetailedLazyQueryHookResult = ReturnType<typeof useMembershipsDetailedLazyQuery>;
export type MembershipsDetailedSuspenseQueryHookResult = ReturnType<typeof useMembershipsDetailedSuspenseQuery>;
export type MembershipsDetailedQueryResult = Apollo.QueryResult<Operation.MembershipsDetailedQuery, Operation.MembershipsDetailedQueryVariables>;
export const MembershipDocument = gql`
    query Membership($id: ID!) {
  membership(id: $id) {
    ...membershipEssentials
  }
}
    ${MembershipEssentialsFragmentDoc}`;

/**
 * __useMembershipQuery__
 *
 * To run a query within a React component, call `useMembershipQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMembershipQuery(baseOptions: Apollo.QueryHookOptions<Operation.MembershipQuery, Operation.MembershipQueryVariables> & ({ variables: Operation.MembershipQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.MembershipQuery, Operation.MembershipQueryVariables>(MembershipDocument, options);
      }
export function useMembershipLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.MembershipQuery, Operation.MembershipQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.MembershipQuery, Operation.MembershipQueryVariables>(MembershipDocument, options);
        }
// @ts-ignore
export function useMembershipSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.MembershipQuery, Operation.MembershipQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipQuery, Operation.MembershipQueryVariables>;
export function useMembershipSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipQuery, Operation.MembershipQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipQuery | undefined, Operation.MembershipQueryVariables>;
export function useMembershipSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipQuery, Operation.MembershipQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.MembershipQuery, Operation.MembershipQueryVariables>(MembershipDocument, options);
        }
export type MembershipQueryHookResult = ReturnType<typeof useMembershipQuery>;
export type MembershipLazyQueryHookResult = ReturnType<typeof useMembershipLazyQuery>;
export type MembershipSuspenseQueryHookResult = ReturnType<typeof useMembershipSuspenseQuery>;
export type MembershipQueryResult = Apollo.QueryResult<Operation.MembershipQuery, Operation.MembershipQueryVariables>;
export const MembershipDetailedDocument = gql`
    query MembershipDetailed($id: ID!) {
  membership(id: $id) {
    ...membershipDetails
  }
}
    ${MembershipDetailsFragmentDoc}`;

/**
 * __useMembershipDetailedQuery__
 *
 * To run a query within a React component, call `useMembershipDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipDetailedQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMembershipDetailedQuery(baseOptions: Apollo.QueryHookOptions<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables> & ({ variables: Operation.MembershipDetailedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>(MembershipDetailedDocument, options);
      }
export function useMembershipDetailedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>(MembershipDetailedDocument, options);
        }
// @ts-ignore
export function useMembershipDetailedSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>;
export function useMembershipDetailedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipDetailedQuery | undefined, Operation.MembershipDetailedQueryVariables>;
export function useMembershipDetailedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>(MembershipDetailedDocument, options);
        }
export type MembershipDetailedQueryHookResult = ReturnType<typeof useMembershipDetailedQuery>;
export type MembershipDetailedLazyQueryHookResult = ReturnType<typeof useMembershipDetailedLazyQuery>;
export type MembershipDetailedSuspenseQueryHookResult = ReturnType<typeof useMembershipDetailedSuspenseQuery>;
export type MembershipDetailedQueryResult = Apollo.QueryResult<Operation.MembershipDetailedQuery, Operation.MembershipDetailedQueryVariables>;
export const MembershipProfileDocument = gql`
    query MembershipProfile($id: ID!) {
  membership(id: $id) {
    ...membershipProfile
  }
}
    ${MembershipProfileFragmentDoc}`;

/**
 * __useMembershipProfileQuery__
 *
 * To run a query within a React component, call `useMembershipProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useMembershipProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMembershipProfileQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMembershipProfileQuery(baseOptions: Apollo.QueryHookOptions<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables> & ({ variables: Operation.MembershipProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>(MembershipProfileDocument, options);
      }
export function useMembershipProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>(MembershipProfileDocument, options);
        }
// @ts-ignore
export function useMembershipProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>;
export function useMembershipProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.MembershipProfileQuery | undefined, Operation.MembershipProfileQueryVariables>;
export function useMembershipProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>(MembershipProfileDocument, options);
        }
export type MembershipProfileQueryHookResult = ReturnType<typeof useMembershipProfileQuery>;
export type MembershipProfileLazyQueryHookResult = ReturnType<typeof useMembershipProfileLazyQuery>;
export type MembershipProfileSuspenseQueryHookResult = ReturnType<typeof useMembershipProfileSuspenseQuery>;
export type MembershipProfileQueryResult = Apollo.QueryResult<Operation.MembershipProfileQuery, Operation.MembershipProfileQueryVariables>;
export const NotificationsDocument = gql`
    query Notifications($operatorId: ID!) {
  operator(id: $operatorId) {
    id
    currentUser {
      id
      notifications {
        edges {
          node {
            id
            message
            notificationType
            createdAt
            sentBy {
              id
              user {
                id
                name
              }
            }
            resource {
              ... on Load {
                ...loadEssentials
              }
              ... on Transaction {
                id
                amountCents
                message
                status
              }
              ... on Slot {
                ...slotEssentials
              }
              ... on Rig {
                ...rigEssentials
                rigInspections(operatorId: $operatorId) {
                  id
                  createdAt
                  inspectedBy {
                    id
                    user {
                      id
                      name
                    }
                  }
                }
              }
              ... on RigInspection {
                ...rigInspectionEssentials
              }
            }
          }
        }
      }
    }
  }
}
    ${LoadEssentialsFragmentDoc}
${SlotEssentialsFragmentDoc}
${RigEssentialsFragmentDoc}
${RigInspectionEssentialsFragmentDoc}`;

/**
 * __useNotificationsQuery__
 *
 * To run a query within a React component, call `useNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationsQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useNotificationsQuery(baseOptions: Apollo.QueryHookOptions<Operation.NotificationsQuery, Operation.NotificationsQueryVariables> & ({ variables: Operation.NotificationsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>(NotificationsDocument, options);
      }
export function useNotificationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>(NotificationsDocument, options);
        }
// @ts-ignore
export function useNotificationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>;
export function useNotificationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.NotificationsQuery | undefined, Operation.NotificationsQueryVariables>;
export function useNotificationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>(NotificationsDocument, options);
        }
export type NotificationsQueryHookResult = ReturnType<typeof useNotificationsQuery>;
export type NotificationsLazyQueryHookResult = ReturnType<typeof useNotificationsLazyQuery>;
export type NotificationsSuspenseQueryHookResult = ReturnType<typeof useNotificationsSuspenseQuery>;
export type NotificationsQueryResult = Apollo.QueryResult<Operation.NotificationsQuery, Operation.NotificationsQueryVariables>;
export const OperatorDocument = gql`
    query Operator($operatorId: ID!) {
  operator(id: $operatorId) {
    ...operatorExtensive
  }
}
    ${OperatorExtensiveFragmentDoc}`;

/**
 * __useOperatorQuery__
 *
 * To run a query within a React component, call `useOperatorQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useOperatorQuery(baseOptions: Apollo.QueryHookOptions<Operation.OperatorQuery, Operation.OperatorQueryVariables> & ({ variables: Operation.OperatorQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorQuery, Operation.OperatorQueryVariables>(OperatorDocument, options);
      }
export function useOperatorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorQuery, Operation.OperatorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorQuery, Operation.OperatorQueryVariables>(OperatorDocument, options);
        }
// @ts-ignore
export function useOperatorSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorQuery, Operation.OperatorQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorQuery, Operation.OperatorQueryVariables>;
export function useOperatorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorQuery, Operation.OperatorQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorQuery | undefined, Operation.OperatorQueryVariables>;
export function useOperatorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorQuery, Operation.OperatorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorQuery, Operation.OperatorQueryVariables>(OperatorDocument, options);
        }
export type OperatorQueryHookResult = ReturnType<typeof useOperatorQuery>;
export type OperatorLazyQueryHookResult = ReturnType<typeof useOperatorLazyQuery>;
export type OperatorSuspenseQueryHookResult = ReturnType<typeof useOperatorSuspenseQuery>;
export type OperatorQueryResult = Apollo.QueryResult<Operation.OperatorQuery, Operation.OperatorQueryVariables>;
export const OperatorStatisticsDocument = gql`
    query OperatorStatistics($operatorId: ID!, $timeRange: TimeRangeInput) {
  operator(id: $operatorId) {
    ...operatorStatistics
  }
}
    ${OperatorStatisticsFragmentDoc}`;

/**
 * __useOperatorStatisticsQuery__
 *
 * To run a query within a React component, call `useOperatorStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorStatisticsQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      timeRange: // value for 'timeRange'
 *   },
 * });
 */
export function useOperatorStatisticsQuery(baseOptions: Apollo.QueryHookOptions<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables> & ({ variables: Operation.OperatorStatisticsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>(OperatorStatisticsDocument, options);
      }
export function useOperatorStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>(OperatorStatisticsDocument, options);
        }
// @ts-ignore
export function useOperatorStatisticsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>;
export function useOperatorStatisticsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorStatisticsQuery | undefined, Operation.OperatorStatisticsQueryVariables>;
export function useOperatorStatisticsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>(OperatorStatisticsDocument, options);
        }
export type OperatorStatisticsQueryHookResult = ReturnType<typeof useOperatorStatisticsQuery>;
export type OperatorStatisticsLazyQueryHookResult = ReturnType<typeof useOperatorStatisticsLazyQuery>;
export type OperatorStatisticsSuspenseQueryHookResult = ReturnType<typeof useOperatorStatisticsSuspenseQuery>;
export type OperatorStatisticsQueryResult = Apollo.QueryResult<Operation.OperatorStatisticsQuery, Operation.OperatorStatisticsQueryVariables>;
export const OperatorsStatisticsDocument = gql`
    query OperatorsStatistics($timeRange: TimeRangeInput, $after: String) {
  operators(after: $after) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
    }
    edges {
      cursor
      node {
        ...operatorStatistics
      }
    }
  }
}
    ${OperatorStatisticsFragmentDoc}`;

/**
 * __useOperatorsStatisticsQuery__
 *
 * To run a query within a React component, call `useOperatorsStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorsStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorsStatisticsQuery({
 *   variables: {
 *      timeRange: // value for 'timeRange'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useOperatorsStatisticsQuery(baseOptions?: Apollo.QueryHookOptions<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>(OperatorsStatisticsDocument, options);
      }
export function useOperatorsStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>(OperatorsStatisticsDocument, options);
        }
// @ts-ignore
export function useOperatorsStatisticsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>;
export function useOperatorsStatisticsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorsStatisticsQuery | undefined, Operation.OperatorsStatisticsQueryVariables>;
export function useOperatorsStatisticsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>(OperatorsStatisticsDocument, options);
        }
export type OperatorsStatisticsQueryHookResult = ReturnType<typeof useOperatorsStatisticsQuery>;
export type OperatorsStatisticsLazyQueryHookResult = ReturnType<typeof useOperatorsStatisticsLazyQuery>;
export type OperatorsStatisticsSuspenseQueryHookResult = ReturnType<typeof useOperatorsStatisticsSuspenseQuery>;
export type OperatorsStatisticsQueryResult = Apollo.QueryResult<Operation.OperatorsStatisticsQuery, Operation.OperatorsStatisticsQueryVariables>;
export const OperatorRigsDocument = gql`
    query OperatorRigs($operatorId: ID!) {
  operator(id: $operatorId) {
    id
    rigs {
      ...rigEssentials
    }
  }
}
    ${RigEssentialsFragmentDoc}`;

/**
 * __useOperatorRigsQuery__
 *
 * To run a query within a React component, call `useOperatorRigsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorRigsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorRigsQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useOperatorRigsQuery(baseOptions: Apollo.QueryHookOptions<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables> & ({ variables: Operation.OperatorRigsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>(OperatorRigsDocument, options);
      }
export function useOperatorRigsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>(OperatorRigsDocument, options);
        }
// @ts-ignore
export function useOperatorRigsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>;
export function useOperatorRigsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorRigsQuery | undefined, Operation.OperatorRigsQueryVariables>;
export function useOperatorRigsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>(OperatorRigsDocument, options);
        }
export type OperatorRigsQueryHookResult = ReturnType<typeof useOperatorRigsQuery>;
export type OperatorRigsLazyQueryHookResult = ReturnType<typeof useOperatorRigsLazyQuery>;
export type OperatorRigsSuspenseQueryHookResult = ReturnType<typeof useOperatorRigsSuspenseQuery>;
export type OperatorRigsQueryResult = Apollo.QueryResult<Operation.OperatorRigsQuery, Operation.OperatorRigsQueryVariables>;
export const OperatorPermissionsDocument = gql`
    query OperatorPermissions($id: ID!) {
  operator(id: $id) {
    ...operatorEssentials
    roles {
      ...roleDetailed
    }
  }
}
    ${OperatorEssentialsFragmentDoc}
${RoleDetailedFragmentDoc}`;

/**
 * __useOperatorPermissionsQuery__
 *
 * To run a query within a React component, call `useOperatorPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorPermissionsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOperatorPermissionsQuery(baseOptions: Apollo.QueryHookOptions<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables> & ({ variables: Operation.OperatorPermissionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>(OperatorPermissionsDocument, options);
      }
export function useOperatorPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>(OperatorPermissionsDocument, options);
        }
// @ts-ignore
export function useOperatorPermissionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>;
export function useOperatorPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorPermissionsQuery | undefined, Operation.OperatorPermissionsQueryVariables>;
export function useOperatorPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>(OperatorPermissionsDocument, options);
        }
export type OperatorPermissionsQueryHookResult = ReturnType<typeof useOperatorPermissionsQuery>;
export type OperatorPermissionsLazyQueryHookResult = ReturnType<typeof useOperatorPermissionsLazyQuery>;
export type OperatorPermissionsSuspenseQueryHookResult = ReturnType<typeof useOperatorPermissionsSuspenseQuery>;
export type OperatorPermissionsQueryResult = Apollo.QueryResult<Operation.OperatorPermissionsQuery, Operation.OperatorPermissionsQueryVariables>;
export const OperatorTransactionsDocument = gql`
    query OperatorTransactions($operatorId: ID!, $after: String) {
  operator(id: $operatorId) {
    ...operatorEssentials
    orders(after: $after) {
      edges {
        node {
          id
        }
      }
    }
  }
}
    ${OperatorEssentialsFragmentDoc}`;

/**
 * __useOperatorTransactionsQuery__
 *
 * To run a query within a React component, call `useOperatorTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorTransactionsQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useOperatorTransactionsQuery(baseOptions: Apollo.QueryHookOptions<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables> & ({ variables: Operation.OperatorTransactionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>(OperatorTransactionsDocument, options);
      }
export function useOperatorTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>(OperatorTransactionsDocument, options);
        }
// @ts-ignore
export function useOperatorTransactionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>;
export function useOperatorTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorTransactionsQuery | undefined, Operation.OperatorTransactionsQueryVariables>;
export function useOperatorTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>(OperatorTransactionsDocument, options);
        }
export type OperatorTransactionsQueryHookResult = ReturnType<typeof useOperatorTransactionsQuery>;
export type OperatorTransactionsLazyQueryHookResult = ReturnType<typeof useOperatorTransactionsLazyQuery>;
export type OperatorTransactionsSuspenseQueryHookResult = ReturnType<typeof useOperatorTransactionsSuspenseQuery>;
export type OperatorTransactionsQueryResult = Apollo.QueryResult<Operation.OperatorTransactionsQuery, Operation.OperatorTransactionsQueryVariables>;
export const OperatorsDocument = gql`
    query Operators($state: [OperatorState!]) {
  operators(state: $state) {
    edges {
      node {
        ...operatorEssentials
        currentUser {
          id
        }
      }
    }
  }
}
    ${OperatorEssentialsFragmentDoc}`;

/**
 * __useOperatorsQuery__
 *
 * To run a query within a React component, call `useOperatorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOperatorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOperatorsQuery({
 *   variables: {
 *      state: // value for 'state'
 *   },
 * });
 */
export function useOperatorsQuery(baseOptions?: Apollo.QueryHookOptions<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>(OperatorsDocument, options);
      }
export function useOperatorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>(OperatorsDocument, options);
        }
// @ts-ignore
export function useOperatorsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>;
export function useOperatorsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.OperatorsQuery | undefined, Operation.OperatorsQueryVariables>;
export function useOperatorsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>(OperatorsDocument, options);
        }
export type OperatorsQueryHookResult = ReturnType<typeof useOperatorsQuery>;
export type OperatorsLazyQueryHookResult = ReturnType<typeof useOperatorsLazyQuery>;
export type OperatorsSuspenseQueryHookResult = ReturnType<typeof useOperatorsSuspenseQuery>;
export type OperatorsQueryResult = Apollo.QueryResult<Operation.OperatorsQuery, Operation.OperatorsQueryVariables>;
export const CurrentUserPermissionsDocument = gql`
    query CurrentUserPermissions($operatorId: ID!) {
  operator(id: $operatorId) {
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
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useCurrentUserPermissionsQuery(baseOptions: Apollo.QueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables> & ({ variables: Operation.CurrentUserPermissionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>(CurrentUserPermissionsDocument, options);
      }
export function useCurrentUserPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>(CurrentUserPermissionsDocument, options);
        }
// @ts-ignore
export function useCurrentUserPermissionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>;
export function useCurrentUserPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.CurrentUserPermissionsQuery | undefined, Operation.CurrentUserPermissionsQueryVariables>;
export function useCurrentUserPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>(CurrentUserPermissionsDocument, options);
        }
export type CurrentUserPermissionsQueryHookResult = ReturnType<typeof useCurrentUserPermissionsQuery>;
export type CurrentUserPermissionsLazyQueryHookResult = ReturnType<typeof useCurrentUserPermissionsLazyQuery>;
export type CurrentUserPermissionsSuspenseQueryHookResult = ReturnType<typeof useCurrentUserPermissionsSuspenseQuery>;
export type CurrentUserPermissionsQueryResult = Apollo.QueryResult<Operation.CurrentUserPermissionsQuery, Operation.CurrentUserPermissionsQueryVariables>;
export const RigInspectionTemplateDocument = gql`
    query RigInspectionTemplate($operatorId: ID!) {
  operator(id: $operatorId) {
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
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useRigInspectionTemplateQuery(baseOptions: Apollo.QueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables> & ({ variables: Operation.RigInspectionTemplateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>(RigInspectionTemplateDocument, options);
      }
export function useRigInspectionTemplateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>(RigInspectionTemplateDocument, options);
        }
// @ts-ignore
export function useRigInspectionTemplateSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>;
export function useRigInspectionTemplateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.RigInspectionTemplateQuery | undefined, Operation.RigInspectionTemplateQueryVariables>;
export function useRigInspectionTemplateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>(RigInspectionTemplateDocument, options);
        }
export type RigInspectionTemplateQueryHookResult = ReturnType<typeof useRigInspectionTemplateQuery>;
export type RigInspectionTemplateLazyQueryHookResult = ReturnType<typeof useRigInspectionTemplateLazyQuery>;
export type RigInspectionTemplateSuspenseQueryHookResult = ReturnType<typeof useRigInspectionTemplateSuspenseQuery>;
export type RigInspectionTemplateQueryResult = Apollo.QueryResult<Operation.RigInspectionTemplateQuery, Operation.RigInspectionTemplateQueryVariables>;
export const AvailableRigsDocument = gql`
    query AvailableRigs($membershipId: Int!, $isTandem: Boolean, $loadId: Int) {
  availableRigs(membership: $membershipId, isTandem: $isTandem, loadId: $loadId) {
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
 *      membershipId: // value for 'membershipId'
 *      isTandem: // value for 'isTandem'
 *      loadId: // value for 'loadId'
 *   },
 * });
 */
export function useAvailableRigsQuery(baseOptions: Apollo.QueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables> & ({ variables: Operation.AvailableRigsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>(AvailableRigsDocument, options);
      }
export function useAvailableRigsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>(AvailableRigsDocument, options);
        }
// @ts-ignore
export function useAvailableRigsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>;
export function useAvailableRigsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AvailableRigsQuery | undefined, Operation.AvailableRigsQueryVariables>;
export function useAvailableRigsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>(AvailableRigsDocument, options);
        }
export type AvailableRigsQueryHookResult = ReturnType<typeof useAvailableRigsQuery>;
export type AvailableRigsLazyQueryHookResult = ReturnType<typeof useAvailableRigsLazyQuery>;
export type AvailableRigsSuspenseQueryHookResult = ReturnType<typeof useAvailableRigsSuspenseQuery>;
export type AvailableRigsQueryResult = Apollo.QueryResult<Operation.AvailableRigsQuery, Operation.AvailableRigsQueryVariables>;
export const RolesDocument = gql`
    query Roles($operatorId: ID!, $selectable: Boolean) {
  operator(id: $operatorId) {
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
 *      operatorId: // value for 'operatorId'
 *      selectable: // value for 'selectable'
 *   },
 * });
 */
export function useRolesQuery(baseOptions: Apollo.QueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables> & ({ variables: Operation.RolesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.RolesQuery, Operation.RolesQueryVariables>(RolesDocument, options);
      }
export function useRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.RolesQuery, Operation.RolesQueryVariables>(RolesDocument, options);
        }
// @ts-ignore
export function useRolesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.RolesQuery, Operation.RolesQueryVariables>;
export function useRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.RolesQuery | undefined, Operation.RolesQueryVariables>;
export function useRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.RolesQuery, Operation.RolesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.RolesQuery, Operation.RolesQueryVariables>(RolesDocument, options);
        }
export type RolesQueryHookResult = ReturnType<typeof useRolesQuery>;
export type RolesLazyQueryHookResult = ReturnType<typeof useRolesLazyQuery>;
export type RolesSuspenseQueryHookResult = ReturnType<typeof useRolesSuspenseQuery>;
export type RolesQueryResult = Apollo.QueryResult<Operation.RolesQuery, Operation.RolesQueryVariables>;
export const AllowedTicketTypesDocument = gql`
    query AllowedTicketTypes($operator: ID!, $onlyPublicTickets: Boolean) {
  ticketTypes(operator: $operator, allowManifestingSelf: $onlyPublicTickets) {
    ...ticketTypeDetails
  }
}
    ${TicketTypeDetailsFragmentDoc}`;

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
 *      operator: // value for 'operator'
 *      onlyPublicTickets: // value for 'onlyPublicTickets'
 *   },
 * });
 */
export function useAllowedTicketTypesQuery(baseOptions: Apollo.QueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables> & ({ variables: Operation.AllowedTicketTypesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>(AllowedTicketTypesDocument, options);
      }
export function useAllowedTicketTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>(AllowedTicketTypesDocument, options);
        }
// @ts-ignore
export function useAllowedTicketTypesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>;
export function useAllowedTicketTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.AllowedTicketTypesQuery | undefined, Operation.AllowedTicketTypesQueryVariables>;
export function useAllowedTicketTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>(AllowedTicketTypesDocument, options);
        }
export type AllowedTicketTypesQueryHookResult = ReturnType<typeof useAllowedTicketTypesQuery>;
export type AllowedTicketTypesLazyQueryHookResult = ReturnType<typeof useAllowedTicketTypesLazyQuery>;
export type AllowedTicketTypesSuspenseQueryHookResult = ReturnType<typeof useAllowedTicketTypesSuspenseQuery>;
export type AllowedTicketTypesQueryResult = Apollo.QueryResult<Operation.AllowedTicketTypesQuery, Operation.AllowedTicketTypesQueryVariables>;
export const TicketTypesDocument = gql`
    query TicketTypes($operator: ID!, $allowManifestingSelf: Boolean) {
  ticketTypes(operator: $operator, allowManifestingSelf: $allowManifestingSelf) {
    ...ticketTypeDetails
  }
}
    ${TicketTypeDetailsFragmentDoc}`;

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
 *      operator: // value for 'operator'
 *      allowManifestingSelf: // value for 'allowManifestingSelf'
 *   },
 * });
 */
export function useTicketTypesQuery(baseOptions: Apollo.QueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables> & ({ variables: Operation.TicketTypesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>(TicketTypesDocument, options);
      }
export function useTicketTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>(TicketTypesDocument, options);
        }
// @ts-ignore
export function useTicketTypesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>;
export function useTicketTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.TicketTypesQuery | undefined, Operation.TicketTypesQueryVariables>;
export function useTicketTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>(TicketTypesDocument, options);
        }
export type TicketTypesQueryHookResult = ReturnType<typeof useTicketTypesQuery>;
export type TicketTypesLazyQueryHookResult = ReturnType<typeof useTicketTypesLazyQuery>;
export type TicketTypesSuspenseQueryHookResult = ReturnType<typeof useTicketTypesSuspenseQuery>;
export type TicketTypesQueryResult = Apollo.QueryResult<Operation.TicketTypesQuery, Operation.TicketTypesQueryVariables>;
export const VehiclesDocument = gql`
    query Vehicles($operatorId: ID!) {
  vehicles(operator: $operatorId) {
    ...vehicleEssentials
  }
}
    ${VehicleEssentialsFragmentDoc}`;

/**
 * __useVehiclesQuery__
 *
 * To run a query within a React component, call `useVehiclesQuery` and pass it any options that fit your needs.
 * When your component renders, `useVehiclesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVehiclesQuery({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useVehiclesQuery(baseOptions: Apollo.QueryHookOptions<Operation.VehiclesQuery, Operation.VehiclesQueryVariables> & ({ variables: Operation.VehiclesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>(VehiclesDocument, options);
      }
export function useVehiclesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>(VehiclesDocument, options);
        }
// @ts-ignore
export function useVehiclesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>;
export function useVehiclesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>): Apollo.UseSuspenseQueryResult<Operation.VehiclesQuery | undefined, Operation.VehiclesQueryVariables>;
export function useVehiclesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>(VehiclesDocument, options);
        }
export type VehiclesQueryHookResult = ReturnType<typeof useVehiclesQuery>;
export type VehiclesLazyQueryHookResult = ReturnType<typeof useVehiclesLazyQuery>;
export type VehiclesSuspenseQueryHookResult = ReturnType<typeof useVehiclesSuspenseQuery>;
export type VehiclesQueryResult = Apollo.QueryResult<Operation.VehiclesQuery, Operation.VehiclesQueryVariables>;
export const LoadCreatedDocument = gql`
    subscription LoadCreated($operatorId: ID!) {
  loadCreated(operatorId: $operatorId) {
    load {
      ...loadDetails
    }
  }
}
    ${LoadDetailsFragmentDoc}`;

/**
 * __useLoadCreatedSubscription__
 *
 * To run a query within a React component, call `useLoadCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLoadCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoadCreatedSubscription({
 *   variables: {
 *      operatorId: // value for 'operatorId'
 *   },
 * });
 */
export function useLoadCreatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<Operation.LoadCreatedSubscription, Operation.LoadCreatedSubscriptionVariables> & ({ variables: Operation.LoadCreatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<Operation.LoadCreatedSubscription, Operation.LoadCreatedSubscriptionVariables>(LoadCreatedDocument, options);
      }
export type LoadCreatedSubscriptionHookResult = ReturnType<typeof useLoadCreatedSubscription>;
export type LoadCreatedSubscriptionResult = Apollo.SubscriptionResult<Operation.LoadCreatedSubscription>;
export const LoadUpdatedDocument = gql`
    subscription LoadUpdated($id: ID!) {
  loadUpdated(loadId: $id) {
    load {
      ...loadDetails
    }
  }
}
    ${LoadDetailsFragmentDoc}`;

/**
 * __useLoadUpdatedSubscription__
 *
 * To run a query within a React component, call `useLoadUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLoadUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoadUpdatedSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLoadUpdatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<Operation.LoadUpdatedSubscription, Operation.LoadUpdatedSubscriptionVariables> & ({ variables: Operation.LoadUpdatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<Operation.LoadUpdatedSubscription, Operation.LoadUpdatedSubscriptionVariables>(LoadUpdatedDocument, options);
      }
export type LoadUpdatedSubscriptionHookResult = ReturnType<typeof useLoadUpdatedSubscription>;
export type LoadUpdatedSubscriptionResult = Apollo.SubscriptionResult<Operation.LoadUpdatedSubscription>;
export const UserUpdatedDocument = gql`
    subscription UserUpdated($id: ID!) {
  userUpdated(membershipId: $id) {
    membership {
      ...membershipDetails
    }
  }
}
    ${MembershipDetailsFragmentDoc}`;

/**
 * __useUserUpdatedSubscription__
 *
 * To run a query within a React component, call `useUserUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useUserUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserUpdatedSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserUpdatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<Operation.UserUpdatedSubscription, Operation.UserUpdatedSubscriptionVariables> & ({ variables: Operation.UserUpdatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<Operation.UserUpdatedSubscription, Operation.UserUpdatedSubscriptionVariables>(UserUpdatedDocument, options);
      }
export type UserUpdatedSubscriptionHookResult = ReturnType<typeof useUserUpdatedSubscription>;
export type UserUpdatedSubscriptionResult = Apollo.SubscriptionResult<Operation.UserUpdatedSubscription>;