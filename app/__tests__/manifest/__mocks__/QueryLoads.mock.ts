import { dropzoneExtensive } from 'app/__fixtures__/dropzone.fixture';
import { todayInZone } from 'app/utils/dropzoneTime';
import { LoadsQuery, LoadsQueryVariables } from '../../../api/operations';
import { LoadsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';
import { loadEssentials } from './QueryLoad.mock';

export default createMockedQuery<LoadsQueryVariables, LoadsQuery>(
  LoadsDocument,
  // The board shows the dropzone's day
  { dropzone: '1', date: todayInZone(dropzoneExtensive.timeZone) },
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
