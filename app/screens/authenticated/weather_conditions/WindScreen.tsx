import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { actions, useAppDispatch, useAppSelector } from "../../../state";
import useMutationCreateWeatherConditions from "../../../api/hooks/useMutationCreateWeatherConditions";
import ScrollableScreen from "../../../components/layout/ScrollableScreen";
import WeatherConditionForm from "../../../components/forms/weather_conditions/WeatherConditionForm";
import { StyleSheet, View } from "react-native";

export default function WindScreen() {
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
      dispatch(actions.forms.weather.reset());
      dispatch(actions.forms.weather.setOpen(false));
    } catch (e) {

    }
  }, [JSON.stringify(state.fields), mutationCreateWeatherConditions])
  
  return (
      <ScrollableScreen style={{ backgroundColor: '#F4F5F5'}}>
        <WeatherConditionForm onPressJumpRun={() => navigation.navigate('JumpRunScreen')}/>
        <View style={styles.buttons} pointerEvents="box-none">
          <Button
            loading={mutationCreateWeatherConditions.loading}
            mode="contained"
            disabled={mutationCreateWeatherConditions.loading}
            style={styles.button}
            onPress={async () => {
              onSaveConditions();
            }}
          >
            Save
          </Button>
        </View>
      </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    width: "100%",
  },
  buttonBack: {
    alignSelf: "center",
    width: "100%",
    marginHorizontal: 48
  },
  buttons: {
    alignSelf: "center",
    alignItems: "flex-end",
    flexGrow: 1,
    justifyContent: "flex-end",
    width: "100%",
    maxWidth: 404,
    marginBottom: 100,
  }
});
