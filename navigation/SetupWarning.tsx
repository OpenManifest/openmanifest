import * as React from "react";
import { Paragraph, Button} from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/core";


interface ISetupWarning {
  credits: number;
  loading: boolean;
  isRigSetUp: boolean;
  isRigInspectionComplete: boolean;
  isCreditSystemEnabled: boolean;
  isExitWeightDefined: boolean;
  isReserveInDate: boolean;
  isMembershipInDate: boolean;
}

function Warning(props: { title: string, action?: () => void }) {
  return (
    <View style={styles.warning}>
        <Paragraph style={{ color: "white",  }}>
          {props.title}
        </Paragraph>
      </View>
  );
}

export default function SetupWarning(props: ISetupWarning) {
  const { credits, loading, isCreditSystemEnabled, isRigSetUp, isExitWeightDefined, isMembershipInDate, isReserveInDate, isRigInspectionComplete } = props;

  if (props.loading) {
    return null;
  }
  
  const navigation = useNavigation();

  if (!isExitWeightDefined || !isRigSetUp) {
    const missing = [
      !isExitWeightDefined ? "exit weight" : null,
      !isRigSetUp ? "at least one rig" : null,
    ].filter(Boolean);

    return (
      <Warning
        title={`You need to define ${missing.join("and")} in your profile`}
        action={() => navigation.navigate("Profile")}
      />
    );
  } else if (!isMembershipInDate) {
    return (
      <Warning
        title="Your membership seems to be out of date"
        action={() => navigation.navigate("Profile")}
      />
    )
  } else if (!isRigInspectionComplete) {
    return (
      <Warning
        title={`Your rig must be inspected before you can manifest at this dropzone`}
      />
    );
  } else if (!isReserveInDate) {
    return (
      <Warning
        title={`Your reserve repack is due. You cannot manifest if your repack is out of date.`}
      />
    );
  } else if (isCreditSystemEnabled && !credits && !loading) {
    return (
      <Warning
        title="You'll need to top up on credits before you can manifest"
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    width: "100%",
    backgroundColor: "black",
    justifyContent: "space-between",
    paddingHorizontal: 32
  },
})
