import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { MutationUpdatePlaneArgs, UpdatePlanePayload } from '../schema.d';

const MUTATION_UPDATE_PLANE = gql`
  mutation UpdatePlane(
    $id: Int!
    $name: String!
    $registration: String!
    $minSlots: Int!
    $maxSlots: Int!
    $hours: Int
    $nextMaintenanceHours: Int
  ) {
    updatePlane(
      input: {
        id: $id
        attributes: {
          name: $name
          registration: $registration
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

        dropzone {
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
  { id: number } & MutationUpdatePlaneArgs['input']['attributes'],
  UpdatePlanePayload
>(MUTATION_UPDATE_PLANE, {
  getPayload: (result) => result.updatePlane,
  fieldErrorMap: {},
});
