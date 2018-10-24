import React from 'react';
import {
  ScrollView, View, Image,
} from 'react-native';
import {
  ListItem, Button, Text,
} from 'react-native-elements';
import realm from '../config/Database';
import LoadScreen from '../common/LoadScreen';
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
    workoutTime: '',
    totalTime: '',
    videoSize: '',
    episodeIndex: '',
    seriesIndex: '',
    video: '',
    startWT: '',
    completeExercises: '',
    exercises: [],
    exerciseIdlist: [],
    exerciseLengthList: [],
    offline: false,
    introButtonColor: '#f5cb23',
    advancedButtonColor: '#fff',
    advance: false,
  }

  componentDidMount= async () => {
    const { offline, title } = this.props.navigation.state.params;
    this.setState({ offline });
    if (offline) {
      this.getOfflineDatas(title);
    } else {
      const {
        episodeId,
        category,
        episodeIndex,
        seriesIndex,
        exercises,
        description,
        video,
        workoutTime,
        videoSize,
        totalTime,
        startWT,
      } = this.props.navigation.state.params;
      firebase.database().ref('exercises').on('value', (snapshot) => {
        this.setState({
          episodeId,
          title,
          category,
          description,
          episodeIndex,
          seriesIndex,
          exercises,
          video,
          workoutTime,
          videoSize,
          totalTime,
          startWT,
          completeExercises: snapshot.val(),
          loading: false,
        });
      });
      this.setImage(category);
    }
  }

  getOfflineDatas = (episodeTitle) => {
    const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${episodeTitle}"`));
    const {
      category,
      description,
      exerciseIdList,
      id,
      title,
      exerciseLengthList,
      totalTime,
      workoutTime,
      videoSize,
    } = episodeDetail[0];
    const exercises = exerciseIdList.map((value, i) => {
      return Array.from(realm.objects('SavedExercises').filtered(`id="${value}"`));
    });
    this.setState({
      category,
      description,
      episodeId: id,
      title,
      exercises,
      totalTime,
      workoutTime,
      videoSize,
      exerciseLengthList: Array.from(exerciseLengthList),
      loading: false,
    });
    this.setImage(category);
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
      episodeIndex,
      seriesIndex,
      exercises,
      video,
      exerciseIdlist,
      exerciseLengthList,
      category,
      startWT,
      advance,
      completeExercises,
    } = this.state;
    this.props.navigation.navigate(navigateTo, {
      check,
      mode,
      title,
      episodeId,
      episodeIndex,
      seriesIndex,
      exercises,
      startWT,
      category,
      video,
      exerciseIdlist,
      exerciseLengthList,
      advance,
      completeExercises,
    });
  }

  renderOfflineExerciseList = () => {
    const { exercises, advance } = this.state;
    const reducedExercise = exercises.filter((thing, index, self) => self.findIndex(t => t[0].id === thing[0].id) === index);
    const exercisesList = reducedExercise.map((value, i) => {
      const exercise = value[0];
      if (exercise.video === 'no') {
        return console.log('');
      }
      return (
        <ListItem
          title={exercise.title}
          titleStyle={{ color: 'white' }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            this.props.navigation.navigate('TalonIntelPlayer', {
              offline: true,
              exerciseTitle: exercise.title,
              advance,
              exercise: true,
            });
          }}
        />
      );
    });
    return exercisesList;
  }

  renderExerciseList = () => {
    const { exercises, advance, completeExercises } = this.state;
    const reducedExercise = exercises.filter((thing, index, self) => self.findIndex(t => t.uid === thing.uid) === index);
    const exercisesList = Object.entries(reducedExercise).map(([key, value], i) => {
      const { uid } = value;
      const {
        title, advanced, video, image,
      } = completeExercises[uid];
      if (video === '') {
        return console.log('');
      }
      return (
        <ListItem
          key={key}
          title={title}
          titleStyle={{ color: 'white' }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            const videoUrl = advance && advanced !== undefined ? advanced.video : video;
            this.props.navigation.navigate('TalonIntelPlayer', {
              video: videoUrl,
              exerciseTitle: title,
              image,
              exercise: true,
            });
          }}
        />
      );
    });
    return exercisesList;
  }

  render() {
    if (this.state.loading) return <LoadScreen />;
    const {
      title, description, category, offline, imageSource, videoSize, totalTime, workoutTime,
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
              {`Workout time: ${workoutTime}`}
            </Text>
            <Text style={styles.text}>
              {`Total audio time: ${totalTime}`}
            </Text>
            <Text style={styles.text}>
              {`Size: ${videoSize} MB`}
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
        {
          category === 'Speed'
            ? (
              <Text style={[styles.text, { marginTop: 15, marginBottom: 10 }]}>
                EXERCISES IN EPISODE
              </Text>
            )
            : (
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
                    title="Advance"
                    onPress={() => {
                      this.setState({ advance: true, introButtonColor: '#fff', advancedButtonColor: '#f5cb23' });
                    }}
                  />
                </View>
              </View>
            )
        }
        <View style={styles.line} />
        <View />
        { offline ? this.renderOfflineExerciseList() : this.renderExerciseList()}
      </ScrollView>
    );
  }
}
