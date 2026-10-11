import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { render as rtlRender } from '@testing-library/react-native';
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
import { AppThemeProvider } from 'app/theme';
import { WeatherFormProvider } from 'app/forms/weather';
import { DropzoneContextProvider, ManifestContextProvider } from 'app/providers';
import mockQueryDropzone from '../__tests__/manifest/__mocks__/QueryDropzone.mock';
import { initialSession, SessionState, useSession } from '../state/session';
import createMockPermissions from '../__tests__/manifest/__mocks__/QueryPermissions.mock';

type RenderOptions = NonNullable<Parameters<typeof rtlRender>[1]>;

interface IRenderer extends RenderOptions {
  /** Session store values (credentials, current dropzone, ...); logged out when omitted */
  session?: Partial<SessionState>;
  permissions?: Permission[];
  graphql: MockedResponse<Record<string, unknown>>[];
}

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
  }

  request(operation: Operation) {
    const mockExists = this.mockedResponses.find(
      (r) =>
        r.request.operationName === operation.operationName &&
        JSON.stringify(r.request.variables) === JSON.stringify(operation.variables)
    );
    if (!mockExists) {
      console.warn(
        `== NO MOCK EXISTS FOR QUERY ${operation.operationName} (variables: ${JSON.stringify(operation.variables)})==`
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

  // @ts-ignore
  const mockLink = new MyMockLink(mocks || []);

  return <MockedProvider {...otherProps} link={mockLink} />;
}

function render(
  ui: React.ReactElement<unknown>,
  { session, graphql, permissions, ...renderOptions }: IRenderer
) {
  useSession.setState({ ...initialSession, hydrated: true, ...(session || {}) });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <BottomSheetModalProvider>
          <Apollo
            addTypename
            mocks={[
              ...(graphql || []),
              mockQueryDropzone(),
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
            <DropzoneContextProvider dropzoneId={session?.currentDropzoneId?.toString()}>
              <ManifestContextProvider dropzone={session?.currentDropzoneId?.toString()}>
                <AppThemeProvider>
                  <WeatherFormProvider>{children}</WeatherFormProvider>
                </AppThemeProvider>
              </ManifestContextProvider>
            </DropzoneContextProvider>
          </Apollo>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react-native';
// override render method
export { render };
