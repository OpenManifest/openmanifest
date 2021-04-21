import useColorScheme from "./useColorScheme";
import colors from "../constants/Colors";

function usePalette() {
  const colorScheme = useColorScheme();

  return colors[colorScheme];
}

export default usePalette;