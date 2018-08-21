import React from 'react';
import { View, Text, AsyncStorage } from 'react-native';
import { Button } from 'react-native-elements';
import GoogleFit from 'react-native-google-fit';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default class Feedback extends React.Component {
    state = {
      steps: 0,
      distance: 0,
    };

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
          this.setState({ distance, steps });
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

    render() {
      return (
        <View style={styles.container}>
          <Text>
            {`Steps Android: ${this.state.steps}`}
          </Text>
          <Text style={{ marginTop: 10 }}>
            {`Distance Android: ${this.state.distance} km`}
          </Text>
          <Button buttonStyle={{ marginTop: 10 }} title="Start Android" onPress={() => this.startTrackingSteps()} />
          <Button buttonStyle={{ marginTop: 10 }} title="End Android" onPress={() => this.getStepCountAndDistance()} />
        </View>
      );
    }
}
