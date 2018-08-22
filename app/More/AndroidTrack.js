import React from 'react';
import {
  View, Text, AsyncStorage, PermissionsAndroid, Alert, Dimensions,
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
const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'red',
  borderRadius: 5,
  backgroundColorOnComplete: 'green',
};

export default class AndroidTrack extends React.Component {
    state = {
      steps: 0,
      distance: 0,
      progressPercentage: 0,
    };

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
      console.log(startDate);
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
        console.log('Daily steps >>>', res);
        GoogleFit.getDailyDistanceSamples(options, (error, response) => {
          if (error) {
            throw error;
          }
          const distance = ((response[0].distance) / 1000).toFixed(2);
          const progressPercentage = ((distance / 5) * 100);
          this.setState({ distance, steps, progressPercentage });
          console.log('Daily Distance >>>', distance);
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
      return (
        <View style={styles.container}>
          <ProgressBarAnimated
            width={barWidth}
            {...progressCustomStyles}
            value={this.state.progressPercentage}
            onComplete={() => {
              Alert.alert('Hey!', 'You finished the exercise!');
            }}
          />
          <Text style={styles.text}>
            {`Steps Android: ${this.state.steps}`}
          </Text>
          <Text style={styles.text}>
            {`Distance Android: ${this.state.distance} km`}
          </Text>
          <Button buttonStyle={{ marginTop: 10 }} title="Start Android" onPress={() => this.startTrackingSteps()} />
          <Button buttonStyle={{ marginTop: 10 }} title="End Android" onPress={() => this.getStepCountAndDistance()} />
        </View>
      );
    }
}
