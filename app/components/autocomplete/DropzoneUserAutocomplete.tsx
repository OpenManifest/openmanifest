import { DropzoneUserEssentialsFragment, DropzoneUserProfileFragment } from 'app/api/operations';

// This is necessary for DropzoneUserAutocomplete to work,
// must have same props between web and native
interface IDropzoneUserAutocompleteProps {
  // eslint-disable-next-line react/no-unused-prop-types
  value?: DropzoneUserEssentialsFragment | null;
  // eslint-disable-next-line react/no-unused-prop-types
  onChange(value: DropzoneUserProfileFragment): void;
}

export default function DropzoneUserAutocomplete(props: IDropzoneUserAutocompleteProps) {
  return null;
}
