import React from 'react';
import {
  View, Text, AsyncStorage, PermissionsAndroid, Alert, Dimensions, Animated, Easing, Image,
} from 'react-native';
import { Button } from 'react-native-elements';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import GoogleFit from 'react-native-google-fit';

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

export default class AndroidTrack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      steps: 0,
      distance: 0,
      progressPercentage: 0,
    };
    this.animatedValue = new Animated.Value(0);
  }

  componentWillMount() {
    this.requestPermissions();
  }

  componentDidMount() {
    GoogleFit.authorize((error, result) => {
      if (error) {
        return console.log(`AUTH ERROR ${error}`);
      }
      return console.log(`AUTH SUCCESS ${result}`);
    });
    GoogleFit.onAuthorize(() => {
      console.log('AUTH SUCCESS');
    });

    GoogleFit.onAuthorizeFailure(() => {
      console.log('AUTH FAILED');
    });
  }

  componentWillUnmount() {
    GoogleFit.unsubscribeListeners();
  }

    getStepCountAndDistance = async () => {
      const startDate = await AsyncStorage.getItem('startDate');
      const options = {
        startDate,
        endDate: new Date().toISOString(), // required ISO8601Timestamp
      };
      GoogleFit.getDailyStepCountSamples(options, (err, res) => {
        if (err) {
          throw err;
        }
        const stepsResponse = res[0];
        const stepArray = stepsResponse.steps;
        if (stepArray.length === 0) {
          return;
        }
        const steps = stepArray[0].value;
        GoogleFit.getDailyDistanceSamples(options, (error, response) => {
          if (error) {
            throw error;
          }
          const distance = ((response[0].distance) / 1000).toFixed(2);
          const progressPercentage = ((distance / 15) * 100);
          this.setState(
            { distance, steps, progressPercentage: (progressPercentage > 100 ? 100 : progressPercentage) }
          );
          this.animate();
        });
      });
    }

    startTrackingSteps = async () => {
      this.setState({ steps: 0, distance: 0 });
      try {
        await AsyncStorage.setItem('startDate', new Date().toISOString());
      } catch (error) {
        console.log(error);
      }
      GoogleFit.startRecording(event => console.log(event));
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

    requestPermissions = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can access location');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.log(err);
      }
    }

    render() {
      const moving = this.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (((this.state.progressPercentage - 10) / 100) * barWidth)],
      });

      return (
        <View style={styles.container}>
          <Animated.View style={{ marginLeft: moving }}>
            <Image style={{ height: 40, width: 40, marginBottom: 5 }} source={gifImageSource} />
          </Animated.View>
          <ProgressBarAnimated
            width={barWidth}
            {...progressCustomStyles}
            value={this.state.progressPercentage}
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
          <Button buttonStyle={{ marginTop: 10 }} title="Start" onPress={() => this.startTrackingSteps()} />
          <Button buttonStyle={{ marginTop: 10 }} title="End" onPress={() => this.getStepCountAndDistance()} />
        </View>
      );
    }
}
