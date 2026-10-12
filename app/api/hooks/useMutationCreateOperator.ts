import { createMutation, isRequired } from '../createMutation';
import { CreateOperatorDocument } from '../reflection';
import { CreateOperatorMutation } from '../operations';

export default createMutation<
  {
    name: string;
    banner?: string | null;
    federation: number;
    primaryColor: string | null;
    secondaryColor?: string | null;
    lat: number | null;
    lng: number | null;
  },
  Required<CreateOperatorMutation>['createOperator']
>(CreateOperatorDocument, {
  getPayload: (result) => result.createOperator,
  fieldErrorMap: {
    federation: 'federation',
  },
  validates: {
    name: [isRequired('Name is required')],
  },
});
