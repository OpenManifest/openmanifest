import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { MutationUpdateVehicleArgs, UpdateVehiclePayload } from '../schema.d';

const MUTATION_UPDATE_VEHICLE = gql`
  mutation UpdatePlane(
    $id: Int!
    $name: String!
    $registration: String!
    $minCapacity: Int!
    $capacity: Int!
    $hours: Int
    $nextMaintenanceHours: Int
  ) {
    updateVehicle(
      input: {
        id: $id
        attributes: {
          name: $name
          registration: $registration
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
  { id: number } & MutationUpdateVehicleArgs['input']['attributes'],
  UpdateVehiclePayload
>(MUTATION_UPDATE_VEHICLE, {
  getPayload: (result) => result.updateVehicle,
  fieldErrorMap: {},
});
