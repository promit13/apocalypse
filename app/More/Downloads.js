import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity, NetInfo,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import firebase from '../config/firebase';
import OfflineMsg from '../common/OfflineMsg';

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#33425a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};
export default class Downloads extends React.Component {
  static navigationOptions = {
    title: 'Downloads',
  };

  state = {
    exercises: '',
    index: 0,
    isConnected: false,
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange = (isConnected) => {
    if (isConnected) {
      this.setState({ isConnected });
      firebase.database().ref('exercises').on('value', snapshot => this.setState({ exercises: snapshot.val() }));
    } else {
      this.setState({ isConnected });
    }
  };

  deleteExercise = (exerciseId) => {
    firebase.database().ref(`exercises/${exerciseId}`).remove()
      .then(() => this.setState({ index: 0 }));
  }

  renderDeleteButton = (i, exerciseId) => {
    if (i === this.state.index) {
      return (
        <TouchableOpacity onPress={() => this.deleteExercise(exerciseId)}>
          <View style={{
            flex: 1,
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
          }}
          >
            <Icon
              name="delete"
              color="white"
            />
            <Text style={{ color: 'white' }}>
            Delete
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  render() {
    const exerciseList = Object.entries(this.state.exercises).map(([key, value], i) => {
      return (
        <TouchableWithoutFeedback onLongPress={() => this.setState({ index: i + 1 })}>
          <View>
            <View style={styles.mainContainer}>
              <Text style={{ fontSize: 18, color: 'white', margin: 10 }}>
                {value.title}
              </Text>
              {this.renderDeleteButton(i + 1, key)}
            </View>
            <View style={{
              height: 1,
              width: '100%',
              leftmargin: 10,
              backgroundColor: 'white',
            }}
            />
          </View>
        </TouchableWithoutFeedback>
      );
    });
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        { !this.state.isConnected ? <OfflineMsg /> : null }
        <View style={{ height: 1, backgroundColor: 'gray' }} />
        <ScrollView>
          { exerciseList }
        </ScrollView>
      </View>
    );
  }
}
