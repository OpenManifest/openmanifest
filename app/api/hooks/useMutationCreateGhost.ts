import gql from 'graphql-tag';
import { createMutation, isEmail, isNumeric, isRequired } from '../createMutation';
import { CreateGhostPayload, MutationCreateGhostArgs } from '../schema';

const MUTATION_CREATE_GHOST = gql`
  mutation CreateGhost(
    $name: String!
    $phone: String
    $email: String!
    $federationNumber: String
    $roleId: Int!
    $licenseId: Int
    $dropzoneId: Int!
    $exitWeight: Float!
  ) {
    createGhost(
      input: {
        attributes: {
          roleId: $roleId
          federationNumber: $federationNumber
          name: $name
          phone: $phone
          email: $email
          dropzoneId: $dropzoneId
          licenseId: $licenseId
          exitWeight: $exitWeight
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      user {
        id
        name
        exitWeight
        email
        phone

        jumpTypes {
          id
          name
        }
        userFederations {
          id
          license {
            id
            name
          }
          federation {
            id
            name
            slug
          }
        }
        license {
          id
          name

          federation {
            id
            name
          }
        }
      }
    }
  }
`;

export default createMutation<MutationCreateGhostArgs['input']['attributes'], CreateGhostPayload>(
  MUTATION_CREATE_GHOST,
  {
    getPayload: (result) => result.createGhost,
    validates: {
      exitWeight: [
        isRequired('Exit weight must be provided'),
        isNumeric('Please enter a valid number'),
      ],
      email: [
        isRequired('Please provide a valid email address'),
        isEmail('Please provide a valid email address'),
      ],
      name: [isRequired('Name is required')],

      roleId: [isRequired('You must select a role')],
    },
    fieldErrorMap: {
      license: 'licenseId',
      exit_weight: 'exitWeight',
      role: 'roleId',
    },
  }
);
