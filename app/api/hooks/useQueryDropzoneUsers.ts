import { createQuery } from '../createQuery';
import { DropzoneUsersDocument } from '../reflection';
import { DropzoneUsersQuery, DropzoneUsersQueryVariables } from '../operations';

export default createQuery<
  DropzoneUsersQuery['dropzone']['dropzoneUsers'],
  DropzoneUsersQueryVariables
>(DropzoneUsersDocument, {
  getPayload: (query) => query?.dropzone?.dropzoneUsers,
});
