import React from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Icon } from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(10),
    paddingTop: moderateScale(8),
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
          <Icon name="replay-10" color="#f5cb23" underlayColor="#001331" onPress={onBack} size={moderateScale(40)} />
        )
        : (
          exercisePlayer
          ? null
          : <Icon name="replay" color="#f5cb23" underlayColor="#001331" onPress={navigateToPreviousExercise} size={moderateScale(40)} />
          
        )
      }
      <View style={{ width: moderateScale(40) }} />
      {!paused
        ? (
          <Icon name="pause" color="#f5cb23" underlayColor="#001331" size={moderateScale(60)} onPress={onPressPause} />
        )
        : (
          <Icon name="play-arrow" color="#f5cb23" underlayColor="#001331" size={moderateScale(60)} onPress={onPressPlay} />
        )
      }
      <View style={{ width: moderateScale(40) }} />
      { onForward && renderForwardButton
        ? (
          <Icon name="forward-10" onPress={onForward} underlayColor="#001331" color="#f5cb23" size={moderateScale(40)} />
        )
        : (
          exercisePlayer
          ? null
          : <Icon name="forward-10" onPress={() => {}} underlayColor="#001331" color="#001331" size={moderateScale(40)} />
        )
        
      }
      
    </View>
  );
}
