import React from 'react';
import { OperatorsProvider } from 'app/api/crud';
import { ManifestContextProvider, OperatorContextProvider } from 'app/providers';
import { useSession } from 'app/state';

export default function Provider(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  return (
    <OperatorsProvider>
      <OperatorContextProvider operatorId={currentOperatorId?.toString() || undefined}>
        <ManifestContextProvider operator={currentOperatorId?.toString() || undefined}>
          {children}
        </ManifestContextProvider>
      </OperatorContextProvider>
    </OperatorsProvider>
  );
}
