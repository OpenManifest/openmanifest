/* eslint-disable */
import type * as Types from './schema.d';

export type CurrentUserEssentialsFragment = { __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, hasCredits: boolean, hasExitWeight: boolean, hasMembership: boolean, hasReserveInDate: boolean, hasRigInspection: boolean, hasLicense: boolean, permissions?: Types.Maybe<Array<Types.Permission>>, expiresAt?: Types.Maybe<number>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }> };

export type CurrentUserDetailedFragment = { __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, hasCredits: boolean, hasExitWeight: boolean, hasMembership: boolean, hasReserveInDate: boolean, hasRigInspection: boolean, hasLicense: boolean, permissions?: Types.Maybe<Array<Types.Permission>>, expiresAt?: Types.Maybe<number>, user: { __typename?: 'User', id: string, nickname?: Types.Maybe<string>, name?: Types.Maybe<string>, moderationRole?: Types.Maybe<Types.ModerationRole>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, pushToken?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packingCard?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string }> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> }, rigInspections?: Types.Maybe<Array<{ __typename?: 'RigInspection', id: string, isOk: boolean, inspectedBy: { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, rig?: Types.Maybe<{ __typename?: 'Rig', id: string }> }>>, orders?: Types.Maybe<{ __typename?: 'OrderConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'OrderEdge', node?: Types.Maybe<{ __typename?: 'Order', id: string, title?: Types.Maybe<string>, state: Types.OrderState, createdAt: number, amount: number, buyer: { __typename: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, transactions: Array<{ __typename?: 'Transaction', id: string, message?: Types.Maybe<string>, transactionType: Types.TransactionType, status: Types.TransactionStatus, createdAt: number, amount: number, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> }> }>>> }>, availableRigs?: Types.Maybe<Array<{ __typename?: 'Rig', name?: Types.Maybe<string>, id: string, make?: Types.Maybe<string>, model?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, serial?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string }> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }> };

export type DropzoneUserProfileFragment = { __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, expiresAt?: Types.Maybe<number>, permissions?: Types.Maybe<Array<Types.Permission>>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string>, federation?: Types.Maybe<{ __typename?: 'Federation', id: string, name?: Types.Maybe<string> }> }> }, slots?: Types.Maybe<{ __typename?: 'SlotConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'SlotEdge', node?: Types.Maybe<{ __typename?: 'Slot', id: string, createdAt: number, load: { __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, dispatchAt?: Types.Maybe<number>, createdAt: number }, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> }> }>>> }> };

export type DropzoneEssentialsFragment = { __typename?: 'Dropzone', id: string, lat?: Types.Maybe<number>, lng?: Types.Maybe<number>, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, isPublic: boolean, requestPublication: boolean, planes: Array<{ __typename?: 'Plane', id: string, name?: Types.Maybe<string>, registration?: Types.Maybe<string> }>, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> };

export type DropzoneDetailedFragment = { __typename?: 'Dropzone', id: string, lat?: Types.Maybe<number>, lng?: Types.Maybe<number>, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, isPublic: boolean, requestPublication: boolean, federation: { __typename?: 'Federation', id: string, name?: Types.Maybe<string>, slug?: Types.Maybe<string> }, currentConditions: { __typename?: 'WeatherCondition', id: string, jumpRun?: Types.Maybe<number>, temperature?: Types.Maybe<number>, offsetDirection?: Types.Maybe<number>, offsetMiles?: Types.Maybe<number>, winds?: Types.Maybe<Array<{ __typename?: 'Wind', altitude?: Types.Maybe<string>, speed?: Types.Maybe<string>, direction?: Types.Maybe<string> }>> }, loads: { __typename?: 'LoadConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'LoadEdge', node?: Types.Maybe<{ __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, isOpen: boolean, maxSlots: number, state: Types.LoadState }> }>>> }, planes: Array<{ __typename?: 'Plane', id: string, name?: Types.Maybe<string>, registration?: Types.Maybe<string> }>, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> };

export type DropzoneExtensiveFragment = { __typename?: 'Dropzone', id: string, lat?: Types.Maybe<number>, lng?: Types.Maybe<number>, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, isPublic: boolean, requestPublication: boolean, currentUser: { __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, hasCredits: boolean, hasExitWeight: boolean, hasMembership: boolean, hasReserveInDate: boolean, hasRigInspection: boolean, hasLicense: boolean, permissions?: Types.Maybe<Array<Types.Permission>>, expiresAt?: Types.Maybe<number>, user: { __typename?: 'User', id: string, nickname?: Types.Maybe<string>, name?: Types.Maybe<string>, moderationRole?: Types.Maybe<Types.ModerationRole>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, pushToken?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packingCard?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string }> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> }, rigInspections?: Types.Maybe<Array<{ __typename?: 'RigInspection', id: string, isOk: boolean, inspectedBy: { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, rig?: Types.Maybe<{ __typename?: 'Rig', id: string }> }>>, orders?: Types.Maybe<{ __typename?: 'OrderConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'OrderEdge', node?: Types.Maybe<{ __typename?: 'Order', id: string, title?: Types.Maybe<string>, state: Types.OrderState, createdAt: number, amount: number, buyer: { __typename: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, transactions: Array<{ __typename?: 'Transaction', id: string, message?: Types.Maybe<string>, transactionType: Types.TransactionType, status: Types.TransactionStatus, createdAt: number, amount: number, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> }> }>>> }>, availableRigs?: Types.Maybe<Array<{ __typename?: 'Rig', name?: Types.Maybe<string>, id: string, make?: Types.Maybe<string>, model?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, serial?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string }> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }> }, federation: { __typename?: 'Federation', id: string, name?: Types.Maybe<string>, slug?: Types.Maybe<string> }, currentConditions: { __typename?: 'WeatherCondition', id: string, jumpRun?: Types.Maybe<number>, temperature?: Types.Maybe<number>, offsetDirection?: Types.Maybe<number>, offsetMiles?: Types.Maybe<number>, winds?: Types.Maybe<Array<{ __typename?: 'Wind', altitude?: Types.Maybe<string>, speed?: Types.Maybe<string>, direction?: Types.Maybe<string> }>> }, loads: { __typename?: 'LoadConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'LoadEdge', node?: Types.Maybe<{ __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, isOpen: boolean, maxSlots: number, state: Types.LoadState }> }>>> }, planes: Array<{ __typename?: 'Plane', id: string, name?: Types.Maybe<string>, registration?: Types.Maybe<string> }>, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> };

export type LoadFragment = { __typename?: 'Load', id: string, name?: Types.Maybe<string>, createdAt: number, dispatchAt?: Types.Maybe<number>, hasLanded?: Types.Maybe<boolean>, loadNumber: number, isFull: boolean, state: Types.LoadState, isOpen: boolean, weight: number, maxSlots: number, availableSlots: number, occupiedSlots: number, plane: { __typename?: 'Plane', id: string, maxSlots?: Types.Maybe<number>, name?: Types.Maybe<string> }, gca?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, pilot?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, loadMaster?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, slots?: Types.Maybe<Array<{ __typename?: 'Slot', id: string, createdAt: number, exitWeight: number, passengerName?: Types.Maybe<string>, passengerExitWeight?: Types.Maybe<number>, wingLoading?: Types.Maybe<number>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, nickname?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, image?: Types.Maybe<string>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> } }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, altitude?: Types.Maybe<number>, isTandem?: Types.Maybe<boolean>, extras: Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }> }>, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string> }>> }>> };

