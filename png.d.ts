
declare module "*.png" {
  import { ImageURISource } from "react-native";
  const image: ImageURISource;
  export default image;
}