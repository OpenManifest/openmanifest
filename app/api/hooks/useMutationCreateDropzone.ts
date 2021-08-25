import gql from 'graphql-tag';
import { createMutation, isRequired } from '../createMutation';
import { CreateDropzonePayload } from '../schema';

export const MUTATION_CREATE_DROPZONE = gql`
  mutation CreateDropzone(
    $name: String!
    $banner: String
    $federationId: Int!
    $lat: Float
    $lng: Float
    $primaryColor: String
    $secondaryColor: String
  ) {
    createDropzone(
      input: {
        attributes: {
          name: $name
          banner: $banner
          federationId: $federationId
          primaryColor: $primaryColor
          secondaryColor: $secondaryColor
          lat: $lat
          lng: $lng
        }
      }
    ) {
      dropzone {
        id
        name
        banner

        federation {
          id
          name
        }
      }
    }
  }
`;

export default createMutation<
  {
    name: string;
    banner?: string | null;
    federationId: number;
    primaryColor: string | null;
    secondaryColor: string | null;
    lat: number | null;
    lng: number | null;
  },
  CreateDropzonePayload
>(MUTATION_CREATE_DROPZONE, {
  getPayload: (result) => result.createDropzone,
  fieldErrorMap: {
    federationId: 'federation',
  },
  validates: {
    name: [isRequired('Name is required')],
  },
});
