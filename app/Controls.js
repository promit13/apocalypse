import React, { Component } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

const Controls = ({
  paused,
  onPressPlay,
  onPressPause,
  onBack,
  onDownload,
}) => (
  <View style={styles.container}>

    { onBack && 
      <TouchableOpacity onPress={onBack}>
          <Text style={styles.rewindText}> 15s </Text>
      </TouchableOpacity>
    }
    <View style={{width: 60}} />
    {!paused ?
      <TouchableOpacity onPress={onPressPause}>
        <View style={styles.playButton}>
          <Image source={require('../img/ic_pause_white_48pt.png')}/>
        </View>
      </TouchableOpacity> :
      <TouchableOpacity onPress={onPressPlay}>
        <View style={styles.playButton}>
          <Image source={require('../img/ic_play_arrow_white_48pt.png')}/>
        </View>
      </TouchableOpacity>
    }
    <View style={{width: 40}} />
    { onDownload &&
      <TouchableOpacity onPress={onDownload} >
          <View style={styles.addButton} >
            <Image source={require('../img/ic_add_circle_outline_white.png')}/>
          </View>
      </TouchableOpacity>
    }
  </View>
);

export default Controls;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 8,
  },
  rewindText: {
    color: 'white',
    fontSize: 20,
  },
  playButton: {
    height: 72,
    width: 72,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 72 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    height: 72,
    width: 72,
    
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryControl: {
    height: 18,
    width: 18,
  },
  off: {
    opacity: 0.30,
  }
})
