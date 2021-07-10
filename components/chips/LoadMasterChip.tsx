import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import { Slot, DropzoneUser, Permission } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";

interface ILoadMasterChipSelect {
  value?: DropzoneUser | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  slots: Slot[];
  onSelect(user: DropzoneUser): void;
}


export default function LoadMasterChip(props: ILoadMasterChipSelect) {
  const { small, color, backgroundColor } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const allowed = useRestriction(Permission.UpdateLoad);

  return (
    !allowed ?
    <Chip
      mode="outlined"
      icon="shield-account"
      style={{ 
        marginHorizontal: 4,
        backgroundColor,
        height: small ? 25 : undefined,
        alignItems: "center",
        borderColor: color ? color : undefined,
      }}
      textStyle={{ color, fontSize: small ? 12 : undefined }}
    >
      {props.value?.user?.name || "No loadmaster"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="shield-account"
          style={{ 
            marginHorizontal: 4,
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: "center",
            borderColor: color ? color : undefined,
          }}
          textStyle={{ color, fontSize: small ? 12 : undefined }}
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