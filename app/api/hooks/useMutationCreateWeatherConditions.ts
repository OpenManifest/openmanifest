import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { CreateWeatherConditionPayload, WeatherConditionInput } from '../schema.d';

export const MUTATION_CREATE_WEATHER_CONDITION = gql`
  mutation CreateWeatherConditions(
    $id: Int!
    $operatorId: Int!
    $winds: String
    $temperatureC: Float
    $jumpRun: Int
    $exitSpotM: Float
    $offsetM: Float
    $offsetDirection: String
  ) {
    createWeatherCondition(
      input: {
        id: $id
        attributes: {
          operatorId: $operatorId
          winds: $winds
          temperatureC: $temperatureC
          jumpRun: $jumpRun
          exitSpotM: $exitSpotM
          offsetM: $offsetM
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
        temperatureC
        winds {
          speedMps
          altitudeM
          direction
          temperatureC
        }
        jumpRun
        exitSpotM
        offsetM
        offsetDirection
        createdAt
      }
    }
  }
`;

export default createMutation<
  { id: number; operatorId: number } & WeatherConditionInput,
  CreateWeatherConditionPayload
>(MUTATION_CREATE_WEATHER_CONDITION, {
  getPayload: (result) => result.createWeatherCondition,
  validates: {},
  fieldErrorMap: {},
});
