import React from 'react';
import {
  ScrollView, View, Image, AsyncStorage,
} from 'react-native';
import {
  ListItem, Button, Text,
} from 'react-native-elements';
import realm from '../config/Database';
import LoadScreen from '../LoadScreen';
import firebase from '../config/firebase';

const styles = {
  mainContainer: {
    backgroundColor: '#001331',
  },
  buttonsViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5cb23',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  circularImageView: {
    height: 120,
    width: 120,
    borderRadius: 120 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    marginLeft: 15,
    marginRight: 15,
  },
  buttonView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#f5cb23',
    color: 'blue',
    alignSelf: 'flex-start',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
};

const speedImage = require('../../img/speed.png');
const strengthImage = require('../../img/strength.png');
const controlImage = require('../../img/control.png');

export default class EpisodeView extends React.Component {
  static navigationOptions = {
    title: 'Episode',
  };

  state = {
    loading: true,
    imageSource: '',
    episodeId: '',
    title: '',
    description: '',
    category: '',
    index: '',
    video: '',
    exercises: [],
    exerciseIdlist: [],
    exerciseLengthList: [],
    offline: false,
  }

  componentDidMount= async () => {
    const { offline, title } = this.props.navigation.state.params;
    this.setState({ offline });
    if (offline) {
      console.log('OFF');
      this.getOfflineDatas(title);
    } else {
      const {
        episodeId,
        category,
        index,
        exercises,
        description,
        video,
      } = this.props.navigation.state.params;
      this.setState({
        episodeId, title, category, description, index, exercises, video, loading: false,
      });
      this.setImage(category);
    }
    console.log('EV CDM');
    try {
      await AsyncStorage.removeItem('distance');
    } catch (err) {
      console.log(err);
    }
    // firebase.storage().ref('temp/Home.jpg').getDownloadURL()
    // firebase.storage().ref(`episodes/${episodeId}/${imageUrl}`).getDownloadURL()
    //   .then((url) => {
    //     this.setState({ url });
    //     console.log(url);
    //   });
  }

  getOfflineDatas = (episodeTitle) => {
    console.log('OFFLINEDATAS');
    const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${episodeTitle}"`));
    console.log(episodeDetail);
    // const exerciseList = Array.from(episodeDetail[0].exercises);
    // const exerciseDetail = Array.from(episodeDetail[0].exerciseDetail);
    // const episodeDetail = realm.objects('SavedEpisodes').filtered(`'id = ${episodeTitle}`);;

    const {
      category, description, exerciseIdList, id, title, exerciseLengthList,
    } = episodeDetail[0];
    const exercises = exerciseIdList.map((value, i) => {
      return Array.from(realm.objects('SavedExercises').filtered(`id="${value}"`));
    });
    console.log(exercises);
    this.setState({
      category, description, episodeId: id, title, exercises, loading: false, exerciseLengthList: Array.from(exerciseLengthList),
    });
    this.setImage(category);
    console.log(episodeDetail);
    // exercises: Array.from(exerciseDetail)
    // console.log(exerciseList);
    // console.log(exerciseDetail);
  }

   setImage = (category) => {
     if (category === 'Speed') {
       return this.setState({ imageSource: speedImage });
     }
     if (category === 'Strength') {
       return this.setState({ imageSource: strengthImage });
     }
     if (category === 'Control') {
       return this.setState({ imageSource: controlImage });
     }
   }

  navigateToEpisodeSingle = (check, mode, navigateTo) => {
    const {
      episodeId,
      title,
      index,
      exercises,
      video,
      exerciseIdlist,
      exerciseLengthList,
      category,
    } = this.state;
    this.props.navigation.navigate(navigateTo, {
      check,
      mode,
      title,
      episodeId,
      index,
      exercises,
      category,
      video,
      exerciseIdlist,
      exerciseLengthList,
    });
  }

  renderListItem = (value) => {
    return (
      <ListItem
        title={value.title}
        titleStyle={{ color: 'white' }}
        containerStyle={{ backgroundColor: '#33425a' }}
        underlayColor="#2a3545"
        onPress={() => {
          this.props.navigation.navigate('ExercisePlayer', {
            // videoUrl: value.videoUrl,
            // videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
            exerciseId: value.uid,
          });
        }}
      />
    );
  }

  renderOfflineExerciseList = () => {
    const { exercises } = this.state;
    const exercisesList = exercises.map((value, i) => {
      const exercise = value[0];
      return (
        <ListItem
          title={exercise.title}
          titleStyle={{ color: 'white' }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            this.props.navigation.navigate('ExercisePlayer', {
              // videoUrl: value.videoUrl,
              // videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
              exerciseId: exercise.title,
              offline: true,
              exerciseTitle: exercise.title,
            });
          }}
        />
      );
    });
    return exercisesList;
  }

  renderExerciseList = () => {
    const { exercises } = this.state;
    const exercisesList = Object.entries(exercises).map(([key, value], i) => (
      <ListItem
        key={key}
        title={value.title}
        titleStyle={{ color: 'white' }}
        containerStyle={{ backgroundColor: '#33425a' }}
        underlayColor="#2a3545"
        onPress={() => {
          this.props.navigation.navigate('ExercisePlayer', {
            // videoUrl: value.videoUrl,
            // videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
            exerciseId: value.uid,
          });
        }}
      />
    ));
    return exercisesList;
  }

  render() {
    if (this.state.loading) return <LoadScreen />;
    const {
      title, description, category, offline, imageSource,
    } = this.state;
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={{ flexDirection: 'row', padding: 15 }}>
          <View style={styles.circularImageView}>
            <Image
              style={{
                height: 120,
                width: 120,
                borderRadius: 120 / 2,
              }}
              source={imageSource}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text h4 style={styles.text}>
              {category}
            </Text>
            <Text style={styles.text}>
              Running Training
            </Text>
            <Text style={styles.text}>
              Workout time: 38:00
            </Text>
            <Text style={styles.text}>
              Total audio time: 40:00
            </Text>
            <Text style={styles.text}>
              Size: 40 MB
            </Text>
          </View>
        </View>
        <View>
          <Text h4 style={styles.text}>
            {`${title}`}
          </Text>
          <Text style={styles.text}>
            {description}
          </Text>
        </View>
        <View style={styles.buttonsViewContainer}>
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: 30 }}
              color="#001331"
              fontSize={18}
              title="Workout"
              onPress={() => {
                if (offline) {
                  return this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'DownloadPlayer');
                }
                this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'EpisodeSingle');
              }}
            />
          </View>
          <View style={{
            width: 1,
            height: 30,
            backgroundColor: '#001331',
          }}
          />
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: 30 }}
              color="#001331"
              fontSize={18}
              title="Listen"
              onPress={() => {
                if (offline) {
                  return this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'DownloadPlayer');
                }
                this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'EpisodeSingle');
              }}
            />
          </View>
        </View>
        <Text style={{ color: 'white', margin: 15 }}>
          EXERCISES IN EPISODE
        </Text>
        <View style={styles.line} />
        <View />
        { offline ? this.renderOfflineExerciseList() : this.renderExerciseList()}
      </ScrollView>
    );
  }
}
