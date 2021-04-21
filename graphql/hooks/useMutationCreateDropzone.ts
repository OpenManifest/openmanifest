import gql from "graphql-tag";
import { createMutation, isRequired } from "../createMutation";
import { CreateDropzonePayload, Mutation } from "../schema";


export const MUTATION_CREATE_DROPZONE = gql`
mutation CreateDropzone(
  $name: String!,
  $banner: String!,
  $federationId: Int!
){
  createDropzone(input: { attributes: { name: $name, banner: $banner, federationId: $federationId }}) {
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


export default createMutation<{
  name: string,
  banner: string,
  federationId: number,
}, CreateDropzonePayload>(
  MUTATION_CREATE_DROPZONE, {
    getPayload: (result) => result.createDropzone,
    fieldErrorMap: {
      federation: "federationId",
    },
    validates: {
      name: [
        isRequired("Name is required")
      ]
    }
  }
)