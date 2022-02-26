import * as React from 'react';
import { DropzoneUserEssentialsFragment, DropzoneUserProfileFragment } from 'app/api/operations';

interface IDropzoneUserAutocompleteProps {
  value?: DropzoneUserEssentialsFragment | null;
  onChange(value: DropzoneUserProfileFragment): void;
}

export default function DropzoneUserAutocomplete(props: IDropzoneUserAutocompleteProps) {
  return null;
}
