import React from 'react';

export default function NoDragDrop(props: React.PropsWithChildren<object>) {
  const { children } = props;
  return children as React.JSX.Element;
}
