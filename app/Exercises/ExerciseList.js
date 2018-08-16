import React from 'react';
import { ScrollView, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../config/firebase';

export default class ExerciseList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('category', ''),
    };
  };

  state = {
    exercises: '',
  }

  componentDidMount() {
    firebase.database().ref('exercises').on('value', snapshot => this.setState({ exercises: snapshot.val() }));
  }

  render() {
    const { category } = this.props.navigation.state.params;
    const exerciseList = Object.entries(this.state.exercises).map(([key, value], i) => {
      if (value.category === category) {
        return (
          <ListItem
            key={key}
            title={value.title}
            titleStyle={{ color: 'white', fontSize: 18 }}
            containerStyle={{ backgroundColor: '#33425a' }}
            underlayColor="#2a3545"
            onPress={() => this.props.navigation.navigate('ExercisePlayer', {
              title: value.title,
              videoUrl: value.video,
            })}
          />
        );
      }
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
