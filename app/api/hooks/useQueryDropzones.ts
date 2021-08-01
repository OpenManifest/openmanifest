import gql from 'graphql-tag';
import { createQuery } from '../createQuery';
import { Query } from '../schema';

const QUERY_DROPZONES = gql`
  query QueryDropzones {
    dropzones {
      edges {
        node {
          id
          name
          primaryColor
          secondaryColor
          banner
          ticketTypes {
            id
            name
            cost
            allowManifestingSelf
            currency
          }
          planes {
            id
            name
            registration
            minSlots
            maxSlots
          }
        }
      }
    }
  }
`;

export default createQuery<Query['dropzones'], never>(QUERY_DROPZONES, {
  getPayload: (query) => query?.dropzones,
});
