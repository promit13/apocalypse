import React from 'react';
import {
  View, Text, AsyncStorage, Alert, Dimensions, Animated, Easing, Image,
} from 'react-native';
import { Button } from 'react-native-elements';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import Pedometer from 'react-native-pedometer';

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    marginTop: 10,
    marginLeft: 10,
  },
};

const gifImageSource = require('../../img/walk.gif');

const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'red',
  borderRadius: 5,
  backgroundColorOnComplete: 'green',
};

export default class IosTrack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      steps: 0,
      distance: 0,
      progress: 0,
    };
    this.animatedValue = new Animated.Value(0);
  }

  getStepCountAndDistance = async () => {
    const endDate = new Date();
    const startDate = await AsyncStorage.getItem('startDate');
    console.log('COUNT', startDate);
    Pedometer.queryPedometerDataBetweenDates(
      new Date(startDate).getTime(), endDate.getTime(), (pedometerData) => {
        console.log('COUNT', pedometerData);
      },
    );
  };

  startTrackingSteps = async () => {
    this.setState({ steps: 0, distance: 0 });
    const startDate = new Date();
    console.log('Date', startDate);
    try {
      await AsyncStorage.setItem('startDate', startDate.toString());
    } catch (error) {
      console.log('START ERROR', error);
    }
    Pedometer.startPedometerUpdatesFromDate(startDate.getTime(), (pedometerData) => {
      console.log('START RESPONSE', pedometerData);
    });
  }

  increase = () => {
    this.setState(prevState => ({
      progress: ((prevState.progress + 30) > 100 ? 100 : (prevState.progress + 30)),
    }));
    this.animate();
  }

  animate = () => {
    this.animatedValue.setValue(0); // sets icon to start
    Animated.timing(
      this.animatedValue,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
      },
    ).start(); // .start(() => this.animate()) repeats animation
  }

  render() {
    const moving = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (((this.state.progress - 10) / 100) * barWidth)],
    });
    return (
      <View style={styles.container}>
        <Animated.View style={{ marginLeft: moving }}>
          <Image style={{ height: 40, width: 40, marginBottom: 5 }} source={gifImageSource} />
        </Animated.View>
        <ProgressBarAnimated
          {...progressCustomStyles}
          width={barWidth}
          value={this.state.progress}
          barAnimationDuration={1000}
          onComplete={() => {
            Alert.alert('Hey!', 'You finished the exercise!');
          }}
        />
        <Text style={styles.text}>
          {`Steps: ${this.state.steps}`}
        </Text>
        <Text style={styles.text}>
          {`Distance: ${this.state.distance} km`}
        </Text>
        <Button buttonStyle={{ marginTop: 10 }} title="Increase" onPress={() => this.increase()} />
        <Button buttonStyle={{ marginTop: 10 }} title="Start" onPress={() => this.startTrackingSteps()} />
        <Button buttonStyle={{ marginTop: 10 }} title="End" onPress={() => this.getStepCountAndDistance()} />
      </View>
    );
  }
}
