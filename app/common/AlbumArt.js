import React from 'react';
import RNFetchBlob from 'react-native-fetch-blob';
import {
  View, StyleSheet, Image, TouchableOpacity, Dimensions,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';

const { width } = Dimensions.get('window');
const imageSize = width - 80;
const styles = StyleSheet.create({
  container: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  image: {
    alignSelf: 'center',
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
  text: {
    color: 'white',
    alignSelf: 'center',
  },
});

export default function AlbumArt({
  url,
  onPress,
  currentExercise,
  showInfo,
  offline,
}) {
  const { dirs } = RNFetchBlob.fs;
  return (
    <View style={styles.container}>
      {
        offline
          ? (
            <Image
              style={styles.image}
              source={{ uri: `file://${dirs.DocumentDir}/AST/images/${url}.png` }}
            />)
          : (
            <Image
              style={styles.image}
              source={{ uri: url }}
            />)
      }
      { showInfo && (
        <TouchableOpacity onPress={onPress}>
          <View style={styles.infoView}>
            <Icon type="ionicon" name="ios-information" color="#f5cb23" />
          </View>
        </TouchableOpacity>
      )
        }
      <Text h4 style={styles.text}>
        {currentExercise}
      </Text>
    </View>
  );
}
