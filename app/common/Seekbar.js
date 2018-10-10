import React from 'react';
import { View, Slider } from 'react-native';

export default Seekbar = ({ totalLength, onDragSeekBar, seekValue }) => (
  <View>
    <Slider
      step={1}
      minimumValue={0}
      maximumValue={totalLength}
      value={seekValue}
      thumbTintColor="#FFC300"
      minimumTrackTintColor="#FFC300"
      maximumTrackTintColor="#ffffff"
      onValueChange={changedValue => onDragSeekBar(changedValue)}
      style={{ width: '100%', marginTop: 10 }}
    />
  </View>
);
