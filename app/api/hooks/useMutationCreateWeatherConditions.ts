import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { CreateWeatherConditionPayload, WeatherConditionInput } from '../schema';

export const MUTATION_CREATE_WEATHER_CONDITION = gql`
  mutation CreateWeatherConditions(
    $id: Int!
    $dropzoneId: Int!
    $winds: String
    $temperature: Int
    $jumpRun: Int
    $exitSpotMiles: Int
    $offsetMiles: Int
    $offsetDirection: String
  ) {
    createWeatherCondition(
      input: {
        id: $id
        attributes: {
          dropzoneId: $dropzoneId
          winds: $winds
          temperature: $temperature
          jumpRun: $jumpRun
          exitSpotMiles: $exitSpotMiles
          offsetMiles: $offsetMiles
          offsetDirection: $offsetDirection
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      weatherCondition {
        id
        temperature
        winds {
          speed
          altitude
          direction
        }
        jumpRun
        exitSpotMiles
        offsetMiles
        offsetDirection
        createdAt
      }
    }
  }
`;

export default createMutation<
  { id: number; dropzoneId: number } & WeatherConditionInput,
  CreateWeatherConditionPayload
>(MUTATION_CREATE_WEATHER_CONDITION, {
  getPayload: (result) => result.createWeatherCondition,
  validates: {},
  fieldErrorMap: {},
});
