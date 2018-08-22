import React from 'react';
import {
  View, Text, AsyncStorage, Alert, Dimensions, Animated, Easing,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
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
const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'red',
  borderRadius: 5,
  backgroundColorOnComplete: 'green',
};

export default class IosTrack extends React.Component {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
  }

  state = {
    steps: 0,
    distance: 0,
    progress: 0,
  };

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
    const { progress } = this.state;
    this.setState({ progress: progress + 20 });
    this.animate();
  }

  animate = () => {
    this.animatedValue.setValue(0);
    Animated.timing(
      this.animatedValue,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
      },
    ).start(() => this.animate());
  }

  render() {
    const movingMargin = this.animatedValue.interpolate({
      inputRange: [0, 0.5],
      outputRange: [0, this.state.progress],
    });
    return (
      <View style={styles.container}>
        <Animated.View style={{ marginLeft: movingMargin }}>
          <Icon iconStyle={{ marginBottom: 10, alignSelf: 'flex-start' }} name="directions-run" color="#001331" />
        </Animated.View>
        <ProgressBarAnimated
          {...progressCustomStyles}
          width={barWidth}
          value={this.state.progress}
          onComplete={() => {
            Alert.alert('Hey!', 'You finished the exercise!');
          }}
        />
        <Text style={styles.text}>
          {`Steps IOS: ${this.state.steps}`}
        </Text>
        <Text style={styles.text}>
          {`Distance IOS: ${this.state.distance} km`}
        </Text>
        <Button buttonStyle={{ marginTop: 10 }} title="Increase" onPress={() => this.increase()} />
        <Button buttonStyle={{ marginTop: 10 }} title="Start IOS" onPress={() => this.startTrackingSteps()} />
        <Button buttonStyle={{ marginTop: 10 }} title="End IOS" onPress={() => this.getStepCountAndDistance()} />
      </View>
    );
  }
}
