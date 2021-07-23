import { DocumentNode, useMutation, MutationOptions } from '@apollo/client';
import { Maybe } from 'graphql/jsutils/Maybe';
import * as React from 'react';
import camelCase from 'lodash/camelCase';
import { FieldError, Mutation } from './schema';

export interface IAppMutation<Payload, InputType> {
  loading: boolean;
  mutate(
    variables: InputType,
    opts?: Omit<Partial<MutationOptions>, 'variables'> | undefined
  ): Promise<Maybe<Payload>>;
}

export interface IAppMutationProps<Payload> {
  onSuccess(payload: Payload): void;
  onError?(message: string): void;
  onFieldError?(field: string, value: string): void;
}

export interface IFieldValidator<InputType> {
  pattern?: RegExp;
  callback?: (fields: InputType) => boolean;
  message: string;
}

export function isRequired(message: string) {
  return {
    message,
    pattern: /.{1,}/,
  };
}

export function isEmail(message: string) {
  return {
    message,
    pattern: new RegExp(
      // eslint-disable-next-line max-len,no-useless-escape
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
  };
}

export function isNumeric(message: string) {
  return {
    message,
    pattern: /^\d+/,
  };
}

export function validates<T extends object>(
  message: string,
  callback: (inputVariables: T) => boolean
) {
  return {
    message,
    callback,
  };
}

export function createMutation<
  InputType extends object,
  Payload extends {
    fieldErrors?: Maybe<FieldError[]>;
    errors?: Maybe<string[]>;
  }
>(
  mutation: DocumentNode,
  options: {
    // Get payload from root field in mutation
    getPayload: (rootField: Mutation) => Maybe<Payload>;
    fieldErrorMap?: {
      // Map serverFieldName: tsFieldName
      [k: string]: keyof InputType;
    };

    // All validators patterns must be truthy before
    // mutation will be executed, or onFieldError will fire
    validates?: {
      [Key in keyof InputType]?: IFieldValidator<InputType>[];
    };
  }
) {
  const { getPayload, fieldErrorMap, validates: validators } = options;

  return function useAppMutation(
    opts: IAppMutationProps<Payload>
  ): IAppMutation<Payload, InputType> {
    const { onFieldError, onSuccess, onError } = opts;

    const [mutate, { loading }] = useMutation(mutation);

    const onMutate = React.useCallback(
      async (
        variables: InputType,
        mopts?: Omit<MutationOptions, 'variables'> | undefined
      ): Promise<Maybe<Payload>> => {
        function validate() {
          let hasErrors = false;

          if (validators) {
            Object.keys(variables).forEach((x) => {
              const variable = x as keyof InputType;

              if (variable in (options.validates || {})) {
                validators[variable]?.forEach((validator) => {
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
            });
          }

          return !hasErrors;
        }

        if (!validate()) {
          return;
        }
        try {
          const result = await mutate({
            variables,
            ...mopts,
          });

          const payload = getPayload(result.data);

          payload?.fieldErrors?.forEach(({ field, message }) => {
            const camelizedField = camelCase(field);
            const fieldName =
              fieldErrorMap && camelizedField in (fieldErrorMap || {})
                ? fieldErrorMap[field]
                : field;

            if (opts.onFieldError) {
              opts.onFieldError(`${fieldName}`, message);
            }
          });

          if (payload?.errors?.length && onError) {
            payload.errors?.map((message) => onError(message));
            return;
          }
          if (!payload?.fieldErrors?.length && payload) {
            onSuccess(payload);
          }
        } catch (err) {
          if (onError) {
            onError(err.message);
          }
        }
      },
      [onFieldError, onError, onSuccess, mutate, opts]
    );

    return {
      loading,
      mutate: onMutate,
    };
  };
}
