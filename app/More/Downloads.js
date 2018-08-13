import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = {
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};
export default class Downloads extends React.Component {
  state = {
    exercises: '',
    index: 0,
  }

  componentDidMount() {
    firebase.database().ref('exercises').on('value', snapshot => this.setState({ exercises: snapshot.val() }));
  }

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
        <ScrollView>
          { exerciseList }
        </ScrollView>
      </View>
    );
  }
}
