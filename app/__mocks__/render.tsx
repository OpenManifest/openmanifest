import * as React from 'react';
import { Provider as Material } from 'react-native-paper';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { createStore } from 'redux';
import { Provider as Redux } from 'react-redux';
import {
  MockedProvider,
  MockedProviderProps,
  MockedResponse,
  MockLink,
} from '@apollo/client/testing';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Permission } from 'app/api/schema.d';
import { Operation } from '@apollo/client';

// Import your own reducer
import { rootReducer, RootState } from '../state/store';
import createMockPermissions from '../__tests__/manifest/__mocks__/QueryPermissions.mock';

interface IRenderer extends RenderOptions {
  initialState?: RootState;
  permissions?: Permission[];
  graphql: MockedResponse<Record<string, unknown>>[];
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Ok
class MyMockLink extends MockLink {
  private mockedResponsesByKey: { [key: string]: MockedResponse<Record<string, unknown>> };

  constructor(
    readonly mockedResponses: MockedResponse<Record<string, unknown>>[],
    addTypename?: boolean
  ) {
    super(mockedResponses, addTypename);

    if (addTypename === undefined) {
      addTypename = true;
    }
    this.addTypename = addTypename || true;
    this.mockedResponsesByKey = {};
    this.addTypename = addTypename;
    if (mockedResponses) {
      mockedResponses.forEach((mockedResponse) => {
        this.addMockedResponse(mockedResponse);
      });
    }
    return this;
  }

  request(operation: Operation) {
    const mockExists = this.mockedResponses.find(
      (r) =>
        r.request.operationName === operation.operationName &&
        JSON.stringify(r.request.variables) === JSON.stringify(operation.variables)
    );
    if (!mockExists) {
      console.warn(
        `== NO MOCK EXISTS FOR QUERY ${operation.operationName} (variables: ${JSON.stringify(
          operation.variables
        )})==`
      );
      console.warn(
        `-- Existing mocks: ${this.mockedResponses
          .map(({ request }) => `${request?.operationName} (${JSON.stringify(request?.variables)})`)
          .join(',')}`
      );
    }

    return super.request(operation);
  }
}

function Apollo(props: MockedProviderProps) {
  const { mocks, ...otherProps } = props;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mockLink = new MyMockLink(mocks || []);

  return <MockedProvider {...otherProps} link={mockLink} />;
}

function render(
  ui: React.ReactElement<unknown>,
  { initialState, graphql, permissions, ...renderOptions }: IRenderer
) {
  const store = createStore(rootReducer, initialState);
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Redux store={store}>
        <Apollo
          addTypename
          mocks={[
            ...(graphql || []),
            createMockPermissions(
              {},
              {
                dropzone: {
                  currentUser: {
                    permissions: permissions || [],
                  },
                },
              }
            ),
          ]}
        >
          <Material>
            <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          </Material>
        </Apollo>
      </Redux>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react-native';
// override render method
export { render };
