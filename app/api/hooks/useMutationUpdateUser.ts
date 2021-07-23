import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
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
          model
          make
          serial
          canopySize
        }
        jumpTypes {
          id
          name
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
  fieldErrorMap: {
    license: 'licenseId',
    exit_weight: 'exitWeight',
  },
});
