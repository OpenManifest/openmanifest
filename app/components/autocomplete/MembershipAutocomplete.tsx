import { MembershipEssentialsFragment, MembershipProfileFragment } from 'app/api/operations';

// This is necessary for MembershipAutocomplete to work,
// must have same props between web and native
interface IMembershipAutocompleteProps {
  value?: MembershipEssentialsFragment | null;

  disabled?: boolean;

  onChange(value: MembershipProfileFragment): void;
}

export default function MembershipAutocomplete(props: IMembershipAutocompleteProps) {
  return null;
}
