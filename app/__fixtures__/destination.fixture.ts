import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind } from 'app/api/schema.d';

export const fullAltitude: DestinationEssentialsFragment = {
  __typename: 'Destination',
  id: '1',
  kind: DestinationKind.Altitude,
  name: 'Full altitude',
  altitudeM: 4267.2,
  location: {},
  stops: [],
  minCertificationRank: null,
  discardedAt: null,
};

export const hopNPop: DestinationEssentialsFragment = {
  ...fullAltitude,
  id: '2',
  name: 'Hop n Pop',
  altitudeM: 1219.2,
};

export const reef: DestinationEssentialsFragment = {
  ...fullAltitude,
  id: '3',
  kind: DestinationKind.Site,
  name: 'Reef',
  altitudeM: null,
  location: { lat: -16.9, lng: 145.8, max_depth_m: 18 },
};