export type OrderFragment = { __typename?: 'Order', id: string, state: Types.OrderState, amount: number, title?: Types.Maybe<string>, orderNumber: number, buyer: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, amountCents?: Types.Maybe<number>, createdAt: number, updatedAt: number, transactions: Array<{ __typename?: 'Transaction', id: string, transactionType: Types.TransactionType, amount: number, status: Types.TransactionStatus, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> };

export type RigEssentialsFragment = { __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string> };

export type UserRigDetailedFragment = { __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string> }>> }> };

export type SlotFragment = { __typename?: 'Slot', id: string, createdAt: number, exitWeight: number, passengerName?: Types.Maybe<string>, passengerExitWeight?: Types.Maybe<number>, wingLoading?: Types.Maybe<number>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, nickname?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, image?: Types.Maybe<string>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> } }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, altitude?: Types.Maybe<number>, isTandem?: Types.Maybe<boolean>, extras: Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }> }>, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string> }>> };

export type TransactionFragment = { __typename?: 'Transaction', id: string, transactionType: Types.TransactionType, amount: number, status: Types.TransactionStatus, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } };

export type ConfirmUserMutationVariables = Types.Exact<{
  token: Types.Scalars['String'];
}>;


export type ConfirmUserMutation = { __typename?: 'Mutation', userConfirmRegistrationWithToken?: Types.Maybe<{ __typename?: 'UserConfirmRegistrationWithTokenPayload', authenticatable: { __typename?: 'User', id: string, apfNumber?: Types.Maybe<string>, phone?: Types.Maybe<string>, pushToken?: Types.Maybe<string>, email?: Types.Maybe<string> }, credentials?: Types.Maybe<{ __typename?: 'Credential', accessToken: string, client: string, expiry: number, tokenType: string, uid: string }> }> };

