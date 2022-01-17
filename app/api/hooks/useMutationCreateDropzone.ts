import { createMutation, isRequired } from '../createMutation';
import { CreateDropzoneDocument } from '../reflection';
import { CreateDropzoneMutation } from '../operations';

export default createMutation<
  {
    name: string;
    banner?: string | null;
    federationId: number;
    primaryColor: string | null;
    secondaryColor?: string | null;
    lat: number | null;
    lng: number | null;
  },
  Required<CreateDropzoneMutation>['createDropzone']
>(CreateDropzoneDocument, {
  getPayload: (result) => result.createDropzone,
  fieldErrorMap: {
    federationId: 'federation',
  },
  validates: {
    name: [isRequired('Name is required')],
  },
});
