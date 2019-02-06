import React from 'react';
import { ScrollView, View } from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import firebase from '../config/firebase';
import ShowModal from '../common/ShowModal';

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
    showModal: false,
    advance: false,
  }

  componentDidMount() {
    firebase.database().ref('exercises').on('value', snapshot => this.setState({
      exercises: snapshot.val(),
    }));
  }

  render() {
    const { category } = this.props.navigation.state.params;
    const { exercises, showModal } = this.state;
    const { netInfo } = this.props.screenProps;
    const exercisesValueArray = Object.values(exercises);
    const sortedExercises = exercisesValueArray.sort((a, b) => a.title.localeCompare(b.title));
    const exerciseList = sortedExercises.map((value, i) => {
      if (value.category === category) {
        const {
          title, advanced, video, image, visibleOnList,
        } = value;
        if (visibleOnList) {
          return (
            <ListItem
              key={title}
              title={title}
              titleStyle={{ color: this.state.advance && advanced === undefined ? 'gray' : 'white', fontSize: moderateScale(18) }}
              containerStyle={{ backgroundColor: '#33425a' }}
              underlayColor={this.state.advance && advanced === undefined ? '#33425a' : '#2a3545'}
              onPress={() => {
                if (!netInfo) {
                  return this.setState({ showModal: true });
                }
                if (this.state.advance && advanced === undefined) {
                  return;
                }
                const videoUrl = this.state.advance ? advanced.video : video;
                const imageUrl = this.state.advance ? advanced.image : image;
                this.props.navigation.navigate('TalonIntelPlayer', {
                  video: videoUrl,
                  exerciseTitle: title,
                  image: imageUrl,
                  exercise: true,
                  mode: 'Exercise Player',
                  navigateBack: 'ExerciseList',
                });
              }}
            />
          );
        }
      }
    });
    return (
      <View style={styles.mainViewContainer}>
        {
          category === 'Speed'
            ? null
            : (
              <View style={styles.buttonsViewContainer}>
                <View style={[styles.buttonView, { backgroundColor: this.state.introButtonColor }]}>
                  <Button
                    buttonStyle={{ backgroundColor: 'transparent' }}
                    color="#001331"
                    fontSize={moderateScale(18)}
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
                    fontSize={moderateScale(18)}
                    title="Advanced"
                    onPress={() => {
                      this.setState({ advance: true, introButtonColor: '#fff', advancedButtonColor: '#f5cb23' });
                    }}
                  />
                </View>
              </View>
            )
        }
        <ShowModal
          visible={showModal}
          title="Please check your internet connection"
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <ScrollView>
          { exerciseList }
        </ScrollView>
      </View>
    );
  }
}
