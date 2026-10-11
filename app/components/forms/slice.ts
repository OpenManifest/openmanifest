import * as manifest from './manifest/slice';
import * as manifestGroup from './manifest_group/slice';

export const initialState = {
  manifest: manifest.initialState,
  manifestGroup: manifestGroup.initialState,
};
export const reducers = {
  manifest: manifest.default,
  manifestGroup: manifestGroup.default,
};
