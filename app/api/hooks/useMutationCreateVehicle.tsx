import gql from 'graphql-tag';
import { createMutation, isRequired } from '../createMutation';
import { CreateVehiclePayload } from '../schema.d';

const MUTATION_CREATE_VEHICLE = gql`
  mutation CreatePlane(
    $name: String!
    $registration: String!
    $operatorId: Int!
    $minCapacity: Int!
    $capacity: Int!
    $hours: Int
    $nextMaintenanceHours: Int
  ) {
    createVehicle(
      input: {
        attributes: {
          name: $name
          registration: $registration
          operatorId: $operatorId
          minCapacity: $minCapacity
          capacity: $capacity
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
      vehicle {
        id
        name
        registration
        minCapacity
        capacity
        hours
        nextMaintenanceHours

        operator {
          id
          name
          vehicles {
            id
            name
            registration
            minCapacity
            capacity
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
    minCapacity: number;
    capacity: number;
    hours?: number;
    nextMaintenanceHours?: number;
  },
  CreateVehiclePayload
>(MUTATION_CREATE_VEHICLE, {
  getPayload: (result) => result.createVehicle,
  fieldErrorMap: {
    operatorId: 'operator',
  },
  validates: {
    name: [isRequired('Name is required')],
    registration: [isRequired('Registration is required')],
  },
});
