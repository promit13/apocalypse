import React from 'react';
import { ScrollView, View, TouchableWithoutFeedback } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = {
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
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
        <Icon
          name="delete"
          color="white"
          size={30}
          onPress={() => this.deleteExercise(exerciseId)}
        />
      );
    }
  }

  render() {
    const exerciseList = Object.entries(this.state.exercises).map(([key, value], i) => {
      return (
        <TouchableWithoutFeedback onLongPress={() => this.setState({ index: i + 1 })}>
          <View>
            <View style={styles.mainContainer}>
              <Text h4 style={{ color: 'white' }}>
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
