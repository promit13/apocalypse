import React from 'react';
import RNFetchBlob from 'react-native-fetch-blob';
import {
  View, StyleSheet, Image, TouchableOpacity, Dimensions, ImageBackground,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';

const backgroundImage = require('../../img/background.png');

const { width } = Dimensions.get('window');
const imageSize = width - 80;
const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingRight: 20,
    paddingLeft: 20,
  },
  image: {
    alignSelf: 'center',
    width: '75%',
    height: '80%',
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
  },
  text: {
    color: 'white',
    alignSelf: 'center',
    paddingBottom: 10,
  },
});

export default function AlbumArt({
  url,
  onPress,
  currentExercise,
  showInfo,
  offline,
  advance,
  talonPlayer,
  paddingTop,
}) {
  const { dirs } = RNFetchBlob.fs;
  const formattedUrl = offline ? url.replace(/\s+/g, '') : '';
  console.log(formattedUrl);
  return (
    <ImageBackground style={[styles.container, { paddingTop }]} source={backgroundImage}>
      {
        offline
          ? (
            <Image
              style={styles.image}
              source={{
                uri: advance
                  ? `file://${dirs.DocumentDir}/AST/advanceImages/${formattedUrl}.png`
                  : `file://${dirs.DocumentDir}/AST/introImages/${formattedUrl}.png`,
              }}
            />
          )
          : (
            <Image
              style={styles.image}
              source={{ uri: url }}
            />
          )
      }
      { talonPlayer
          ? null
          : (
              showInfo
                ? (
                    <TouchableOpacity onPress={onPress}>
                      <View style={styles.infoView}>
                        <Icon type="ionicon" name="ios-information" color="#f5cb23" />
                      </View>
                    </TouchableOpacity>
                  )
                : <View style={{ height: 27 }} />
            )
        // : <View style={{ height: 27 }} />
      }
      <Text h4 style={styles.text}>
        {currentExercise}
      </Text>
      {/* {
        talonPlayer
          ? null
          : (
            <Text h4 style={styles.text}>
              {currentExercise}
            </Text>
          )
      } */}
    </ImageBackground>
  );
}
