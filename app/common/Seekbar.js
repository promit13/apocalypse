import React from 'react';
import { View, Slider } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export default Seekbar = ({
  totalLength,
  onDragSeekBar,
  seekValue,
  sliderReleased,
  listen,
}) => (
  <View>
    <Slider
      step={1}
      minimumValue={0}
      maximumValue={totalLength}
      disabled={listen}
      value={seekValue}
      thumbTintColor="#FFC300"
      minimumTrackTintColor="#FFC300"
      maximumTrackTintColor="#ffffff"
      onValueChange={changedValue => onDragSeekBar(changedValue)}
      onSlidingComplete={changedValue => sliderReleased(changedValue)}
      style={{ width: '100%', marginTop: moderateScale(10) }}
    />
  </View>
);
