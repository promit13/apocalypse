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
    const { workOutTime, currentTime, remainingTime, landscape } = this.props;
    return (
      <View style={{ flexDirection: workOutTime && landscape ? 'column' : 'row', justifyContent: workOutTime ? 'center' : 'space-between', padding: 10 }}>
        <Text style={{ color: 'white', alignSelf: workOutTime && landscape ? 'center' : 'flex-start' }}>
          { workOutTime
            ? `Workout Time: ${this.formatTime(currentTime)}`
            : this.formatTime(currentTime)
          }
        </Text>
        <Text style={{ color: 'white', alignSelf: workOutTime && landscape ? 'center' : 'flex-end' }}>
          { workOutTime
            ? `  Workout Left: ${this.formatTime(remainingTime)}`
            : this.formatTime(remainingTime)
          }
        </Text>
      </View>
    );
  }
}
