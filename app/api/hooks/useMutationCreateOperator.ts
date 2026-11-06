import { createMutation, isRequired } from '../createMutation';
import { CreateOperatorDocument } from '../reflection';
import { CreateOperatorMutation } from '../operations';
import type { Industry } from '../schema.d';

export default createMutation<
  {
    industry: Industry;
    timeZone: string;
    name: string;
    banner?: string | null;
    certificationBodyIds: number[];
    primaryColor: string | null;
    secondaryColor?: string | null;
    lat: number | null;
    lng: number | null;
  },
  Required<CreateOperatorMutation>['createOperator']
>(CreateOperatorDocument, {
  getPayload: (result) => result.createOperator,
  fieldErrorMap: {
    certificationBodyIds: 'certificationBodies',
  },
  validates: {
    name: [isRequired('Name is required')],
  },
});
