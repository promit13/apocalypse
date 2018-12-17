import React from 'react';
import {
  ScrollView, View, Image, AsyncStorage,
} from 'react-native';
import {
  ListItem, Button, Text, Icon,
} from 'react-native-elements';
import realm from '../config/Database';
import LoadScreen from '../common/LoadScreen';
import firebase from '../config/firebase';
import ShowModal from '../common/ShowModal';

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
  static navigationOptions = ({ navigation }) => {
    return {
      title: `Episode ${navigation.state.params.episodeIndex + 1}`,
      // header: null,
    };
  };

  state = {
    loading: true,
    deviceId: '',
    imageSource: '',
    episodeId: '',
    title: '',
    description: '',
    category: '',
    workoutTime: '',
    totalTime: '',
    uid: '',
    videoSize: '',
    episodeIndex: '',
    seriesIndex: '',
    video: '',
    startWT: '',
    endWT: '',
    completed: false,
    completeExercises: '',
    exercises: [],
    exerciseIdlist: [],
    exerciseLengthList: [],
    offline: false,
    episodeList: false,
    introButtonColor: '#f5cb23',
    advancedButtonColor: '#fff',
    advance: false,
    purchased: false,
    counter: 0,
    freeTrials: '',
    showModal: false,
    mode: false,
  }

  componentDidMount= async () => {
    const { netInfo } = this.props.screenProps;
    const {
      offline,
      episodeList,
      title,
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
      endWT,
      completed,
      deviceId,
      purchased,
      counter,
    } = this.props.navigation.state.params;
    console.log(deviceId);
    this.setState({ offline });
    if (offline && episodeList && !netInfo) {
      this.getOfflineDatas(title, deviceId, offline, purchased, counter);
    } else if (offline && !episodeList && netInfo) {
      this.getOfflineDatas(title, deviceId, offline, purchased, counter);
    } else if (offline && !episodeList && !netInfo) {
      this.getOfflineDatas(title, deviceId, offline, purchased, counter);
    } else {
      let freeTrials;
      if (counter === 0) {
        freeTrials = 'two';
      }
      if (counter === 1) {
        freeTrials = 'one';
      }
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
          endWT,
          completed,
          deviceId,
          purchased,
          offline,
          counter,
          freeTrials,
          uid: this.props.screenProps.user.uid,
          completeExercises: snapshot.val(),
          loading: false,
          episodeList: true,
        });
      });
      this.setImage(category);
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props.navigation.state.params === undefined) {
  //     return;
  //   }
  //   console.log(this.props.navigation.state.params.trackingStarted);
  //   if (this.props.navigation.state.params.trackingStarted !== prevState.trackingStarted) {
  //     this.deleteEmptyTalonLog();
  //   }
  // }

  getOfflineDatas = async (episodeTitle, deviceId, offline, purchased, counter) => {
    const offlineData = await AsyncStorage.getItem('series');
    const jsonObjectData = JSON.parse(offlineData);
    const { uid } = jsonObjectData;
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
      episodeIndex,
      seriesIndex,
      startWT,
      endWT,
      video,
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
      episodeIndex,
      seriesIndex,
      startWT,
      endWT,
      videoSize,
      uid,
      video,
      deviceId,
      purchased,
      offline,
      counter,
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

   deleteEmptyTalonLog = () => {
     console.log('DELETE');
     const { logId, uid, episodeId } = this.props.navigation.state.params;
     firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).remove();
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
      endWT,
      advance,
      completeExercises,
      workoutTime,
      uid,
      deviceId,
      counter,
      purchased,
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
      endWT,
      category,
      video,
      exerciseIdlist,
      exerciseLengthList,
      advance,
      workoutTime,
      uid,
      counter,
      completeExercises,
      deviceId,
      purchased,
    });
  }

  renderOfflineExerciseList = () => {
    const { exercises, advance } = this.state;
    if (exercises.length === 0) {
      return;
    }
    const reducedExercise = exercises.filter((thing, index, self) => self.findIndex(t => t[0].id === thing[0].id) === index);
    const exercisesList = reducedExercise.map((value, i) => {
      const exercise = value[0];
      const { title, visible, cmsTitle, advanced } = exercise;
      if (!visible) {
        return console.log('');
      }
      return (
        <ListItem
          title={title}
          titleStyle={{ color: advance && !advanced ? 'gray' : 'white' }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            if (advance && !advanced) {
              return;
            }
            this.props.navigation.navigate('TalonIntelPlayer', {
              offline: true,
              exerciseTitle: cmsTitle,
              advance,
              exercise: true,
              mode: 'Exercise Player',
              navigateBack: 'EpisodeView',
            });
          }}
        />
      );
    });
    return exercisesList;
  }

  renderExerciseList = () => {
    const { exercises, advance, completeExercises } = this.state;
    if (exercises === undefined) {
      return;
    }
    const reducedExercise = exercises.filter((thing, index, self) => self.findIndex(t => t.uid === thing.uid) === index);
    const exercisesList = Object.entries(reducedExercise).map(([key, value], i) => {
      const { uid, visible } = value;
      if (!visible) {
        return console.log(visible);
      }
      const {
        title, advanced, video, image,
      } = completeExercises[uid];
      return (
        <ListItem
          key={key}
          title={title}
          titleStyle={{ color: advance && advanced === undefined ? 'gray' : 'white' }}
          containerStyle={{ backgroundColor: advance && advanced === undefined ? '#2a3545' : '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            if (advance && advanced === undefined) {
              return;
            }
            const videoUrl = advance && advanced !== undefined ? advanced.video : video;
            const imageUrl = advance && advanced !== undefined ? advanced.image : image;
            this.props.navigation.navigate('TalonIntelPlayer', {
              video: videoUrl,
              exerciseTitle: title,
              image: imageUrl,
              exercise: true,
              mode: 'Exercise Player',
              navigateBack: 'EpisodeView',
            });
          }}
        />
      );
    });
    return exercisesList;
  }

  render() {
    const {
      title, description, category, offline, imageSource, videoSize, totalTime, workoutTime, episodeIndex, completed, episodeList, loading, exercises, purchased, showModal, freeTrials, mode,
    } = this.state;
    if (loading) return <LoadScreen />;
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
            <Text style={[styles.text, { fontSize: 20, fontWeight: 'bold' }]}>
              {category}
            </Text>
            <Text style={styles.text}>
              {category === 'Speed'
              ? 'Running Training'
              : (
                category === 'Strength'
                ? 'Bodyweight Circuits'
                : 'Stretch & Core'
              )
              }
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
          <View style={{ flexDirection: 'row', paddingLeft: 15 }}>
            <Icon name={completed ? 'circle-thin' : (completed === undefined ? 'unmute' : 'circle')} type={completed === undefined ? 'octicon' : 'font-awesome'} color={completed ? '#7a6306' : '#f5cb23'} size={20} />
            <Text style={[styles.text, { fontSize: 20, fontWeight: 'bold' }]}>
              {`${episodeIndex + 1}. ${title}`}
            </Text>
          </View>
          
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
              title="Workout Mode"
              onPress={() => {
                if (purchased) {
                  // if (offline && !episodeList) {
                  if (offline) {
                    return this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'DownloadTestPlayer');
                  }
                  this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'EpisodeSingle');
                } else {
                  this.setState({ showModal: true });
                }
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
              title="Listen Mode"
              onPress={() => {
                if (purchased) {
                  if (offline) {
                  // if (offline && !episodeList) {
                    return this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'DownloadTestPlayer');
                  }
                  this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'EpisodeSingle');
                } else {
                  this.setState({ showModal: true, mode: true });
                }
              }}
            />
          </View>
        </View>
        <ShowModal
          visible={showModal}
          title={`You have ${freeTrials} free trials plays of this episode`}
          description={`Are you ready to workout?\n\nAfter 1 minute of listening, this session will count as one of your two free trial plays`}
          buttonText="Play"
          secondButtonText="Cancel"
          askAdvance
          onPress={() => {
            this.setState({ showModal: false });
            if (mode) {
              if (offline) {
                // if (offline && !episodeList) {
                return this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'DownloadTestPlayer');
              }
              this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'EpisodeSingle');
            } else {
              if (offline) {
                return this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'DownloadTestPlayer');
              }
              this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'EpisodeSingle');
            }
          }}
          onSecondButtonPress={() => this.setState({ showModal: false })}
        />
        {
          (category === 'Speed' || exercises === undefined || exercises.length === 0)
            ? (
              <Text style={[styles.text, { marginTop: 15, marginBottom: 10 }]}>
                {exercises === undefined ? '' : 'EXERCISES IN EPISODE'}
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
                    title="Advanced"
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
        { offline && !episodeList ? this.renderOfflineExerciseList() : this.renderExerciseList()}
      </ScrollView>
    );
  }
}
