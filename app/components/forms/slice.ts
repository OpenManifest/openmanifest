import * as dropzone from './dropzone/slice';
import * as dropzoneUser from './dropzone_user/slice';
import * as ghost from './ghost/slice';
import * as rig from './rig/slice';
import * as rigInspection from './rig_inspection/slice';
import * as rigInspectionTemplate from './rig_inspection_template/slice';
import * as manifest from './manifest/slice';
import * as manifestGroup from './manifest_group/slice';
import * as user from './user/slice';
import * as weather from './weather_conditions/slice';

export const initialState = {
  dropzone: dropzone.initialState,
  dropzoneUser: dropzoneUser.initialState,
  ghost: ghost.initialState,
  rig: rig.initialState,
  rigInspection: rigInspection.initialState,
  rigInspectionTemplate: rigInspectionTemplate.initialState,
  manifest: manifest.initialState,
  manifestGroup: manifestGroup.initialState,
  user: user.initialState,
  weather: weather.initialState,
};
export const reducers = {
  dropzone: dropzone.default,
  dropzoneUser: dropzoneUser.default,
  ghost: ghost.default,
  rig: rig.default,
  rigInspection: rigInspection.default,
  rigInspectionTemplate: rigInspectionTemplate.default,
  manifest: manifest.default,
  manifestGroup: manifestGroup.default,
  user: user.default,
  weather: weather.default,
};
