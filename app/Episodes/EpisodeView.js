import React from 'react';
import {
  ScrollView, View, Image, AsyncStorage,
} from 'react-native';
import {
  ListItem, Button, Text, Icon,
} from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
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
    marginTop: moderateScale(15),
  },
  circularImageView: {
    height: moderateScale(120),
    width: moderateScale(120),
    borderRadius: moderateScale(120 / 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    marginLeft: moderateScale(15),
    marginRight: moderateScale(15),
    fontSize: moderateScale(12),
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
    height: moderateScale(1),
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
    email: '',
    seriesId: '',
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
    showInternetModal: false,
    mode: false,
    isConnected: false,
    requestEmailTrigger: false,
    episodeOneNotCompletedEmailTrigger: false,
    seriesBought: false,
  }

  componentDidMount= async () => {
    const { netInfo } = this.props.screenProps;
    let requestEmailTrigger = false;
    let episodeOneNotCompletedEmailTrigger = false;
    const {
      offline,
      episodeList,
      title,
      episodeId,
      seriesId,
      category,
      episodeIndex,
      seriesIndex,
      exercises,
      completeExercises,
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
      userDatas,
      seriesBought,
    } = this.props.navigation.state.params;
    console.log(deviceId, episodeId, offline, episodeIndex, userDatas);
    // if (offline && episodeList && !netInfo) {
    //   this.getOfflineDatas(title, deviceId, offline, purchased, counter);
    // } else if (offline && !episodeList && netInfo) {
    //   this.getOfflineDatas(title, deviceId, offline, purchased, counter);
    // } else if (offline && !episodeList && !netInfo) {
    //   this.getOfflineDatas(title, deviceId, offline, purchased, counter);
    // }
    if (offline) {
      this.getOfflineDatas(title, deviceId, offline, purchased, counter, episodeList, netInfo, seriesBought, userDatas);
    } else {
      const { uid, email } = this.props.screenProps.user;
      let freeTrials;
      if (counter === 0) {
        freeTrials = 'two';
      }
      if (counter === 1) {
        freeTrials = 'one';
      }
      if (userDatas !== null) {
        const {
          epOneCompleted, epOneNotCompleted, epTwoCompleted, epThreeCompleted, epTenCompleted,
        } = userDatas;
        const { emailTrigger, episodeNotCompleted } = this.getEmailTriggerData(userDatas, episodeIndex);
        requestEmailTrigger = emailTrigger;
        episodeOneNotCompletedEmailTrigger = episodeNotCompleted;
        this.setEmailData(epOneCompleted, epOneNotCompleted, epTwoCompleted, epThreeCompleted, epTenCompleted);
      } else {
        this.setEmailData();
      }
      // firebase.database().ref('exercises').on('value', (snapshot) => {
      this.setState({
        episodeId,
        seriesId,
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
        uid,
        email,
        completeExercises,
        loading: false,
        episodeList,
        isConnected: netInfo,
        requestEmailTrigger,
        episodeOneNotCompletedEmailTrigger,
        seriesBought,
      });
      // });
      this.setImage(category);
    }
  }

  setEmailData = async (epOneCompleted, epOneNotCompleted, epTwoCompleted, epThreeCompleted, epTenCompleted) => {
    await AsyncStorage.setItem('emailTrigger', JSON.stringify({
      epOneCompleted: epOneCompleted === undefined ? false : epOneCompleted.emailSent,
      epOneNotCompleted: epOneNotCompleted === undefined ? false : epOneNotCompleted.emailSent,
      epTwoCompleted: epTwoCompleted === undefined ? false : epTwoCompleted.emailSent,
      epThreeCompleted: epThreeCompleted === undefined ? false : epThreeCompleted.emailSent,
      epTenCompleted: epTenCompleted === undefined ? false : epTenCompleted.emailSent,
    }));
  }

  getEmailTriggerData = (userDatas, episodeIndex) => {
    let requestEmailTrigger = false;
    let episodeOneNotCompletedEmailTrigger = false;
    const {
      epOneCompleted, epOneNotCompleted, epTwoCompleted, epThreeCompleted, epTenCompleted,
    } = userDatas;
    if (episodeIndex === 0) {
      if (epOneCompleted !== undefined) {
        requestEmailTrigger = true;
      }
      if (epOneNotCompleted !== undefined) {
        episodeOneNotCompletedEmailTrigger = true;
      }
    } else if (episodeIndex === 1) {
      if (epTwoCompleted !== undefined) {
        requestEmailTrigger = true;
      }
    } else if (episodeIndex === 2) {
      if (epThreeCompleted !== undefined) {
        requestEmailTrigger = true;
      }
    } else if (episodeIndex === 9) {
      if (epTenCompleted !== undefined) {
        requestEmailTrigger = true;
      }
    }
    return ({
      emailTrigger: requestEmailTrigger,
      episodeNotCompleted: episodeOneNotCompletedEmailTrigger,
    });
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

  getOfflineDatas = async (episodeTitle, deviceId, offline, purchased, counter, episodeList, netInfo, seriesBought, userDatas) => {
    console.log(offline, episodeList, netInfo);
    let requestEmailTrigger = false;
    let episodeOneNotCompletedEmailTrigger = false;
    const offlineData = await AsyncStorage.getItem('series');
    const jsonObjectData = JSON.parse(offlineData);
    const { uid, email } = jsonObjectData;
    const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${episodeTitle}"`));
    const {
      category,
      description,
      exerciseIdList,
      seriesId,
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
    if ((offline && !episodeList) || !netInfo) {
      console.log('TEST 1');
      // const offlineEmailData = await AsyncStorage.getItem('emailTrigger');
      // if (offlineEmailData !== null) {
      //   const jsonObjectEmailData = JSON.parse(offlineEmailData);
      //   const {
      //     epOneCompleted,
      //     epOneNotCompleted,
      //     epTwoCompleted,
      //     epThreeCompleted,
      //     epTenCompleted,
      //   } = jsonObjectEmailData;
      //   if (episodeIndex === 10) {
      //     requestEmailTrigger = epOneCompleted === '1' ? true : epOneCompleted;
      //     episodeOneNotCompletedEmailTrigger = epOneNotCompleted === '1' ? true : epOneNotCompleted;
      //   } else if (episodeIndex === 11) {
      //     requestEmailTrigger = epTwoCompleted === '1' ? true : epTwoCompleted;
      //   } else if (episodeIndex === 2) {
      //     requestEmailTrigger = epThreeCompleted === '1' ? true : epThreeCompleted;
      //   } else if (episodeIndex === 9) {
      //     requestEmailTrigger = epTenCompleted === '1' ? true : epTenCompleted;
      //   }
      // }
    } else if (userDatas !== null) {
      console.log(userDatas);
      const {
        epOneCompleted, epOneNotCompleted, epTwoCompleted, epThreeCompleted, epTenCompleted,
      } = userDatas;
      const { emailTrigger, episodeNotCompleted } = this.getEmailTriggerData(userDatas, episodeIndex);
      requestEmailTrigger = emailTrigger;
      episodeOneNotCompletedEmailTrigger = episodeNotCompleted;
      this.setEmailData(epOneCompleted, epOneNotCompleted, epTwoCompleted, epThreeCompleted, epTenCompleted);
    } else {
      console.log('TEST 3');
      this.setEmailData();
    }
    const exercises = exerciseIdList.map((value, i) => {
      return Array.from(realm.objects('SavedExercises').filtered(`id="${value}" AND index="${i}"`));
    });
    this.setState({
      category,
      description,
      episodeId: id,
      seriesId,
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
      email,
      video,
      deviceId,
      purchased,
      episodeList,
      offline,
      counter,
      exerciseLengthList: Array.from(exerciseLengthList),
      loading: false,
      isConnected: netInfo,
      seriesBought,
      requestEmailTrigger,
      episodeOneNotCompletedEmailTrigger,
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
     const { logId, uid, episodeId } = this.props.navigation.state.params;
     firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).remove();
   }

  navigateToEpisodeSingle = (check, mode, navigateTo) => {
    const {
      episodeId,
      seriesId,
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
      email,
      deviceId,
      counter,
      purchased,
      offline,
      requestEmailTrigger,
      episodeOneNotCompletedEmailTrigger,
      seriesBought,
    } = this.state;
    // console.log(exercises);
    this.props.navigation.navigate(navigateTo, {
      check,
      mode,
      title,
      episodeId,
      seriesId,
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
      email,
      counter,
      completeExercises,
      deviceId,
      purchased,
      offline,
      requestEmailTrigger,
      episodeOneNotCompletedEmailTrigger,
      seriesBought,
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
      const { title, visible, cmsTitle, advanced, index } = exercise;
      if (!visible) {
        return console.log('');
      }
      return (
        <ListItem
          title={title}
          titleStyle={{ color: advance && !advanced ? 'gray' : 'white', fontSize: moderateScale(16) }}
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
    const { netInfo } = this.props.screenProps;
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
          titleStyle={{ color: advance && advanced === undefined ? 'gray' : 'white', fontSize: moderateScale(16) }}
          containerStyle={{ backgroundColor: advance && advanced === undefined ? '#2a3545' : '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            if (!netInfo) {
              return this.setState({ showInternetModal: true });
            }
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
      title, description, category, offline, imageSource, videoSize, totalTime, workoutTime, episodeIndex, completed, episodeList, loading, exercises, purchased, showModal, showInternetModal, freeTrials, mode, isConnected,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    if (loading) return <LoadScreen />;
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={{ flexDirection: 'row', padding: moderateScale(15) }}>
          <View style={styles.circularImageView}>
            <Image
              style={{
                height: moderateScale(120),
                width: moderateScale(120),
                borderRadius: moderateScale(120 / 2),
              }}
              source={imageSource}
            />
          </View>
          <View style={{ marginLeft: moderateScale(10), marginTop: moderateScale(5) }}>
            <Text style={[styles.text, { fontSize: moderateScale(20), fontWeight: 'bold' }]}>
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
          {/* <View style={{ flex: 1 }}>
            <Icon
              name={offline ? 'trash-2' : 'download'}
              color="white"
              type="feather"
              iconStyle={{ marginLeft: 15 }}
            />
          </View> */}
        </View>
        <View>
          <View style={{ flexDirection: 'row', paddingLeft: moderateScale(15) }}>
            <Icon name={completed ? 'circle-thin' : (completed === undefined ? 'unmute' : 'circle')} type={completed === undefined ? 'octicon' : 'font-awesome'} color={completed ? '#7a6306' : '#f5cb23'} size={moderateScale(20)} />
            <Text style={[styles.text, { fontSize: moderateScale(20), fontWeight: 'bold' }]}>
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
              icon={{ name: 'play-arrow', color: '#001331', size: moderateScale(30) }}
              color="#001331"
              fontSize={moderateScale(18)}
              title="Workout Mode"
              onPress={() => {
                if (purchased) {
                  if (!netInfo && !offline) {
                    return this.setState({ showInternetModal: true });
                  }
                  if ((offline && !episodeList) || !netInfo) {
                  // if (offline) {
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
            width: moderateScale(1),
            height: moderateScale(30),
            backgroundColor: '#001331',
          }}
          />
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: moderateScale(30) }}
              color="#001331"
              fontSize={moderateScale(18)}
              title="Listen Mode"
              onPress={() => {
                if (purchased) {
                  if (!netInfo && !offline) {
                    return this.setState({ showInternetModal: true });
                  }
                  // if (offline) {
                  if ((offline && !episodeList) || !netInfo) {
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
          title={`You have ${freeTrials} free trial ${freeTrials === 'one' ? 'play' : 'plays'} of this episode ${freeTrials === 'one' ? 'left' : ''}`}
          description={`Are you ready to workout?\n\nAfter 10 minutes of listening, this session will count as one of your two free trial plays`}
          buttonText="Play"
          secondButtonText="Cancel"
          askAdvance
          onPress={() => {
            this.setState({ showModal: false });
            if (mode) {
              // if (offline) {
              if (offline && !episodeList) {
                return this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'DownloadTestPlayer');
              }
              this.navigateToEpisodeSingle(true, 'Listen Mode Player', 'EpisodeSingle');
            } else {
              if (offline && !episodeList) {
                return this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'DownloadTestPlayer');
              }
              this.navigateToEpisodeSingle(false, 'Workout Mode Player', 'EpisodeSingle');
            }
          }}
          onSecondButtonPress={() => this.setState({ showModal: false })}
        />
        <ShowModal
          visible={showInternetModal}
          title="Please check your internet connection"
          buttonText="OK"
          onPress={() => {
            this.setState({ showInternetModal: false });
          }}
        />
        {
          (category === 'Speed' || exercises === undefined || exercises.length === 0)
            ? (
              <Text style={[styles.text, { marginTop: moderateScale(15), marginBottom: moderateScale(10) }]}>
                {exercises === undefined ? '' : 'EXERCISES IN EPISODE'}
              </Text>
            )
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
        <View style={styles.line} />
        <View />
        { offline ? this.renderOfflineExerciseList() : this.renderExerciseList()}
      </ScrollView>
    );
  }
}
