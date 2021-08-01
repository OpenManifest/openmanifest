import { Dropzone } from '../../../api/schema.d';
// eslint-disable-next-line max-len
import { QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES } from '../../../components/input/chip_select/JumpTypeChipSelect';

export const MOCK_QUERY_ALLOWED_JUMP_TYPES = {
  request: {
    query: QUERY_DROPZONE_USERS_ALLOWED_JUMP_TYPES,
    variables: {
      dropzoneId: 1,
      userIds: [],
    },
  },
  result: {
    data: {
      dropzone: {
        id: '1',

        allowedJumpTypes: [
          { id: '1', name: 'Freefly' },
          { id: '2', name: 'Angle/Tracking' },
        ],
      } as Dropzone,
    },
  },
};
