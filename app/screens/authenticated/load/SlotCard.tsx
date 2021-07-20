import * as React from "react";
import { Text } from "react-native";
import { Avatar, Badge, Card, Chip } from "react-native-paper";
import { Slot } from "../../../graphql/schema";

interface ISlotCardProps {
  slot: Slot;
  onPress?(slot: Slot): void;
  onDelete?(slot: Slot): void;
}

export default function SlotCard(props: ISlotCardProps) {
  const { slot, onPress, onDelete } = props;

  return (
    <Card onPress={() => onPress(slot)} elevation={3} style={{ marginVertical: 4 }}>
      <Card.Title
        title={slot?.dropzoneUser?.user.name}
        left={() =>
          slot?.dropzoneUser?.user?.image
          ? <Avatar.Image source={{ uri: slot?.dropzoneUser?.user.image }} size={24} />
          : <Avatar.Icon icon="account" size={24} />
        }
        right={() =>
          !onDelete ? null :
          <Badge style={{ position: "absolute", marginTop: -45, marginRight: -45 }} onPress={(e) => { e.preventDefault(); onDelete?.(slot); }}>
            -
          </Badge>
        }
      />
      <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip style={{ margin: 2, height: 25, padding: 0, alignItems: "center" }} textStyle={{ fontSize: 12 }} icon="lock" mode="outlined" disabled>
          {slot?.dropzoneUser?.role?.name}
        </Chip>
        <Chip style={{ margin: 2, height: 25, padding: 0, alignItems: "center" }} textStyle={{ fontSize: 12 }} icon="ticket-account" mode="outlined" disabled>
          {slot?.dropzoneUser?.user?.license?.name}
        </Chip>
        <Chip style={{ margin: 2, height: 25, padding: 0, alignItems: "center" }} textStyle={{ fontSize: 12 }} icon="human-handsup" mode="outlined" disabled>
          {slot?.jumpType?.name}
        </Chip>
        <Chip style={{ margin: 2, height: 25, padding: 0, alignItems: "center" }} textStyle={{ fontSize: 12 }} icon="arrow-up-bold" mode="outlined" disabled>
          {slot?.ticketType?.name}
        </Chip>
        {
          !slot.wingLoading
            ? null
            : <Chip
                style={{ margin: 2, height: 25, padding: 0, alignItems: "center" }}
                textStyle={{ fontSize: 12 }}
                icon="escalator-down"
                mode="outlined"
                disabled
              >
                {slot.wingLoading.toFixed(2)}
              </Chip>
                
          }
      </Card.Content>
    </Card>
  );
}