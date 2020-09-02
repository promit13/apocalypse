import React from 'react';
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';
import {
  View, StyleSheet, Image, TouchableOpacity, Dimensions, ImageBackground, Platform,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';

const talonImage = require('../../img/talondark.png');
const backgroundImage = require('../../img/background.png');

const { width } = Dimensions.get('window');
const imageSize = width - 80;
const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingRight: moderateScale(20),
    paddingLeft: moderateScale(20),
    justifyContent: 'center',
  },
  image: {
    alignSelf: 'center',
    width: '75%',
    height: '80%',
  },
  imageView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  infoView: {
    height: moderateScale(20),
    width: moderateScale(20),
    borderWidth: 1,
    borderColor: '#f5cb23',
    borderRadius: moderateScale(20 / 2),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  text: {
    color: 'white',
    alignSelf: 'center',
    paddingBottom: moderateScale(10),
    fontSize: moderateScale(24),
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
  const formattedUrl = offline ? url.replace(/\s+/g, '') : '';
  const dirs = RNFetchBlob.fs.dirs.DocumentDir;
  return (
    <ImageBackground style={[styles.container, { paddingTop }]} source={backgroundImage}>
      {
        offline
          ? (
            formattedUrl === ''
            ? (
              <Image
                resizeMode='contain'
                resizeMethod="scale"
                style={styles.image}
                source={talonImage}
              />
            )
            : (
              <Image
                resizeMode='contain'
                resizeMethod="scale"
                style={styles.image}
                source={{
                  uri: advance
                    ? `file://${dirs}/AST/advanceImages/${formattedUrl}.png`
                    : `file://${dirs}/AST/introImages/${formattedUrl}.png`,
                }}
              />
            )
          )
          : (
            <Image
              resizeMode='contain'
              resizeMethod="scale"
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
                        <Icon type="ionicon" size={moderateScale(20)} name="ios-information" color="#f5cb23" />
                      </View>
                    </TouchableOpacity>
                  )
                : <View style={{ height: moderateScale(20) }} />
            )
        // : <View style={{ height: 27 }} />
      }
      <Text style={styles.text}>
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
