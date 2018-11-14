import React from 'react';
import { View, Alert, Dimensions } from 'react-native';
import { Button, Text } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import realm from '../config/Database';

const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'green',
  borderRadius: 5,
  backgroundColorOnComplete: 'red',
};

let exercisesList = [];
let exerciseLengthList = [];
let exerciseIdList = [];

const styles = {
  mainContaier: {
    flex: 1,
    backgroundColor: '#001331',
    justifyContent: 'center',
    padding: 15,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#33425a',
    padding: 10,
  },
};

export default class DownloadFiles extends React.Component {
  state = {
    loading: false,
    progressPercentage: 0,
    downloaded: 0,
  }

  componentDidMount() {
    const {
      exercises,
    } = this.props.navigation.state.params;
    exercises.map((value, i) => {
      const { length, uid, visible, episodeExerciseTitle } = value;
      firebase.database().ref(`exercises/${uid}`).on('value', (snapShot) => {
        const exercise = { ...snapShot.val(), id: uid, visible, episodeExerciseTitle };
        exerciseLengthList.push(length);
        exerciseIdList.push(uid);
        exercisesList.push(exercise);
      });
    });
  }

  componentWillUnmount() {
    exerciseLengthList = [];
    exercisesList = [];
    exerciseIdList = [];
  }

  download = () => {
    const {
      episodeTitle,
      episodeId,
      category,
      description,
      video,
      totalTime,
      workoutTime,
      videoSize,
      episodeIndex,
    } = this.props.navigation.state.params;
    const { dirs } = RNFetchBlob.fs;
    console.log(episodeTitle);
    console.log(video);
    const formattedFileName = episodeTitle.replace(/ /g, '_');
    console.log(formattedFileName);
    RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
      .then((exist) => {
        if (exist) {
          this.setState({ loading: false });
          return Alert.alert('Episode already downloaded');
        }
        RNFetchBlob
          .config({
            path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`, // file saved in this path
          })
          .fetch('GET', `${video}`, {
          }).progress({ count: 10 }, (received, total) => {
            // const downloaded = `${received / 1024}/${total / 1024}`;
            this.setState({ progressPercentage: ((received / total) * 100) });
          })
          .then((res) => {
            realm.write(() => {
              realm.create('SavedEpisodes', {
                id: episodeId,
                title: episodeTitle,
                category,
                description,
                exerciseLengthList,
                exerciseIdList,
                totalTime,
                workoutTime,
                videoSize,
                episodeIndex,
              });
            });
            exercisesList.map((exercise, i) => {
              const { cmsTitle, title, image, advanced, id, visible, episodeExerciseTitle } = exercise;
              console.log(cmsTitle);
              const formattedExerciseName = cmsTitle.replace(/\s+/g, '');
              RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`)
                .then((alreadyExist) => {
                  realm.write(() => {
                    realm.create('SavedExercises', {
                      id,
                      title,
                      cmsTitle,
                      visible,
                      episodeExerciseTitle,
                      advanced: advanced === undefined ? false : true,
                    });
                  });
                  if (alreadyExist) {
                    return;
                  }
                  if (exercise.video === '') {
                    RNFetchBlob
                      .config({
                        path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
                      })
                      .fetch('GET', `${image}`, {
                      }).then(() => {
                        RNFetchBlob
                          .config({
                            path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
                          })
                          .fetch('GET', advanced === undefined ? image : advanced.image, {
                          }).then(() => {
                            if (i === (exercisesList.length - 1)) {
                              this.setState({ loading: false });
                              Alert.alert('Download Complete');
                              return this.props.navigation.navigate('EpisodeList', { downloaded: true });
                            }
                          }).catch(error => console.log(error));
                      }).catch(error => console.log(error));
                    return;
                  }
                  RNFetchBlob
                    .config({
                      path: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
                    })
                    .fetch('GET', `${exercise.video}`, {
                    }).then(() => {
                      RNFetchBlob
                        .config({
                          path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
                        })
                        .fetch('GET', `${image}`, {
                        }).then(() => {
                          RNFetchBlob
                            .config({
                              path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
                            })
                            .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
                            }).then(() => {
                              RNFetchBlob
                                .config({
                                  path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
                                })
                                .fetch('GET', advanced === undefined ? image : advanced.image, {
                                }).then(() => {
                                  if (i === (exercisesList.length - 1)) {
                                    this.setState({ loading: false });
                                    Alert.alert('Download Complete');
                                    return this.props.navigation.navigate('EpisodeList', { downloaded: true });
                                  }
                                }).catch(error => console.log(error));
                            }).catch(error => console.log(error));
                        }).catch(error => console.log(error));
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
          }).catch(error => console.log(error));
      }).catch(() => this.setState({ loading: false }));
  }

  render() {
    const { progressPercentage, downloaded } = this.state;
    return (
      <View style={styles.mainContaier}>
        <Text style={styles.text}>
          {`Download ${this.props.navigation.state.params.episodeTitle}?` }
        </Text>
        <Button
          title="Download"
          buttonStyle={styles.button}
          onPress={() => {
            this.setState({ loading: true });
            this.download();
          }}
        />
        { this.state.loading ? (
          <View style={{ marginTop: 10 }}>
            <ProgressBarAnimated
              width={barWidth}
              {...progressCustomStyles}
              value={progressPercentage}
              barAnimationDuration={500}
            />
            <Loading />
          </View>
        ) : null
        }
      </View>
    );
  }
}
