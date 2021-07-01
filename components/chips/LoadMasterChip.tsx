import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import { Slot, DropzoneUser, Permission } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";

interface ILoadMasterChipSelect {
  value?: DropzoneUser | null;
  slots: Slot[];
  onSelect(user: DropzoneUser): void;
}




export default function LoadMasterChip(props: ILoadMasterChipSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const allowed = useRestriction(Permission.UpdateLoad);

  return (
    !allowed ?
    <Chip mode="outlined" icon="shield-account">
      {props.value?.user?.name || "No loadmaster"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="shield-account"
          style={{ marginHorizontal: 4 }}
          onPress={() => allowed && setMenuOpen(true)}
        >
          {props.value?.id ? props.value?.user?.name : "No loadmaster"}
        </Chip>
      }>
      {
        props.slots?.map((slot) => 
          <Menu.Item
            key={`lm-chip-${slot.id}`}
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(slot.dropzoneUser);
            }}
            title={
              slot?.dropzoneUser?.user?.name
            }
          />
        )
      }
    </Menu>
  ))
}