export type CreateOrderMutationVariables = Types.Exact<{
  buyer: Types.WalletInput;
  seller: Types.WalletInput;
  dropzoneId: Types.Scalars['Int'];
  title?: Types.Maybe<Types.Scalars['String']>;
  amount: Types.Scalars['Int'];
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder?: Types.Maybe<{ __typename?: 'CreateOrderPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, order?: Types.Maybe<{ __typename?: 'Order', id: string, state: Types.OrderState, amount: number, title?: Types.Maybe<string>, orderNumber: number, buyer: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, amountCents?: Types.Maybe<number>, createdAt: number, updatedAt: number, transactions: Array<{ __typename?: 'Transaction', id: string, transactionType: Types.TransactionType, amount: number, status: Types.TransactionStatus, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> }> }> };

export type CreateRigMutationVariables = Types.Exact<{
  make?: Types.Maybe<Types.Scalars['String']>;
  name?: Types.Maybe<Types.Scalars['String']>;
  model?: Types.Maybe<Types.Scalars['String']>;
  serial?: Types.Maybe<Types.Scalars['String']>;
  rigType?: Types.Maybe<Types.Scalars['String']>;
  canopySize?: Types.Maybe<Types.Scalars['Int']>;
  repackExpiresAt?: Types.Maybe<Types.Scalars['Int']>;
  userId?: Types.Maybe<Types.Scalars['Int']>;
  dropzoneId?: Types.Maybe<Types.Scalars['Int']>;
}>;


export type CreateRigMutation = { __typename?: 'Mutation', createRig?: Types.Maybe<{ __typename?: 'CreateRigPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, rig?: Types.Maybe<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string> }>> }> }> }> };

export type FinalizeLoadMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  state: Types.LoadState;
}>;


export type FinalizeLoadMutation = { __typename?: 'Mutation', finalizeLoad?: Types.Maybe<{ __typename?: 'FinalizeLoadPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', message: string, field: string }>>, load?: Types.Maybe<{ __typename?: 'Load', id: string, name?: Types.Maybe<string>, createdAt: number, dispatchAt?: Types.Maybe<number>, hasLanded?: Types.Maybe<boolean>, loadNumber: number, isFull: boolean, state: Types.LoadState, isOpen: boolean, weight: number, maxSlots: number, availableSlots: number, occupiedSlots: number, plane: { __typename?: 'Plane', id: string, maxSlots?: Types.Maybe<number>, name?: Types.Maybe<string> }, gca?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, pilot?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, loadMaster?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, slots?: Types.Maybe<Array<{ __typename?: 'Slot', id: string, createdAt: number, exitWeight: number, passengerName?: Types.Maybe<string>, passengerExitWeight?: Types.Maybe<number>, wingLoading?: Types.Maybe<number>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, nickname?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, image?: Types.Maybe<string>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> } }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, altitude?: Types.Maybe<number>, isTandem?: Types.Maybe<boolean>, extras: Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }> }>, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string> }>> }>> }> }> };

export type JoinFederationMutationVariables = Types.Exact<{
  federationId: Types.Scalars['Int'];
  uid?: Types.Maybe<Types.Scalars['String']>;
  licenseId?: Types.Maybe<Types.Scalars['Int']>;
}>;


