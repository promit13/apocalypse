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
    Pedometer.queryPedometerDataBetweenDates(
      new Date(startDate).getTime(), endDate, (error, pedometerData) => {
        if (error) {
          console.log(error);
        }
        const { distance, numberOfSteps } = pedometerData;
        this.setState({ distance: (distance / 1000).toFixed(2), steps: numberOfSteps });
      },
    );
  };

  getState = () => {
    return this.state.distance;
  }

  requestPermissions = async () => {
    Permissions.check('motion').then((response) => {
      if (response !== 'authorized') {
        Permissions.request('motion').then((res) => {
          console.log(res);
        });
      }
    });
  }


  // { floorsAscended: 0,
  //   startDate: '2018-09-27T10:13:31.234Z',
  //   numberOfSteps: 11,
  //   floorsDescended: 0,
  //   endDate: '2018-09-27T10:13:42.390Z',
  //   distance: 11.549999999999955 }

  startTrackingSteps = async () => {
    this.setState({ steps: 0, distance: 0 });
    const startDate = new Date();
    try {
      await AsyncStorage.setItem('startDate', startDate);
      Pedometer.startPedometerUpdatesFromDate(startDate.getTime(), (pedometerData) => {
        console.log(pedometerData);
      });
    } catch (error) {
      console.log(error);
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
    // const moving = this.animatedValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, (((this.state.progress - 10) / 100) * barWidth)],
    // });
    return (
      <View>
        {/* <Animated.View style={{ marginLeft: moving }}>
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
        <Button buttonStyle={{ marginTop: 10 }} title="End" onPress={() => this.getStepCountAndDistance()} /> */}
      </View>
    );
  }
}
