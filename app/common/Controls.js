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
          <Icon name="pause" color="#f5cb23" underlayColor="#001331" size={60} onPress={onPressPause} />
        )
        : (
          <Icon name="play-arrow" color="#f5cb23" underlayColor="#001331" size={60} onPress={onPressPlay} />
        )
      }
      <View style={{ width: 40 }} />
      { onForward && renderForwardButton
        ? (
          <Icon name="forward-10" onPress={onForward} underlayColor="#001331" color="#f5cb23" size={40} />
        )
        : (
          exercisePlayer
          ? null
          : <Icon name="forward-10" onPress={() => {}} underlayColor="#001331" color="#001331" size={40} />
        )
        
      }
      
    </View>
  );
}