export type JoinFederationMutation = { __typename?: 'Mutation', joinFederation?: Types.Maybe<{ __typename?: 'JoinFederationPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, userFederation?: Types.Maybe<{ __typename?: 'UserFederation', id: string, uid?: Types.Maybe<string>, qualifications?: Types.Maybe<Array<{ __typename?: 'UserQualification', id: string, name?: Types.Maybe<string>, uid?: Types.Maybe<string>, expiresAt?: Types.Maybe<number> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, nickname?: Types.Maybe<string>, userFederations?: Types.Maybe<Array<{ __typename?: 'UserFederation', federation: { __typename?: 'Federation', id: string, name?: Types.Maybe<string>, slug?: Types.Maybe<string> }, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> }>> } }> }> };

export type ReloadWeatherMutationVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
  id: Types.Scalars['Int'];
}>;


export type ReloadWeatherMutation = { __typename?: 'Mutation', reloadWeatherCondition?: Types.Maybe<{ __typename?: 'ReloadWeatherConditionPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, weatherCondition?: Types.Maybe<{ __typename?: 'WeatherCondition', createdAt: number, exitSpotMiles?: Types.Maybe<number>, id: string, jumpRun?: Types.Maybe<number>, offsetDirection?: Types.Maybe<number>, offsetMiles?: Types.Maybe<number>, temperature?: Types.Maybe<number>, updatedAt: number, winds?: Types.Maybe<Array<{ __typename?: 'Wind', altitude?: Types.Maybe<string>, direction?: Types.Maybe<string>, speed?: Types.Maybe<string>, temperature?: Types.Maybe<string> }>> }> }> };

export type UpdateRigMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  name?: Types.Maybe<Types.Scalars['String']>;
  make?: Types.Maybe<Types.Scalars['String']>;
  model?: Types.Maybe<Types.Scalars['String']>;
  serial?: Types.Maybe<Types.Scalars['String']>;
  rigType?: Types.Maybe<Types.Scalars['String']>;
  canopySize?: Types.Maybe<Types.Scalars['Int']>;
  packingCard?: Types.Maybe<Types.Scalars['String']>;
  repackExpiresAt?: Types.Maybe<Types.Scalars['Int']>;
  userId?: Types.Maybe<Types.Scalars['Int']>;
  dropzoneId?: Types.Maybe<Types.Scalars['Int']>;
}>;


export type UpdateRigMutation = { __typename?: 'Mutation', updateRig?: Types.Maybe<{ __typename?: 'UpdateRigPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, rig?: Types.Maybe<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, make?: Types.Maybe<string>, model?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packValue?: Types.Maybe<number>, maintainedAt?: Types.Maybe<number>, rigType?: Types.Maybe<string>, packingCard?: Types.Maybe<string> }>> }> }> }> };

export type UserSignUpMutationVariables = Types.Exact<{
  email: Types.Scalars['String'];
  password: Types.Scalars['String'];
  passwordConfirmation: Types.Scalars['String'];
  name: Types.Scalars['String'];
  phone: Types.Scalars['String'];
  pushToken?: Types.Maybe<Types.Scalars['String']>;
  exitWeight: Types.Scalars['Float'];
  licenseId?: Types.Maybe<Types.Scalars['Int']>;
}>;


export type UserSignUpMutation = { __typename?: 'Mutation', userSignUp?: Types.Maybe<{ __typename?: 'UserSignUpPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, authenticatable?: Types.Maybe<{ __typename?: 'User', createdAt: number, email?: Types.Maybe<string>, id: string, name?: Types.Maybe<string>, phone?: Types.Maybe<string> }>, credentials?: Types.Maybe<{ __typename?: 'Credential', accessToken: string, tokenType: string, client: string, expiry: number, uid: string }> }> };

export type QueryDropzoneQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
  earliestTimestamp?: Types.Maybe<Types.Scalars['Int']>;
}>;


export type QueryDropzoneQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, lat?: Types.Maybe<number>, lng?: Types.Maybe<number>, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, isPublic: boolean, requestPublication: boolean, currentUser: { __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, hasCredits: boolean, hasExitWeight: boolean, hasMembership: boolean, hasReserveInDate: boolean, hasRigInspection: boolean, hasLicense: boolean, permissions?: Types.Maybe<Array<Types.Permission>>, expiresAt?: Types.Maybe<number>, user: { __typename?: 'User', id: string, nickname?: Types.Maybe<string>, name?: Types.Maybe<string>, moderationRole?: Types.Maybe<Types.ModerationRole>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, pushToken?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number>, packingCard?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string }> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> }, rigInspections?: Types.Maybe<Array<{ __typename?: 'RigInspection', id: string, isOk: boolean, inspectedBy: { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, rig?: Types.Maybe<{ __typename?: 'Rig', id: string }> }>>, orders?: Types.Maybe<{ __typename?: 'OrderConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'OrderEdge', node?: Types.Maybe<{ __typename?: 'Order', id: string, title?: Types.Maybe<string>, state: Types.OrderState, createdAt: number, amount: number, buyer: { __typename: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, transactions: Array<{ __typename?: 'Transaction', id: string, message?: Types.Maybe<string>, transactionType: Types.TransactionType, status: Types.TransactionStatus, createdAt: number, amount: number, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> }> }>>> }>, availableRigs?: Types.Maybe<Array<{ __typename?: 'Rig', name?: Types.Maybe<string>, id: string, make?: Types.Maybe<string>, model?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, serial?: Types.Maybe<string>, user?: Types.Maybe<{ __typename?: 'User', id: string }> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }> }, federation: { __typename?: 'Federation', id: string, name?: Types.Maybe<string>, slug?: Types.Maybe<string> }, currentConditions: { __typename?: 'WeatherCondition', id: string, jumpRun?: Types.Maybe<number>, temperature?: Types.Maybe<number>, offsetDirection?: Types.Maybe<number>, offsetMiles?: Types.Maybe<number>, winds?: Types.Maybe<Array<{ __typename?: 'Wind', altitude?: Types.Maybe<string>, speed?: Types.Maybe<string>, direction?: Types.Maybe<string> }>> }, loads: { __typename?: 'LoadConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'LoadEdge', node?: Types.Maybe<{ __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, isOpen: boolean, maxSlots: number, state: Types.LoadState }> }>>> }, planes: Array<{ __typename?: 'Plane', id: string, name?: Types.Maybe<string>, registration?: Types.Maybe<string> }>, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> } };

export type DropzoneTransactionsQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
  after?: Types.Maybe<Types.Scalars['String']>;
}>;


export type DropzoneTransactionsQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, lat?: Types.Maybe<number>, lng?: Types.Maybe<number>, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, isPublic: boolean, requestPublication: boolean, orders?: Types.Maybe<{ __typename?: 'OrderConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'OrderEdge', node?: Types.Maybe<{ __typename?: 'Order', id: string }> }>>> }>, planes: Array<{ __typename?: 'Plane', id: string, name?: Types.Maybe<string>, registration?: Types.Maybe<string> }>, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> } };

export type QueryDropzoneUserProfileQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
  dropzoneUserId: Types.Scalars['Int'];
}>;


export type QueryDropzoneUserProfileQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, expiresAt?: Types.Maybe<number>, permissions?: Types.Maybe<Array<Types.Permission>>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string>, federation?: Types.Maybe<{ __typename?: 'Federation', id: string, name?: Types.Maybe<string> }> }> }, slots?: Types.Maybe<{ __typename?: 'SlotConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'SlotEdge', node?: Types.Maybe<{ __typename?: 'Slot', id: string, createdAt: number, load: { __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, dispatchAt?: Types.Maybe<number>, createdAt: number }, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> }> }>>> }> }> } };

export type AddressToLocationQueryVariables = Types.Exact<{
  search: Types.Scalars['String'];
}>;


export type AddressToLocationQuery = { __typename?: 'Query', geocode?: Types.Maybe<{ __typename?: 'GeocodedLocation', formattedString?: Types.Maybe<string>, id: string, lat?: Types.Maybe<number>, lng: number }> };

export type CurrentUserPermissionsQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
}>;


export type CurrentUserPermissionsQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, currentUser: { __typename?: 'DropzoneUser', id: string, permissions?: Types.Maybe<Array<Types.Permission>>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }> } } };
