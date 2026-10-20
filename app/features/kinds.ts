import { RIG_KIND } from './skydiving/rig';

/**
 * The look of a kind of equipment, by its key: features (skydiving's rig) have their own, every other kind a toolbox.
 */
export const kindIcon = (key?: string | null): 'parachute' | 'toolbox-outline' =>
  key === RIG_KIND ? 'parachute' : 'toolbox-outline';

/** Does an item of the kind carry a photo of its packing card? */
export const hasPackingCard = (key?: string | null): boolean => key === RIG_KIND;
