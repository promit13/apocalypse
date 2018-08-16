import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import haversine from 'haversine';

export default class Credits extends Component {
  static navigationOptions = {
    title: 'Credits',
  };

  constructor(props) {
    super(props);

    this.state = {
      startLatitude: null,
      startLongitude: null,
      endLatitude: null,
      endLongitude: null,
      error: null,
      startTime: '',
      endTime: '',
      startCoord: null,
      endCoord: null,
      distance: null,
    };
  }

  getLocation = (checkButton) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (checkButton === 'start') {
          this.setState({
            startLatitude: position.coords.latitude,
            startLongitude: position.coords.longitude,
            error: null,
            startTime: new Date().toLocaleString(),
            startCoord: { latitude: position.coords.latitude, longitude: position.coords.longitude },
          });
        } else {
          this.setState({
            endLatitude: position.coords.latitude,
            endLongitude: position.coords.longitude,
            error: null,
            endTime: new Date().toLocaleString(),
            endCoord: { latitude: position.coords.latitude, longitude: position.coords.longitude },
          });
        }
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  calcDistance = () => {
    const distance = haversine(this.state.startCoord, this.state.endCoord, { unit: 'mile' });
    return this.setState({ distance });
  }

  render() {
    return (
      <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button title="Start" onPress={() => this.getLocation('start')} />
        <Button title="Stop" onPress={() => this.getLocation()} />
        <Button title="Calc distance" onPress={() => this.calcDistance()} />
        <Text>
        Latitude: {this.state.startLatitude}
        </Text>
        <Text>
        Longitude: {this.state.startLongitude}
        </Text>
        <Text>
          {this.state.startTime}
        </Text>
         <Text>
        Latitude: {this.state.endLatitude}
        </Text>
        <Text>
        Longitude: {this.state.endLongitude}
        </Text>
        <Text>
          {this.state.endTime}
        </Text>
        <Text>{this.state.distance}</Text>
        {this.state.error
          ? <Text>
          Error:
            {this.state.error}
          </Text>
          : null
        }
      </View>
    );
  }
}
