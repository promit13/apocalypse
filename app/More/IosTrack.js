import React from 'react';
import {
  View, Text, AsyncStorage, Alert, Dimensions, Animated, Easing, Image,
} from 'react-native';
import Permissions from 'react-native-permissions';
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

  componentDidMount() {
    this.requestPermissions();
  }

  getStepCountAndDistance = async () => {
    const endDate = new Date().getTime();
    const startDate = await AsyncStorage.getItem('startDate');
    console.log('C P', Date.parse(startDate));
    console.log('C DATE', startDate);
    console.log(' End Date', endDate);
    Pedometer.queryPedometerDataBetweenDates(
      Date.parse(startDate), endDate, (pedometerData) => {
        console.log('C S', pedometerData);
        this.setState({ steps: pedometerData.toString() });
      },
    );
  };

  requestPermissions = async () => {
    Permissions.check('motion').then((response) => {
      console.log(response);
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      if (response !== 'authorized') {
        Permissions.request('motion').then((res) => {
          console.log(res);
        });
      }
    });
  }

  startTrackingSteps = async () => {
    this.setState({ steps: 0, distance: 0 });
    const startDate = new Date();
    try {
      await AsyncStorage.setItem('startDate', startDate.toString());
      console.log('G DATE', startDate.toString());
      Pedometer.startPedometerUpdatesFromDate(startDate.getTime(), (pedometerData) => {
        console.log('G PED', pedometerData);
      });
    } catch (error) {
      console.log('START ERROR', error);
    }
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
        {/* <Animated.View style={{ marginLeft: moving }}>
          <Image style={{ height: 40, width: 40, marginBottom: 5 }} source={gifImageSource} />
        </Animated.View> */}
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
