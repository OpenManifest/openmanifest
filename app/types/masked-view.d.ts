// The package's own types extend `ReactNative.Constructor`, which React Native 0.71's bundled types no longer export,
// so `<MaskedView>` has no props. Declare the component here until the package ships compatible types.
declare module '@react-native-masked-view/masked-view' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface MaskedViewProps extends ViewProps {
    maskElement: React.ReactElement;
    androidRenderingMode?: 'software' | 'hardware';
  }

  export default class MaskedView extends React.Component<MaskedViewProps> {}
}
