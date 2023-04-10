import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Avatar } from 'react-native-paper';
import { PaginationProps } from 'react-native-swiper-flatlist';
import { successColor } from '../../constants/Colors';

interface IWizardPagination extends PaginationProps {
  icons?: string[];
}
export default function WizardPagination(props: IWizardPagination) {
  const { size, paginationIndex, icons } = props;

  const { width } = Dimensions.get('window');
  const screenWidth = width > 500 ? 500 : width;

  const bridgeLength = (screenWidth - 48 * 2 - size * 30) / size;

  return (
    <View style={styles.pagination}>
      {Array.from({ length: size }).map((_, index) => {
        const hasCustomIcon = icons && icons.length > index;
        const isPast = index < (paginationIndex || 0);
        const isCurrent = index === paginationIndex;
        let defaultIcon = isPast ? 'check' : '';
        defaultIcon = isCurrent ? 'pencil' : defaultIcon;

        return (
          <React.Fragment key={index}>
            <Avatar.Icon
              icon={hasCustomIcon && icons ? icons[index] : defaultIcon}
              size={30}
              style={[styles.icon, (paginationIndex || 0) > index ? styles.iconDone : undefined]}
            />
            {size - 1 > index ? (
              <View
                style={[
                  styles.bridge,
                  { width: bridgeLength },
                  (paginationIndex || 0) > index ? styles.bridgeDone : undefined
                ]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    top: 100,
    alignSelf: 'center'
  },
  bridge: {
    height: 10,
    marginTop: 10,
    marginLeft: -2,
    width: 50,
    backgroundColor: 'white'
  },
  bridgeDone: {
    backgroundColor: successColor
  },
  icon: {
    backgroundColor: 'white',
    marginLeft: -1
  },
  iconDone: {
    backgroundColor: successColor,
    marginLeft: -1
  }
});
