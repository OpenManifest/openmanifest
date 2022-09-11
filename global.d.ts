declare namespace global {
  function __reanimatedWorkletInit(): void;
}

declare module "react-native-skeleton-content/src" {
  import { ISkeletonContentProps } from 'react-native-skeleton-content/src/Constants';
  const SkeletonContent: React.ComponentType<ISkeletonContentProps>;
  export default SkeletonContent;
}

declare module "react-native-redash/lib/module/v1" {
  export * from 'react-native-redash/lib/typescript/v1';
}