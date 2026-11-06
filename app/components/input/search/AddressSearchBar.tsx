import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, ListRow, Stack, TextField } from 'app/ui';
import debounce from 'lodash/debounce';
import { GeocodedLocation } from 'app/api/schema.d';
import { first } from 'lodash';
import { useAddressToLocationLazyQuery } from 'app/api/reflection';

interface IAddressSearchBarProps {
  value: string;
  autocomplete?: boolean;
  selectedLocation?: GeocodedLocation;
  onChange(value: string): void;
  onSelect(value: GeocodedLocation): void;
}
export default function AddressSearchBar(props: IAddressSearchBarProps) {
  const { value, onChange: onChangeText, onSelect } = props;
  const { t } = useTranslation('common');
  const [suggestions, setSuggestions] = React.useState<GeocodedLocation[]>([]);
  const [selected, setSelected] = React.useState<GeocodedLocation>();
  const [fetchLocation, { data }] = useAddressToLocationLazyQuery();

  const fetchSuggestions = React.useCallback(
    (search: string) => {
      fetchLocation({
        variables: {
          search,
        },
      });
    },
    [fetchLocation]
  );

  const fetchSuggestionsDebounced = React.useMemo(
    () => debounce<typeof fetchSuggestions>(fetchSuggestions),
    [fetchSuggestions]
  );

  React.useEffect(() => {
    if (data?.geocode) {
      setSuggestions([data.geocode]);
    }
  }, [data?.geocode]);

  React.useEffect(() => {
    if (value && value?.length > 4) {
      fetchSuggestionsDebounced(value);
    } else if (!value) {
      setSuggestions([]);
    }
  }, [value, fetchSuggestionsDebounced]);

  const onPickResult = React.useCallback(
    (location: GeocodedLocation) => {
      onSelect(location);
      onChangeText(location.formattedString || '');
      setSuggestions([]);
      setSelected(location);
    },
    [onChangeText, onSelect]
  );

  return (
    <Stack gap="xs">
      <TextField
        label={t('location.search')}
        value={value}
        onChange={onChangeText}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (first(suggestions)) {
            onPickResult(first(suggestions) as GeocodedLocation);
          }
        }}
      />
      {suggestions
        ?.filter((suggestion) => suggestion.formattedString !== selected?.formattedString)
        .map((item) => (
          <React.Fragment key={item.formattedString}>
            <Divider />
            <ListRow
              title={item.formattedString ?? ''}
              onPress={() => {
                onPickResult(item);
              }}
            />
          </React.Fragment>
        ))}
    </Stack>
  );
}
