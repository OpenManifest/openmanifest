import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Icon, Row, StatusBadge, Text, useTheme } from 'app/ui';
import type { EquipmentKindEssentialsFragment } from 'app/api/operations';
import { formatDate } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import useTerms from 'app/i18n/useTerms';
import { hasPackingCard, kindIcon } from 'app/features/kinds';
import {
  attributesFor,
  formatAttribute,
  labelOf,
  schemaOf,
  type AttributeValues,
} from 'app/forms/equipment/attributes';
import Section, { Fact } from './Section';
import { inspectionOf, type ProfileEquipment, type ProfileInspection } from './profile';

export type EquipmentItemProps = {
  equipment: ProfileEquipment;
  inspection: ProfileInspection | null;
  kind?: Pick<EquipmentKindEssentialsFragment, 'attributeSchema' | 'serviceIntervalDays'> | null;
  /** Opens the form of the item: absent for those who may not edit it */
  onEdit?(): void;
  /** Opens its inspection; `inspector` says the person looking may fill it in */
  onInspect?(): void;
  inspector?: boolean;
  /** Shows the photo of the packing card, when there is one */
  onViewCard?(): void;
  /** Takes a new photo of the packing card: absent for those who may not edit the item */
  onUploadCard?(): void;
  uploading?: boolean;
  testID: string;
};

/** One item of equipment: what it is, its attributes, when its service is due and who inspected it, with its actions */
export function EquipmentItem({
  equipment,
  inspection,
  kind,
  onEdit,
  onInspect,
  inspector,
  onViewCard,
  onUploadCard,
  uploading,
  testID,
}: EquipmentItemProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const term = useTerms();
  const units = useOperatorFormat((state) => state.units);
  const makeModel = [equipment.make, equipment.model].filter(Boolean).join(' ');
  const title = equipment.name || makeModel || equipment.equipmentKind.name;
  const supporting = [
    equipment.equipmentKind.name,
    equipment.name ? makeModel : null,
    equipment.serial,
  ]
    .filter(Boolean)
    .join(' · ');
  const attributes = attributesFor(schemaOf(kind?.attributeSchema), {
    operatorOwned: !!equipment.operator?.id,
  });
  const values = (equipment.attributes ?? {}) as AttributeValues;
  const packingCard = hasPackingCard(equipment.equipmentKind.key);

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.sm,
        paddingVertical: theme.space.md,
        borderTopWidth: 1,
        borderColor: theme.colour.border,
      }}
    >
      <Row gap="md" align="center">
        <Icon name={kindIcon(equipment.equipmentKind.key)} size={24} tone="muted" />
        <View style={{ flex: 1 }}>
          <Text variant="label" role="heading" aria-level={3}>
            {title}
          </Text>
          {supporting ? (
            <Text variant="caption" tone="muted">
              {supporting}
            </Text>
          ) : null}
        </View>
      </Row>
      {attributes.map(([name, spec]) => (
        <Fact
          key={name}
          label={labelOf(name, spec)}
          value={formatAttribute(spec, values[name], units)}
        />
      ))}
      {kind?.serviceIntervalDays || equipment.serviceDueAt ? (
        <Fact
          label={term('service_due')}
          value={
            equipment.serviceDueAt
              ? formatDate(equipment.serviceDueAt)
              : t('profile.equipment.unknown')
          }
          testID={`${testID}-service`}
          trailing={
            equipment.inService ? null : (
              <StatusBadge status="blocked" label={t('profile.equipment.overdue')} />
            )
          }
        />
      ) : null}
      <Fact
        label={term('inspection')}
        value={
          inspection
            ? t('profile.equipment.inspectedBy', { name: inspection.inspectedBy.user.name })
            : t('profile.equipment.notInspected')
        }
        testID={`${testID}-inspection`}
        trailing={
          <StatusBadge
            status={inspection ? 'ok' : 'blocked'}
            label={
              inspection ? t('profile.equipment.inspected') : t('profile.equipment.uninspected')
            }
          />
        }
      />
      {packingCard && !equipment.packingCard ? (
        <Text variant="caption" tone="muted">
          {t('profile.equipment.noPackingCard')}
        </Text>
      ) : null}
      <Row gap="sm" wrap>
        {onEdit ? (
          <Button
            variant="secondary"
            icon="pencil-outline"
            label={t('profile.equipment.edit')}
            aria-label={t('profile.equipment.editLabel', { name: title })}
            testID={`${testID}-edit`}
            onPress={onEdit}
          />
        ) : null}
        {onInspect ? (
          <Button
            variant="secondary"
            icon="clipboard-check-outline"
            label={
              inspector ? t('profile.equipment.inspect') : t('profile.equipment.viewInspection')
            }
            aria-label={
              inspector
                ? t('profile.equipment.inspectLabel', { name: title })
                : t('profile.equipment.viewInspectionLabel', { name: title })
            }
            testID={`${testID}-inspect`}
            onPress={onInspect}
          />
        ) : null}
        {packingCard && equipment.packingCard && onViewCard ? (
          <Button
            variant="tertiary"
            icon="image-outline"
            label={t('profile.equipment.packingCard')}
            testID={`${testID}-card`}
            onPress={onViewCard}
          />
        ) : null}
        {packingCard && onUploadCard ? (
          <Button
            variant="tertiary"
            icon="camera-outline"
            label={t('profile.equipment.uploadCard')}
            loading={uploading}
            testID={`${testID}-upload`}
            onPress={onUploadCard}
          />
        ) : null}
      </Row>
    </View>
  );
}

