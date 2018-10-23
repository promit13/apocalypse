import React from 'react';
import { View, Text } from 'react-native';

export default class FormatTime extends React.Component {
  formatTime = (timeToFormat) => {
    let minutes = 0;
    const seconds = Math.round(timeToFormat);
    if (seconds > 60) {
      minutes = Math.floor(seconds / 60);
    }
    let remainder = seconds % 60;
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (remainder < 10) {
      remainder = `0${remainder}`;
    }
    const time = `${minutes} : ${remainder}`;
    return time;
  };

  render() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <Text style={{ color: 'white' }}>
          {this.formatTime(this.props.currentTime)}
        </Text>
        <Text style={{ color: 'white', alignSelf: 'flex-end' }}>
          {`- ${this.formatTime(this.props.remainingTime)}`}
        </Text>
      </View>
    );
  }
}
