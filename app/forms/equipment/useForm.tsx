import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type {
  EquipmentEssentialsFragment,
  EquipmentKindEssentialsFragment,
} from 'app/api/operations';
import useMutationCreateEquipment from 'app/api/hooks/useMutationCreateEquipment';
import useMutationUpdateEquipment from 'app/api/hooks/useMutationUpdateEquipment';
import { useNotifications } from 'app/providers/notifications';
import { attributesFor, schemaOf, validateAttributes, type AttributeValues } from './attributes';

export type EquipmentFields = {
  /** The kind of equipment: it says which attributes the item has */
  kindId: string;
  name: string;
  make: string;
  model: string;
  serial: string;
  /** When the next service is due (a reserve repack), in seconds since the epoch */
  serviceDueAt: number | null;
  /** The values of the kind's attributes: numbers with a unit are SI */
  attributes: AttributeValues;
};

export const equipmentValidation = yup.object({
  kindId: yup.string().default(''),
  name: yup.string().default(''),
  make: yup.string().default(''),
  model: yup.string().default(''),
  serial: yup.string().default(''),
  serviceDueAt: yup.number().nullable().default(null),
  attributes: yup.object().default({}),
});

export const EMPTY_FORM_VALUES: EquipmentFields = {
  kindId: '',
  name: '',
  make: '',
  model: '',
  serial: '',
  serviceDueAt: null,
  attributes: {},
};

/** The attributes an item starts with: the defaults of the schema */
export function defaultAttributes(
  kind?: Pick<EquipmentKindEssentialsFragment, 'attributeSchema'> | null
) {
  const values: AttributeValues = {};
  Object.entries(schemaOf(kind?.attributeSchema)).forEach(([name, spec]) => {
    if (spec.default !== undefined) values[name] = spec.default;
  });
  return values;
}

export function toFormValues(
  equipment: EquipmentEssentialsFragment | null | undefined,
  kinds: EquipmentKindEssentialsFragment[]
): EquipmentFields {
  if (!equipment) {
    const kind = kinds[0];
    return { ...EMPTY_FORM_VALUES, kindId: kind?.id ?? '', attributes: defaultAttributes(kind) };
  }
  return {
    kindId: equipment.equipmentKind?.id ?? kinds[0]?.id ?? '',
    name: equipment.name || '',
    make: equipment.make || '',
    model: equipment.model || '',
    serial: equipment.serial || '',
    serviceDueAt: equipment.serviceDueAt ?? null,
    attributes: (equipment.attributes ?? {}) as AttributeValues,
  };
}

export interface IUseEquipmentFormOpts {
  /** The equipment being edited; a new item when absent */
  equipment?: EquipmentEssentialsFragment | null;
  /** The kinds the item can be of: the operator's */
  kinds: EquipmentKindEssentialsFragment[];
  userId?: number;
  operatorId?: number;
  onSuccess?(): void;
}

export default function useEquipmentForm(opts: IUseEquipmentFormOpts) {
  const { equipment, kinds, userId, operatorId, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo(() => toFormValues(equipment, kinds), [equipment, kinds]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<EquipmentFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(equipmentValidation) as never,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset, handleSubmit, setError, control, getValues, setValue } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const kindId = useWatch({ control, name: 'kindId' });
  const kind = React.useMemo(
    () => kinds.find((candidate) => candidate.id === kindId),
    [kinds, kindId]
  );

  // A new kind starts with its own defaults (the old kind's attributes mean nothing to it)
  const shownKindId = React.useRef(kindId);
  React.useEffect(() => {
    if (shownKindId.current !== kindId) {
      shownKindId.current = kindId;
      if (!equipment?.id) setValue('attributes', defaultAttributes(kind));
    }
  }, [kindId, kind, equipment?.id, setValue]);

  const handlers = {
    onSuccess: () => null,
    onFieldError: (field: string, message: string) => {
      const name = camelCase(field);
      if (name in EMPTY_FORM_VALUES) {
        setError(name as keyof EquipmentFields, { type: 'server', message });
      } else if (field === 'properties') {
        setError('attributes', { type: 'server', message });
      }
    },
    onError: (message: string) => notify.error(message),
  };
  const updateEquipment = useMutationUpdateEquipment(handlers);
  const createEquipment = useMutationCreateEquipment(handlers);

  const operatorOwned = !userId;
  const [{ loading }, onSave] = useAsyncFn(
    async (fields: EquipmentFields) => {
      const schema = schemaOf(kind?.attributeSchema);
      const problems = validateAttributes(schema, fields.attributes, { operatorOwned });
      if (Object.keys(problems).length) {
        Object.entries(problems).forEach(([name, message]) =>
          setError(`attributes.${name}`, { type: 'validate', message })
        );
        return;
      }
      if (kind?.serviceIntervalDays && !fields.serviceDueAt) {
        setError('serviceDueAt', { type: 'validate', message: 'Set when the next service is due' });
        return;
      }

      // Only what the kind asks for goes to the server
      const attributes = Object.fromEntries(
        attributesFor(schema, { operatorOwned }).map(([name]) => [
          name,
          fields.attributes[name] ?? null,
        ])
      );
      const { kindId: chosenKind, attributes: _ignored, ...columns } = fields;
      const input = {
        ...columns,
        kindId: chosenKind || undefined,
        attributes,
        userId: userId ? Number(userId) : null,
        operatorId: operatorId ? Number(operatorId) : null,
      };
      const result = equipment?.id
        ? await updateEquipment.mutate({ id: Number(equipment.id), ...input })
        : await createEquipment.mutate(input);

      if (result && !result.errors?.length && !result.fieldErrors?.length) {
        onSuccess?.();
      }
    },
    [
      kind,
      equipment?.id,
      operatorOwned,
      userId,
      operatorId,
      setError,
      updateEquipment.mutate,
      createEquipment.mutate,
      onSuccess,
    ]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(
    () => ({ ...methods, kind, operatorOwned, getValues, onSubmit, loading }),
    [methods, kind, operatorOwned, getValues, onSubmit, loading]
  );
}
