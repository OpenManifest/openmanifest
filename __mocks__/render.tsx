import * as React from 'react';
import { Provider as Material } from "react-native-paper";
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { createStore } from 'redux';
import { Provider as Redux } from 'react-redux';
import { MockedProvider as Apollo, MockedResponse } from "@apollo/client/testing";

// Import your own reducer
import { rootReducer, RootState, initialState as initialDefaultState } from '../redux/store';
import { QUERY_PERMISSIONS } from '../hooks/useRestriction';

interface IRenderer extends RenderOptions {
  initialState?: RootState;
  permissions?: string[];
  graphql: MockedResponse<Record<string, any>>[];
}

function render(
  ui: React.ReactElement<any>,
  {
    initialState,
    graphql,
    permissions,
    ...renderOptions
  }: IRenderer
) {

  const store = createStore(rootReducer, initialState);
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Redux store={store}>
          <Apollo
            mocks={[
              ...(graphql || []),
              {
                request: {
                  query: QUERY_PERMISSIONS,
                  variables: {
                    dropzoneId: 1,
                  }
                },
                result: {
                  data: {
                    dropzone: {
                      id: 1,
                      name: "Skydive Jest",
                      primaryColor: "#000000",
                      secondaryColor: "#FFFFFF",

                      currentUser: {
                        id: 10,
                        role: {
                          id: 1,
                          name: "jest"
                        },
                        permissions: permissions || [],
                      }
                    }
                  }
                }
              }
            ]}
          >
        <Material>
            {children}
        </Material>
        </Apollo>
      </Redux>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// re-export everything
export * from '@testing-library/react-native'
// override render method
export { render }