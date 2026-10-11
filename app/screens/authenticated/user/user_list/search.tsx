import * as React from 'react';
import noop from 'lodash/noop';

type UserSearch = {
  searchVisible: boolean;
  searchText: string;
  setSearchVisible(visible: boolean): void;
  setSearchText(text: string): void;
};

const UserSearchContext = React.createContext<UserSearch>({
  searchVisible: false,
  searchText: '',
  setSearchVisible: noop,
  setSearchText: noop,
});

/** The user list's search box lives in the navigation header, outside the list screen, so they share this. */
export function UserSearchProvider(props: React.PropsWithChildren<object>) {
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  const value = React.useMemo(
    () => ({ searchVisible, searchText, setSearchVisible, setSearchText }),
    [searchVisible, searchText]
  );

  return <UserSearchContext.Provider value={value}>{props.children}</UserSearchContext.Provider>;
}

export function useUserSearch() {
  return React.useContext(UserSearchContext);
}
