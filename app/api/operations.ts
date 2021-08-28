/* eslint-disable */
import type * as Types from './schema.d';

export type LoadFragment = { __typename?: 'Load', id: string, name?: Types.Maybe<string>, createdAt: number, dispatchAt?: Types.Maybe<number>, hasLanded?: Types.Maybe<boolean>, loadNumber: number, isFull: boolean, state: Types.LoadState, isOpen: boolean, weight: number, maxSlots: number, availableSlots: number, occupiedSlots: number, plane: { __typename?: 'Plane', id: string, maxSlots?: Types.Maybe<number>, name?: Types.Maybe<string> }, gca?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, pilot?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, loadMaster?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, slots?: Types.Maybe<Array<{ __typename?: 'Slot', id: string, createdAt: number, exitWeight: number, passengerName?: Types.Maybe<string>, passengerExitWeight?: Types.Maybe<number>, wingLoading?: Types.Maybe<number>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, image?: Types.Maybe<string>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> } }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, altitude?: Types.Maybe<number>, isTandem?: Types.Maybe<boolean>, extras: Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }> }>, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string> }>> }>> };

export type OrderFragment = { __typename?: 'Order', id: string, state: Types.OrderState, amount: number, title?: Types.Maybe<string>, orderNumber: number, buyer: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, amountCents?: Types.Maybe<number>, createdAt: number, updatedAt: number, transactions: Array<{ __typename?: 'Transaction', id: string, transactionType: Types.TransactionType, amount: number, status: Types.TransactionStatus, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> };

export type SlotFragment = { __typename?: 'Slot', id: string, createdAt: number, exitWeight: number, passengerName?: Types.Maybe<string>, passengerExitWeight?: Types.Maybe<number>, wingLoading?: Types.Maybe<number>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, image?: Types.Maybe<string>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> } }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, altitude?: Types.Maybe<number>, isTandem?: Types.Maybe<boolean>, extras: Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }> }>, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string> }>> };

export type TransactionFragment = { __typename?: 'Transaction', id: string, transactionType: Types.TransactionType, amount: number, status: Types.TransactionStatus, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } };

export type CreateOrderMutationVariables = Types.Exact<{
  buyer: Types.WalletInput;
  seller: Types.WalletInput;
  dropzoneId: Types.Scalars['Int'];
  title?: Types.Maybe<Types.Scalars['String']>;
  amount: Types.Scalars['Int'];
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder?: Types.Maybe<{ __typename?: 'CreateOrderPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, order?: Types.Maybe<{ __typename?: 'Order', id: string, state: Types.OrderState, amount: number, title?: Types.Maybe<string>, orderNumber: number, buyer: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, seller: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, item?: Types.Maybe<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, title?: Types.Maybe<string>, cost: number } | { __typename?: 'Slot', id: string, title?: Types.Maybe<string>, cost: number, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, cost: number }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }>> } | { __typename?: 'TicketType', id: string, title?: Types.Maybe<string>, cost: number }>, receipts?: Types.Maybe<Array<{ __typename?: 'Receipt', id: string, amountCents?: Types.Maybe<number>, createdAt: number, updatedAt: number, transactions: Array<{ __typename?: 'Transaction', id: string, transactionType: Types.TransactionType, amount: number, status: Types.TransactionStatus, sender: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }, receiver: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string> } | { __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } } }> }>> }> }> };

export type FinalizeLoadMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  state: Types.LoadState;
}>;


export type FinalizeLoadMutation = { __typename?: 'Mutation', finalizeLoad?: Types.Maybe<{ __typename?: 'FinalizeLoadPayload', errors?: Types.Maybe<Array<string>>, fieldErrors?: Types.Maybe<Array<{ __typename?: 'FieldError', message: string, field: string }>>, load?: Types.Maybe<{ __typename?: 'Load', id: string, name?: Types.Maybe<string>, createdAt: number, dispatchAt?: Types.Maybe<number>, hasLanded?: Types.Maybe<boolean>, loadNumber: number, isFull: boolean, state: Types.LoadState, isOpen: boolean, weight: number, maxSlots: number, availableSlots: number, occupiedSlots: number, plane: { __typename?: 'Plane', id: string, maxSlots?: Types.Maybe<number>, name?: Types.Maybe<string> }, gca?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, pilot?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, loadMaster?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, user: { __typename?: 'User', id: string, name?: Types.Maybe<string> } }>, slots?: Types.Maybe<Array<{ __typename?: 'Slot', id: string, createdAt: number, exitWeight: number, passengerName?: Types.Maybe<string>, passengerExitWeight?: Types.Maybe<number>, wingLoading?: Types.Maybe<number>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, image?: Types.Maybe<string>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string> }> } }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string>, altitude?: Types.Maybe<number>, isTandem?: Types.Maybe<boolean>, extras: Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string>, cost: number }> }>, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, extras?: Types.Maybe<Array<{ __typename?: 'Extra', id: string, name?: Types.Maybe<string> }>> }>> }> }> };

export type QueryDropzoneUserProfileQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
  dropzoneUserId: Types.Scalars['Int'];
}>;


export type QueryDropzoneUserProfileQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, expiresAt?: Types.Maybe<number>, permissions?: Types.Maybe<Array<Types.Permission>>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string>, federation?: Types.Maybe<{ __typename?: 'Federation', id: string, name?: Types.Maybe<string> }> }> }, slots?: Types.Maybe<{ __typename?: 'SlotConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'SlotEdge', node?: Types.Maybe<{ __typename?: 'Slot', id: string, createdAt: number, load: { __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, dispatchAt?: Types.Maybe<number>, createdAt: number }, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> }> }>>> }> }> } };

export type CurrentUserPermissionsQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
}>;


export type CurrentUserPermissionsQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string>, primaryColor?: Types.Maybe<string>, secondaryColor?: Types.Maybe<string>, currentUser: { __typename?: 'DropzoneUser', id: string, permissions?: Types.Maybe<Array<Types.Permission>>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }> } } };