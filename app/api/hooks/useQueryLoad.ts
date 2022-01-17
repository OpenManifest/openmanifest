import { LoadDocument } from 'app/api/reflection';
import { createQuery } from '../createQuery';
import { Query } from '../schema';

export default createQuery<
  Query['load'],
  {
    id: number;
  }
>(LoadDocument, {
  getPayload: (query) => query?.load,
});
