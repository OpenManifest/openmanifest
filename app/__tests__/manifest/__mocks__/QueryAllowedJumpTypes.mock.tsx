import { AllowedJumpTypesQuery, AllowedJumpTypesQueryVariables } from 'app/api/operations';
import { AllowedJumpTypesDocument } from 'app/api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export const MOCK_QUERY_ALLOWED_JUMP_TYPES = createMockedQuery<
  AllowedJumpTypesQueryVariables,
  AllowedJumpTypesQuery
>(
  AllowedJumpTypesDocument,
  {
    dropzoneId: 1,

    userIds: [],
  },
  {
    dropzone: {
      id: '1',

      allowedJumpTypes: [
        { id: '1', name: 'Freefly' },
        { id: '2', name: 'Angle/Tracking' },
      ],
    },
    jumpTypes: [
      { id: '1', name: 'Freefly' },
      { id: '2', name: 'Angle/Tracking' },
    ],
  }
);
