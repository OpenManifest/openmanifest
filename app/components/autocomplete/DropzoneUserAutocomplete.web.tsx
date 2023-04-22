import * as React from 'react';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { Autocomplete, InputAdornment, ListItemAvatar, ListItemText, MenuItem, styled } from '@mui/material';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useDropzoneUsersLazyQuery } from 'app/api/reflection';
import { useAppSelector } from 'app/state';
import first from 'lodash/first';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Caption, useTheme } from 'react-native-paper';
import UserAvatar from '../UserAvatar.web.old';

interface IDropzoneUserAutocompleteProps {
  value?: DropzoneUserEssentialsFragment | null;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  color?: string;
  onChange(value: DropzoneUserEssentialsFragment): void;
}

// @ts-ignore This is supposed to be ok
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop: keyof TextFieldProps) => prop !== 'color'
})((p: TextFieldProps) => ({
  // input label when focused
  '& .MuiInput-input': {
    color: p.color
  },
  '& label.Mui-focused': {
    color: p.color
  },
  // focused color for input with variant='standard'
  '& .MuiInput-root:before': {
    borderBottomColor: p.color
  },
  '& .MuiInput-root:hover': {
    borderBottomColor: p.color
  },
  // focused color for input with variant='filled'
  '& .MuiFilledInput-underline': {
    borderBottomColor: p.color
  },
  // focused color for input with variant='outlined'
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: p.color
    }
  }
})) as React.ComponentType<Omit<TextFieldProps, 'color'> & { color?: string }>;
export default function DropzoneUserAutocomplete(props: IDropzoneUserAutocompleteProps) {
  const { label, onChange, disabled, placeholder, color } = props;
  const [searchUsers, { data, loading }] = useDropzoneUsersLazyQuery();
  const [searchText, setSearchText] = React.useState('');
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  React.useEffect(() => {
    if (currentDropzoneId && searchText !== null) {
      searchUsers({
        variables: {
          dropzoneId: currentDropzoneId?.toString() as string,
          search: searchText,
          licensed: false
        }
      });
    }
  }, [currentDropzoneId, searchText, searchUsers]);

  const theme = useTheme();
  const getOptionLabel = React.useCallback(
    (option: DropzoneUserEssentialsFragment) =>
      option.user.nickname ? `${option.user.nickname} (${option.user.name})` : (option.user.name as string),
    []
  );

  const groupBy = React.useCallback(
    (option: DropzoneUserEssentialsFragment) => first(getOptionLabel(option).split('')) as string,
    [getOptionLabel]
  );

  const options = React.useMemo(
    () =>
      ((data?.dropzoneUsers?.edges?.map((edge) => edge?.node) as DropzoneUserEssentialsFragment[]) || []).sort(
        (a, b) =>
          -(first(getOptionLabel(b).split('')) as string).localeCompare(first(getOptionLabel(a).split('')) as string)
      ),
    [data?.dropzoneUsers?.edges, getOptionLabel]
  );

  const onSelect = React.useCallback(
    (_: unknown, nextValue?: DropzoneUserEssentialsFragment | null) => {
      setSearchText('');
      if (nextValue) {
        onChange(nextValue);
      }
    },
    [onChange]
  );
  return (
    <Autocomplete<DropzoneUserEssentialsFragment>
      {...{ disabled, loading, options, groupBy, getOptionLabel, value: null }}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <StyledTextField
          variant="standard"
          {...params}
          {...{ color, label, placeholder }}
          fullWidth
          value={searchText}
          InputProps={{
            ...params.InputProps,
            value: searchText,
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <MaterialCommunityIcons name="account-search-outline" size={20} color={color || theme.colors.text} />
              </InputAdornment>
            )
          }}
        />
      )}
      onInputChange={(_, text) => setSearchText(text)}
      onChange={onSelect}
      inputValue={searchText}
      popupIcon={<MaterialCommunityIcons name="chevron-down" color={color} />}
      clearIcon={<MaterialCommunityIcons name="close" color={color} />}
      renderOption={(menuItemProps, option) => (
        <MenuItem {...menuItemProps} key={`autocomplete-user-${option.id}`} id={option.id}>
          <ListItemAvatar>
            <UserAvatar name={option.user.name} image={option?.user?.image} size={32} />
          </ListItemAvatar>

          <ListItemText>
            {option.user.nickname ? (
              <>
                {option.user.nickname}&nbsp;
                <Caption>({option.user.name})</Caption>
              </>
            ) : (
              option.user.name
            )}
          </ListItemText>
        </MenuItem>
      )}
    />
  );
}
