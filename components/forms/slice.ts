import * as credits from "./credits/slice";
import * as dropzone from "./dropzone/slice";
import * as dropzoneUser from "./dropzone_user/slice";
import * as extra from "./extra/slice";
import * as load from "./load/slice";
import * as plane from "./plane/slice";
import * as rig from "./rig/slice";
import * as rigInspection from "./rig_inspection/slice";
import * as rigInspectionTemplate from "./rig_inspection_template/slice";
import * as manifest from "./manifest/slice";
import * as manifestGroup from "./manifest_group/slice";
import * as ticketType from "./ticket_type/slice";
import * as user from "./user/slice";
import * as userWizard from "../dialogs/UserWizard/slice";
import * as dropzoneWizard from "../dialogs/DropzoneWizard/slice";

export const initialState = {
  credits: credits.initialState,
  dropzone: dropzone.initialState,
  dropzoneUser: dropzoneUser.initialState,
  extra: extra.initialState,
  load: load.initialState,
  plane: plane.initialState,
  rig: rig.initialState,
  rigInspection: rigInspection.initialState,
  rigInspectionTemplate: rigInspectionTemplate.initialState,
  manifest: manifest.initialState,
  manifestGroup: manifestGroup.initialState,
  ticketType: ticketType.initialState,
  user: user.initialState,
  userWizard: userWizard.initialState,
  dropzoneWizard: dropzoneWizard.initialState,
}
export const reducers = {
  credits: credits.default,
  dropzone: dropzone.default,
  dropzoneUser: dropzoneUser.default,
  extra: extra.default,
  load: load.default,
  plane: plane.default,
  rig: rig.default,
  rigInspection: rigInspection.default,
  rigInspectionTemplate: rigInspectionTemplate.default,
  manifest: manifest.default,
  manifestGroup: manifestGroup.default,
  ticketType: ticketType.default,
  user: user.default,
  userWizard: userWizard.default,
  dropzoneWizard: dropzoneWizard.default,
}