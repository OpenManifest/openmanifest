import { DocumentNode, useMutation } from "@apollo/client";
import { Maybe } from "graphql/jsutils/Maybe";
import { useCallback } from "react";
import { FieldError, Mutation } from "./schema";

export interface IAppMutation<Payload, InputType> {
  loading: boolean;
  mutate(variables: InputType): Promise<Maybe<Payload>>;
}

export interface IAppMutationProps<Payload, InputType> {
  onSuccess(payload: Payload): void;
  onError?(message: string): void;
  onFieldError?(field: string, value: string): void;
}

export interface IFieldValidator<InputType> {
  pattern?: RegExp;
  callback?: (fields: InputType) => boolean,
  message: string;
}

export function isRequired(message: string) {
  return {
    message,
    pattern: /.{1,}/
  }
}

export function isEmail(message: string) {
  return {
    message, 
    pattern: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  }
}


export function isNumeric(message: string) {
  return {
    message,
    pattern: /^\d+/
  }
}

export function validates<T extends {}>(message: string, callback: (inputVariables: T) => boolean) {
  return {
    message,
    callback,
  }
}

export function createMutation<InputType extends {}, Payload extends { fieldErrors?: Maybe<FieldError[]>, errors?: Maybe<string[]> }>(
  mutation: DocumentNode,
  options: {
    // Get payload from root field in mutation
    getPayload: (rootField: Mutation) => Maybe<Payload>,
    fieldErrorMap?: {
      // Map serverFieldName: tsFieldName
      [k: string]: keyof InputType
    },

    // All validators patterns must be truthy before
    // mutation will be executed, or onFieldError will fire
    validates?: {
      [Key in keyof InputType]?: IFieldValidator<InputType>[];
    }
  },
) {
  const { getPayload, fieldErrorMap, validates} = options;

  return function useAppMutation(opts: IAppMutationProps<Payload, InputType>): IAppMutation<Payload, InputType> {
    const { onFieldError, onSuccess, onError } = opts;
    
    const [mutate, { data, loading, error}] = useMutation(mutation);


    const onMutate = useCallback(async (variables: InputType): Promise<Maybe<Payload>> => {
      

      function validate() {
        let hasErrors = false;

        if (validates) {
          Object.keys(variables).forEach((x) => {
            const variable = x as keyof InputType;
  
            if (variable in (options.validates || {})) {
              validates[variable]?.forEach((validator) => {
                if (validator.pattern) {
                  if (!validator.pattern.test(`${variables[variable]}`)) {
                    hasErrors = true;
                    
                    if (onFieldError) {
                      onFieldError(variable as string, validator.message);
                    }
                  }
                } else if (validator.callback && !validator.callback(variables)) {
                  hasErrors = true;
                  if (onFieldError) {
                    onFieldError(variable as string, validator.message);
                  }
                }
                
              });
            }
          })
        }

        return !hasErrors;
      }

      if (!validate()) {
        return;
      }
      try {
        const result = await mutate({
          variables
        });

        const payload = getPayload(result.data);
  
        payload?.fieldErrors?.map(({ field, message }) => {
          const fieldName = field in (fieldErrorMap || {}) ? options!.fieldErrorMap![field] : field;

          if (opts.onFieldError) {
            opts.onFieldError(`${fieldName}`, message);
          }
        });
        
        if (payload?.errors?.length && onError) {
          payload.errors?.map((message) => onError(message));
          return;
        }
        if (!payload?.fieldErrors?.length) {
          onSuccess(payload!);
        }
  
        return payload;
      } catch(error) {
        if (onError) {
          onError(error.message);
        }
      }
      
      return;
    }, [onFieldError, onError, onSuccess,, mutate, getPayload, JSON.stringify(data)]);

    return {
      loading,
      mutate: onMutate,
    }    
  }
}