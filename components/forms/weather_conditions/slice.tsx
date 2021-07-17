import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WeatherCondition } from "../../../graphql/schema.d";

type Fields = Pick<
  WeatherCondition,
  | "winds"
  | "exitSpotMiles"
  | "jumpRun"
  | "offsetDirection"
  | "temperature"
>;

interface IWeatherConditionEditState {
  original: WeatherCondition | null;
  open: boolean;
  fields: {
    [K in keyof Fields] - ?: {
      value: Fields[K] | null;
      error: string | null;
    }
  }
}

export const initialState: IWeatherConditionEditState = {
  original: null,
  open: false,
  fields: {
    jumpRun: {
      value: null,
      error: null,
    },
    temperature: {
      value: null,
      error: null,
    },
    exitSpotMiles: {
      value: null,
      error: null,
    },
    offsetDirection: {
      value: null,
      error: null,
    },
    winds: {
      value: [],
      error: null,
    },
  }
};


export default createSlice({
  name: 'forms/weather',
  initialState,
  reducers: {
    setField: <T extends keyof IWeatherConditionEditState["fields"]>(state: IWeatherConditionEditState, action: PayloadAction<[T, IWeatherConditionEditState["fields"][T]["value"]]>) => {
      const [field, value] = action.payload;
      if (field in state.fields) {
        state.fields[field].value = value;
        state.fields[field].error = null;
      }
    },
    setFieldError: <T extends  keyof IWeatherConditionEditState["fields"]>(state: IWeatherConditionEditState, action: PayloadAction<[T, IWeatherConditionEditState["fields"][T]["error"]]>) => {
      const [field, error] = action.payload;

      if (field in state && 'error' in state.fields[field]) {
        state.fields[field].error = error;
      } else {
        console.error('Cannot set error on ', field);
      }
      
    },

    setOpen: (state: IWeatherConditionEditState, action: PayloadAction<boolean | WeatherCondition>) => {
      if (typeof action.payload === "boolean") {
        state.open = action.payload;
        state.original = null;
        state.fields = initialState.fields;
      } else {
        state.original = action.payload;
        state.open = true;
        for (const key in action.payload) {
          if (key in state.fields) {
            const typedKey = key as keyof typeof initialState["fields"];
            state.fields[typedKey].value = action.payload[typedKey];
          }
        }
      }
    },
    
    reset: (state: IWeatherConditionEditState) => {
      state.fields = initialState.fields;
      state.original = null;
    },
  }
});


