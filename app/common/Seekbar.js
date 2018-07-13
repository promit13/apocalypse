import React from 'react';
import { View, Slider } from 'react-native';

export default Seekbar = ({ totalLength, onDragSeekBar, seekValue }) => (
  <View>
    <Slider
      step={0}
      minimumValue={0}
      maximumValue={totalLength}
      value={seekValue}
      minimumTrackTintColor="#009688"
      onValueChange={changedValue => onDragSeekBar(changedValue)}
      style={{ width: '100%' }}
    />
  </View>
);
