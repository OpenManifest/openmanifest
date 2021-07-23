import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { Button, FAB } from "react-native-paper";
import { actions, useAppDispatch, useAppSelector } from "../../../state";
import useMutationCreateWeatherConditions from "../../../api/hooks/useMutationCreateWeatherConditions";
import { StyleSheet, View } from "react-native";
import JumpRunSelector from "../../../components/input/jump_run_select/JumpRunSelectFullScreen";
import useCurrentDropzone from "../../../api/hooks/useCurrentDropzone";
import * as Location from "expo-location";

export default function JumpRunScreen() {
  const state = useAppSelector(state => state.forms.weather);
  const dropzoneId = useAppSelector(state => state.global.currentDropzoneId);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  
  const mutationCreateWeatherConditions = useMutationCreateWeatherConditions({
    onSuccess: () => {
      
    },
    onFieldError: (field: keyof typeof state.fields, message: string) =>
      dispatch(actions.forms.weather.setFieldError([field, message])),
    onError: (message) => {
      dispatch(actions.notifications.showSnackbar({ message, variant: "error" }));
    }
  });

  const onSaveConditions = React.useCallback(async () => {
    try {
      await mutationCreateWeatherConditions.mutate({
        id: Number(state!.original!.id),
        dropzoneId: dropzoneId!,
        winds: JSON.stringify(state.fields.winds.value),
        jumpRun: state.fields.jumpRun.value,
        temperature: state.fields.temperature.value,
      });
      navigation.goBack();
      dispatch(actions.notifications.showSnackbar({ message: "Weather board updated", variant: "success" }));
    } catch (e) {

    }
  }, [JSON.stringify(state.fields), mutationCreateWeatherConditions])

  const { dropzone } = useCurrentDropzone();
  const [jumpRun, setJumpRun] = React.useState(state.fields.jumpRun.value || 0);
  const [location, setLocation] = React.useState<Location.LocationObject['coords']>();
  const setUsersLocation = React.useCallback(async () => {
    try {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      
      
      setLocation(location.coords);
    } catch (error) {
      console.log(error);
    }
  }, []);

  React.useEffect(() => {
    if (!dropzone?.lat || !dropzone?.lng) {
      setUsersLocation();
    }
  }, []);
  
  return (
      <View style={StyleSheet.absoluteFill}>
        <JumpRunSelector
          value={jumpRun}
          latitude={dropzone?.lat || location?.latitude || 0}
          longitude={dropzone?.lng || location?.longitude || 0}
          onChange={(value) => dispatch(actions.forms.weather.setField(['jumpRun', Math.round(value)]))}
        />
        <FAB
          style={styles.fab}
          small
          icon="check"
          onPress={() => onSaveConditions()}
          label="Save"
        />
      </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