export type EquipmentSectionProps = {
  equipment: readonly ProfileEquipment[];
  inspections: readonly ProfileInspection[] | null | undefined;
  kinds: readonly Pick<
    EquipmentKindEssentialsFragment,
    'id' | 'key' | 'attributeSchema' | 'serviceIntervalDays'
  >[];
  /** Adds an item: absent for those who may not */
  onAdd?(): void;
  /** Edits an item: absent for those who may not */
  onEdit?(equipment: ProfileEquipment): void;
  onInspect(equipment: ProfileEquipment): void;
  inspector?: boolean;
  onViewCard(equipment: ProfileEquipment): void;
  onUploadCard?(equipment: ProfileEquipment): void;
  /** The item whose packing card is being uploaded */
  uploadingId?: string | null;
  testID?: string;
};

/** The member's own equipment: each item with its service date and inspection; staff and the member add and edit (UB.2) */
export default function EquipmentSection({
  equipment,
  inspections,
  kinds,
  onAdd,
  onEdit,
  onInspect,
  inspector,
  onViewCard,
  onUploadCard,
  uploadingId,
  testID = 'profile-equipment',
}: EquipmentSectionProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const name = term('equipment');

  return (
    <Section
      title={name}
      testID={testID}
      action={
        onAdd ? (
          <Button
            variant="secondary"
            icon="plus"
            label={t('profile.equipment.add', { equipment: name.toLowerCase() })}
            testID="profile-add-equipment"
            onPress={onAdd}
          />
        ) : undefined
      }
    >
      {!equipment.length ? (
        <EmptyState
          testID={`${testID}-empty`}
          icon={kindIcon(kinds[0]?.key)}
          title={t('profile.equipment.empty', { equipment: name.toLowerCase() })}
          body={onAdd ? t('profile.equipment.emptyAdd') : undefined}
        />
      ) : (
        equipment.map((item) => (
          <EquipmentItem
            key={item.id}
            testID={`${testID}-${item.id}`}
            equipment={item}
            inspection={inspectionOf(item.id, inspections)}
            kind={kinds.find((kind) => kind.id === item.equipmentKind.id)}
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onInspect={() => onInspect(item)}
            inspector={inspector}
            onViewCard={() => onViewCard(item)}
            onUploadCard={onUploadCard ? () => onUploadCard(item) : undefined}
            uploading={uploadingId === item.id}
          />
        ))
      )}
    </Section>
  );
}
