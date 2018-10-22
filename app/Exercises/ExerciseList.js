import React from 'react';
import { ScrollView, View } from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = {
  mainViewContainer: {
    flex: 1,
    backgroundColor: '#001331',
  },
  buttonsViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5cb23',
    alignItems: 'center',
  },
  buttonView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#f5cb23',
    color: 'blue',
  },
};

export default class ExerciseList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('category', ''),
    };
  };

  state = {
    exercises: '',
    introButtonColor: '#f5cb23',
    advancedButtonColor: '#fff',
    advance: false,
  }

  componentDidMount() {
    firebase.database().ref('exercises').on('value', snapshot => this.setState({ exercises: snapshot.val() }));
  }

  render() {
    const { category } = this.props.navigation.state.params;
    const exerciseList = Object.entries(this.state.exercises).map(([key, value], i) => {
      if (value.category === category) {
        const {
          title, advanced, video, image,
        } = value;
        return (
          <ListItem
            key={key}
            title={title}
            titleStyle={{ color: 'white', fontSize: 18 }}
            containerStyle={{ backgroundColor: '#33425a' }}
            underlayColor="#2a3545"
            onPress={() => {
              const videoUrl = this.state.advance && advanced !== undefined ? advanced.video : video;
              const imageUrl = this.state.advance && advanced !== undefined ? advanced.image : image;
              this.props.navigation.navigate('TalonIntelPlayer', {
                video: videoUrl,
                exerciseTitle: title,
                image: imageUrl,
                exercise: true,
              });
            }}
          />
        );
      }
    });
    return (
      <View style={styles.mainViewContainer}>
        <View style={styles.buttonsViewContainer}>
          <View style={[styles.buttonView, { backgroundColor: this.state.introButtonColor }]}>
            <Button
              buttonStyle={{ backgroundColor: 'transparent' }}
              color="#001331"
              fontSize={18}
              title="Intro"
              onPress={() => {
                this.setState({ advance: false, introButtonColor: '#f5cb23', advancedButtonColor: '#fff' });
              }}
            />
          </View>
          <View style={[styles.buttonView, { backgroundColor: this.state.advancedButtonColor }]}>
            <Button
              buttonStyle={{ backgroundColor: 'transparent' }}
              color="#001331"
              fontSize={18}
              title="Advanced"
              onPress={() => {
                this.setState({ advance: true, introButtonColor: '#fff', advancedButtonColor: '#f5cb23' });
              }}
            />
          </View>
        </View>
        <ScrollView>
          { exerciseList }
        </ScrollView>
      </View>
    );
  }
}
