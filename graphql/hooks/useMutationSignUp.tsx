import gql from "graphql-tag";
import { createMutation, isEmail, isRequired, validates } from "../createMutation";
import { MutationUserSignUpArgs, UserSignUpPayload } from "../schema";


export const MUTATION_USER_SIGNUP = gql`
  mutation UserSignUp(
    $email: String!,
    $password: String!,
    $passwordConfirmation: String!
    $name: String!
    $phone: String!
    $pushToken: String
    $exitWeight: Float!
    $licenseId: Int
  ){
    userSignUp(
      email: $email,
      password: $password,
      passwordConfirmation: $passwordConfirmation,
      exitWeight: $exitWeight,
      name: $name,
      phone: $phone,
      pushToken: $pushToken,
      licenseId: $licenseId
    ) {
      authenticatable {
        createdAt,
        email,
        id,
        name,
        phone,
      }
      credentials {
        accessToken
        tokenType
        client
        expiry
        uid
      }
    }
  }
`;


export default createMutation<MutationUserSignUpArgs, UserSignUpPayload>(
  MUTATION_USER_SIGNUP, {
    getPayload: (result) => result.userSignUp,
    fieldErrorMap: {
      license: "licenseId",
    },
    validates: {
      name: [
        isRequired("Name is required")
      ],
      email: [
        isEmail("Please enter a valid email"),
      ],
      passwordConfirmation: [
        validates(
          "Password must have 1 uppercase, 1 lowercase, 1 digit and be at least 8 characters",
          (fields) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}.*$/.test(fields.passwordConfirmation)
        ),
        validates(
          "Passwords don't match",
          (fields) => fields.password === fields.passwordConfirmation
        )
      ]
    }
  }
);