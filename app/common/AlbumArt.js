import React from 'react';

import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';

const { width } = Dimensions.get('window');
const imageSize = width - 48;
const styles = StyleSheet.create({
  container: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  image: {
    width: imageSize,
    height: imageSize,
  },
  infoView: {
    height: 18,
    width: 18,
    borderWidth: 1,
    borderColor: '#f5cb23',
    borderRadius: 18 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
});

export default function AlbumArt({
  url,
  onPress,
  currentExercise,
  showInfo,
}) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{ uri: url }}
      />
      { showInfo && (
        <View style={styles.infoView}>
          <TouchableOpacity onPress={onPress}>
            <Icon type="ionicon" name="ios-information" color="#f5cb23" />
          </TouchableOpacity>
        </View>
      )
        }
      <Text h4 style={{ alignSelf: 'center', color: 'white' }}>
        {currentExercise}
      </Text>
    </View>
  );
}
