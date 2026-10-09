import { DateTime } from 'luxon';
import { LoadsQuery, LoadsQueryVariables } from '../../../api/operations';
import { LoadsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';
import { loadEssentials } from './QueryLoad.mock';

export default createMockedQuery<LoadsQueryVariables, LoadsQuery>(
  LoadsDocument,
  { dropzone: '1', date: DateTime.local().toISODate() },
  {
    loads: {
      __typename: 'LoadConnection',
      edges: [
        {
          __typename: 'LoadEdge',
          node: { ...loadEssentials, id: '1', name: 'Load 1', loadNumber: 1 },
        },
        {
          __typename: 'LoadEdge',
          node: { ...loadEssentials, id: '2', name: 'Load 2', loadNumber: 2 },
        },
      ],
    },
  }
);
