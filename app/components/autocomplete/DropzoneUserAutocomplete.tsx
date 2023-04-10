import { DropzoneUserEssentialsFragment, DropzoneUserProfileFragment } from 'app/api/operations';

// This is necessary for DropzoneUserAutocomplete to work,
// must have same props between web and native
interface IDropzoneUserAutocompleteProps {
  value?: DropzoneUserEssentialsFragment | null;

  disabled?: boolean;

  onChange(value: DropzoneUserProfileFragment): void;
}

export default function DropzoneUserAutocomplete(props: IDropzoneUserAutocompleteProps) {
  return null;
}
