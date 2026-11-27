import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Banner, Button, EmptyState, Skeleton, Switch, Text, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { useEquipmentInspectionTemplateQuery } from 'app/api/reflection';
import {
  EquipmentInspectionForm,
  useEquipmentInspectionForm,
} from 'app/forms/equipment_inspection';
import { parseFields, type FieldItem } from 'app/forms/equipment_inspection_template';
import useTerms from 'app/i18n/useTerms';
import { useOperatorContext } from 'app/providers';
import { EquipmentItem } from './EquipmentSection';
import { inspectionOf } from './profile';
import useProfile from './useProfile';

export type EquipmentInspectionRoute = {
  EquipmentInspectionScreen: {
    equipmentId: string;
    membershipId: string;
  };
};

/**
 * The inspection of a member's item of equipment: the operator's form for its kind (or the last inspection as it was
 * filled in), whether it is fine to use, and "Mark as inspected" for an equipment inspector; everyone else reads it.
 */
export default function InspectionScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const term = useTerms();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<EquipmentInspectionRoute, 'EquipmentInspectionScreen'>>();
  const { equipmentId, membershipId } = route.params;
  const {
    operator: { operator },
  } = useOperatorContext();
  const { profile, abilities, waiting } = useProfile(membershipId);
  const { data: templates } = useEquipmentInspectionTemplateQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });

  const equipment = profile?.user?.equipment?.find(({ id }) => id === equipmentId) ?? null;
  const kind = operator?.equipmentKinds?.find((item) => item.id === equipment?.equipmentKind?.id);
  // The form of the kind of equipment being inspected
  const template = templates?.operator?.equipmentKinds?.find(
    (item) => item.id === equipment?.equipmentKind?.id
  )?.inspectionFormTemplate;
  // An earlier inspection of this equipment is shown as it was filled in; otherwise the operator's template is
  const existing = React.useMemo(
    () =>
      profile?.equipmentInspections?.find(
        (inspection) => inspection.equipment?.id === equipmentId && inspection.definition
      ),
    [equipmentId, profile?.equipmentInspections]
  );
  const fields = React.useMemo(
    () => parseFields(existing?.definition ?? template?.definition),
    [existing?.definition, template?.definition]
  );

  const { control, setValue, loading, onSubmit, formState } = useEquipmentInspectionForm({
    fields,
    ok: !!existing?.isOk,
    equipmentId: equipment?.id,
    operatorId: operator?.id,
    onSuccess: navigation.goBack,
  });
  const { field: ok } = useController({ name: 'ok', control });
  const onChangeField = React.useCallback(
    (index: number, item: FieldItem) =>
      setValue(`fields.${index}`, item, { shouldDirty: true, shouldValidate: true }),
    [setValue]
  );
  const inspection = term('inspection');

  if (waiting) {
    return (
      <ScreenContainer edges={['bottom']}>
        <View style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <Skeleton height={120} />
          <Skeleton height={240} />
        </View>
      </ScreenContainer>
    );
  }
  if (!equipment) {
    return (
      <ScreenContainer edges={['bottom']}>
        <EmptyState
          testID="inspection-missing"
          icon="clipboard-alert-outline"
          title={t('profile.inspection.missing', { equipment: term('equipment').toLowerCase() })}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="inspection"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
        }}
      >
        <View
          style={{
            paddingHorizontal: theme.space.lg,
            backgroundColor: theme.colour.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colour.border,
          }}
        >
          <EquipmentItem
            testID="inspection-equipment"
            equipment={equipment}
            inspection={inspectionOf(equipment.id, profile?.equipmentInspections)}
            kind={kind}
          />
        </View>

        <View
          style={{
            gap: theme.space.md,
            padding: theme.space.lg,
            backgroundColor: theme.colour.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colour.border,
          }}
        >
          <Text variant="title" role="heading" aria-level={2}>
            {template?.name || inspection}
          </Text>
          {abilities.inspect ? null : (
            <Banner
              tone="info"
              testID="inspection-read-only"
              message={t('profile.inspection.readOnly', { inspection: inspection.toLowerCase() })}
            />
          )}
          {fields.length ? (
            <View
              style={{ gap: theme.space.sm }}
              pointerEvents={abilities.inspect ? 'auto' : 'none'}
              aria-disabled={!abilities.inspect}
            >
              <EquipmentInspectionForm {...{ control, onChangeField }} />
            </View>
          ) : (
            <Text tone="muted" testID="inspection-no-form">
              {t('profile.inspection.noForm')}
            </Text>
          )}
          <Switch
            label={t('profile.inspection.ok', { equipment: term('equipment').toLowerCase() })}
            value={!!ok.value}
            onChange={ok.onChange}
            disabled={!abilities.inspect}
            testID="inspection-ok"
          />
          {abilities.inspect ? (
            <Button
              label={t('profile.inspection.save')}
              testID="inspection-save"
              loading={loading}
              disabled={!formState.isDirty && !existing}
              onPress={onSubmit}
              fullWidth
            />
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
