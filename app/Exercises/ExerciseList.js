import React from 'react';
import { ScrollView, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../config/firebase';

export default class ExerciseList extends React.Component {
  state = {
    exercises: '',
  }

  componentDidMount() {
    firebase.database().ref('episodes').on('value', snapshot => this.setState({ exercises: snapshot.val() }));
  }

  render() {
    const exerciseList = Object.entries(this.state.exercises).map(([key, value], i) => {
      // if (this.props.navigation.state.params.category === value.category) { }
      return (
        <ListItem
          key={i}
          title={value.title}
          titleStyle={{ color: 'white', fontSize: 18 }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {}}
        />
      );
    });
    return (
      <View style={{ flex: 1, backgroundColor: "#001331" }}>
        <ScrollView>
          { exerciseList }
        </ScrollView>
      </View>
    );
  }
}
