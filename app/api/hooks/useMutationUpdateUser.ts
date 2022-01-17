import gql from 'graphql-tag';
import { createMutation, isEmail, isRequired, isNumeric, validates } from '../createMutation';
import { MutationUpdateUserArgs, UpdateUserPayload } from '../schema';

const MUTATION_UPDATE_USER = gql`
  mutation UpdateUser(
    $id: Int
    $name: String
    $phone: String
    $email: String
    $pushToken: String
    $nickname: String
    $licenseId: Int
    $exitWeight: Float
  ) {
    updateUser(
      input: {
        id: $id
        attributes: {
          pushToken: $pushToken
          name: $name
          phone: $phone
          email: $email
          nickname: $nickname
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
        pushToken
        phone
        rigs {
          id
          name
          model
          make
          serial
          canopySize
        }
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

export default createMutation<
  { id: number } & MutationUpdateUserArgs['input']['attributes'],
  UpdateUserPayload
>(MUTATION_UPDATE_USER, {
  getPayload: (result) => result.updateUser,
  validates: {
    email: [isRequired('Email is required'), isEmail('Not a valid email')],
    name: [isRequired('Name is required')],
    exitWeight: [
      isRequired('Exit weight is required'),
      isNumeric('Exit weight must be a valid number'),
      validates('Exit weight seems too low?', ({ exitWeight }) => {
        return Number(exitWeight) > 30;
      }),
    ],
  },
  fieldErrorMap: {
    licenseId: 'license',
  },
});
