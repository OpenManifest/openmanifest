import { createQuery } from '../createQuery';
import { QueryDropzonesDocument } from '../reflection';
import { Query, QueryDropzonesArgs } from '../schema';

export default createQuery<Query['dropzones'], QueryDropzonesArgs>(QueryDropzonesDocument, {
  getPayload: (query) => query?.dropzones,
});
