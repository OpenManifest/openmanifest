/* eslint-disable */
import type * as Types from './schema.d';

export type QueryDropzoneUserProfileQueryVariables = Types.Exact<{
  dropzoneId: Types.Scalars['Int'];
  dropzoneUserId: Types.Scalars['Int'];
}>;


export type QueryDropzoneUserProfileQuery = { __typename?: 'Query', dropzone: { __typename?: 'Dropzone', id: string, name?: Types.Maybe<string>, dropzoneUser?: Types.Maybe<{ __typename?: 'DropzoneUser', id: string, credits?: Types.Maybe<number>, expiresAt?: Types.Maybe<number>, permissions?: Types.Maybe<Array<Types.Permission>>, role?: Types.Maybe<{ __typename?: 'UserRole', id: string, name?: Types.Maybe<string> }>, user: { __typename?: 'User', id: string, name?: Types.Maybe<string>, exitWeight?: Types.Maybe<string>, email?: Types.Maybe<string>, phone?: Types.Maybe<string>, image?: Types.Maybe<string>, rigs?: Types.Maybe<Array<{ __typename?: 'Rig', id: string, name?: Types.Maybe<string>, model?: Types.Maybe<string>, make?: Types.Maybe<string>, serial?: Types.Maybe<string>, canopySize?: Types.Maybe<number>, repackExpiresAt?: Types.Maybe<number> }>>, jumpTypes?: Types.Maybe<Array<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>>, license?: Types.Maybe<{ __typename?: 'License', id: string, name?: Types.Maybe<string>, federation?: Types.Maybe<{ __typename?: 'Federation', id: string, name?: Types.Maybe<string> }> }> }, slots?: Types.Maybe<{ __typename?: 'SlotConnection', edges?: Types.Maybe<Array<Types.Maybe<{ __typename?: 'SlotEdge', node?: Types.Maybe<{ __typename?: 'Slot', id: string, createdAt: number, load: { __typename?: 'Load', id: string, name?: Types.Maybe<string>, loadNumber: number, dispatchAt?: Types.Maybe<number>, createdAt: number }, jumpType?: Types.Maybe<{ __typename?: 'JumpType', id: string, name?: Types.Maybe<string> }>, ticketType?: Types.Maybe<{ __typename?: 'TicketType', id: string, name?: Types.Maybe<string> }> }> }>>> }> }> } };
