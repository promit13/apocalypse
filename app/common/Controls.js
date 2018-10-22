import React from 'react';

import {
  View, StyleSheet,
} from 'react-native';

import { Icon } from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 8,
  },
  rewindText: {
    color: 'white',
    fontSize: 20,
  },
  playButton: {
    height: 72,
    width: 72,
    borderWidth: 2,
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
  },
});

export default function Controls({
  paused,
  onPressPlay,
  onPressPause,
  onBack,
  onForward,
  renderForwardButton,
  navigateToPreviousExercise,
  exercisePlayer,
}) {
  return (
    <View style={styles.container}>
      { renderForwardButton
        ? (
          <Icon name="replay-10" color="#f5cb23" underlayColor="#001331" onPress={onBack} size={40} />
        )
        : (
          exercisePlayer
          ? null
          : <Icon name="replay" color="#f5cb23" underlayColor="#001331" onPress={navigateToPreviousExercise} size={40} />
          
        )
      }
      <View style={{ width: 40 }} />
      {!paused
        ? (
          <Icon name="pause" color="#f5cb23" underlayColor="#001331" size={40} onPress={onPressPause} />
        )
        : (
          <Icon name="play-arrow" color="#f5cb23" underlayColor="#001331" size={40} onPress={onPressPlay} />
        )
      }
      <View style={{ width: 40 }} />
      { onForward && renderForwardButton && (
        <Icon name="forward-10" onPress={onForward} underlayColor="#001331" color="#f5cb23" size={40} />
      )
      }
    </View>
  );
}
