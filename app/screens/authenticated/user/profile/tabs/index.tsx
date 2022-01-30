import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { DropzoneUserProfileFragment } from 'app/api/operations';
import { useAppSelector } from 'app/state';
import { View } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import JumpHistoryTab from './JumpHistory';
import FundTab from './Transactions'
import EquipmentTab from './Equipment'

// const ProfileTabs = createMaterialTopTabNavigator();

interface IProfileTabsProps {
  onChange(tab: ProfileTabs): void;
}

export enum ProfileTabs {
  Funds,
  Jumps,
  Equipment
}

export function ProfileTab(props: { active: ProfileTabs, dropzoneUser: DropzoneUserProfileFragment }) {
  const { active, dropzoneUser } = props;
  if (active === ProfileTabs.Funds) {
    return <FundTab { ...{ dropzoneUser }} tabIndex={ProfileTabs.Funds} currentTabIndex={active} />
  }
  if (active === ProfileTabs.Equipment) {
    return <EquipmentTab { ...{ dropzoneUser }} tabIndex={ProfileTabs.Equipment} currentTabIndex={active} />
  }
  if (active === ProfileTabs.Jumps) {
    return <JumpHistoryTab {...{ dropzoneUser }} tabIndex={ProfileTabs.Jumps} currentTabIndex={active} />
  }
  return null;
}
export default function TabBar(props: IProfileTabsProps) {
  const { onChange } = props;
  const { colors, dark } = useAppSelector(state => state.global.theme);
  const { currentUser } = useCurrentDropzone();

  return (
    <Tabs
      defaultIndex={ProfileTabs.Jumps}
      disableSwipe
      style={{ backgroundColor: colors.surface }}
      mode="fixed"
      dark={dark}
    >
      <TabScreen label="Funds" icon="cash" key="funds" onPress={() => onChange(0)}>
        <View />
      </TabScreen>
      <TabScreen label="Jumps" icon="airplane-takeoff" key="jumps" onPress={() => onChange(1)}>
        <View />
      </TabScreen>
      <TabScreen label="Equipment" icon="parachute" key="equipment" onPress={() => onChange(2)}>
        <View />
      </TabScreen>
      </Tabs>
  );
}