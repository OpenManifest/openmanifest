import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { MutationUpdateDropzoneArgs, UpdateDropzonePayload } from '../schema';

const MUTATION_UPDATE_DROPZONE = gql`
  mutation UpdateDropzone(
    $id: Int!
    $name: String!
    $requestPublication: Boolean
    $banner: String
    $federationId: Int!
    $lat: Float
    $lng: Float
    $primaryColor: String
    $secondaryColor: String
    $isCreditSystemEnabled: Boolean
    $isPublic: Boolean
  ) {
    updateDropzone(
      input: {
        id: $id
        attributes: {
          name: $name
          banner: $banner
          lat: $lat
          lng: $lng
          requestPublication: $requestPublication
          federationId: $federationId
          primaryColor: $primaryColor
          secondaryColor: $secondaryColor
          isCreditSystemEnabled: $isCreditSystemEnabled
          isPublic: $isPublic
        }
      }
    ) {
      dropzone {
        id
        name
        banner
        primaryColor
        secondaryColor
        isCreditSystemEnabled

        planes {
          id
          name
        }

        federation {
          id
          name
        }
      }
    }
  }
`;

export default createMutation<
  { id: number } & MutationUpdateDropzoneArgs['input']['attributes'],
  UpdateDropzonePayload
>(MUTATION_UPDATE_DROPZONE, {
  getPayload: (result) => result.updateDropzone,
  fieldErrorMap: {},
});
