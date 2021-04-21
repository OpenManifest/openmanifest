import { values } from "lodash";
import React, { useState } from "react";
import { Chip, List, Menu } from "react-native-paper";
import { Slot, User } from "../graphql/schema";
import useRestriction from "../hooks/useRestriction";

interface ILoadMasterChipSelect {
  dropzoneId: number;
  value?: User | null;
  slots: Slot[];
  onSelect(user: User): void;
}




export default function LoadMasterChip(props: ILoadMasterChipSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const allowed = useRestriction("updateLoad");

  return (
    !allowed ?
    <Chip mode="outlined" icon="radio-handheld">
      {props.value?.name || "No loadmaster"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="parachute"
          style={{ marginHorizontal: 4 }}
          onPress={() => allowed && setMenuOpen(true)}
        >
          {props.value?.id ? props.value?.name : "No loadmaster"}
        </Chip>
      }>
      {
        props.slots?.map((slot) => 
          <List.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(slot.user as User);
            }}
            title={
              slot?.user?.name
            }
          />
        )
      }
    </Menu>
  ))
}