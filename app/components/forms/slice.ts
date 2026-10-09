import * as dropzoneUser from './dropzone_user/slice';
import * as rig from './rig/slice';
import * as rigInspection from './rig_inspection/slice';
import * as rigInspectionTemplate from './rig_inspection_template/slice';
import * as manifest from './manifest/slice';
import * as manifestGroup from './manifest_group/slice';

export const initialState = {
  dropzoneUser: dropzoneUser.initialState,
  rig: rig.initialState,
  rigInspection: rigInspection.initialState,
  rigInspectionTemplate: rigInspectionTemplate.initialState,
  manifest: manifest.initialState,
  manifestGroup: manifestGroup.initialState,
};
export const reducers = {
  dropzoneUser: dropzoneUser.default,
  rig: rig.default,
  rigInspection: rigInspection.default,
  rigInspectionTemplate: rigInspectionTemplate.default,
  manifest: manifest.default,
  manifestGroup: manifestGroup.default,
};
