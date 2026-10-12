import gql from 'graphql-tag';
import { createMutation, isRequired } from '../createMutation';
import { CreatePlanePayload } from '../schema.d';

const MUTATION_CREATE_PLANE = gql`
  mutation CreatePlane(
    $name: String!
    $registration: String!
    $operatorId: Int!
    $minSlots: Int!
    $maxSlots: Int!
    $hours: Int
    $nextMaintenanceHours: Int
  ) {
    createPlane(
      input: {
        attributes: {
          name: $name
          registration: $registration
          operatorId: $operatorId
          minSlots: $minSlots
          maxSlots: $maxSlots
          hours: $hours
          nextMaintenanceHours: $nextMaintenanceHours
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      plane {
        id
        name
        registration
        minSlots
        maxSlots
        hours
        nextMaintenanceHours

        operator {
          id
          name
          planes {
            id
            name
            registration
            minSlots
            maxSlots
            hours
            nextMaintenanceHours
          }
        }
      }
    }
  }
`;

export default createMutation<
  {
    name: string;
    registration: string;
    operatorId: number;
    minSlots: number;
    maxSlots: number;
    hours?: number;
    nextMaintenanceHours?: number;
  },
  CreatePlanePayload
>(MUTATION_CREATE_PLANE, {
  getPayload: (result) => result.createPlane,
  fieldErrorMap: {
    operatorId: 'operator',
  },
  validates: {
    name: [isRequired('Name is required')],
    registration: [isRequired('Registration is required')],
  },
});
