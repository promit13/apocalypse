import React from 'react';
import { View, Alert } from 'react-native';
import { Button, Text } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import realm from '../config/Database';

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
    margin: 20,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#33425a',
    padding: 10,
  },
};

export default class DownloadFiles extends React.Component {
  state = {
    loading: false,
  }

  componentDidMount() {
    const {
      exercises,
    } = this.props.navigation.state.params;
    exercises.map((value, i) => {
      firebase.database().ref(`exercises/${value.uid}`).on('value', (snapShot) => {
        const exercise = { ...snapShot.val(), id: value.uid };
        exerciseLengthList.push(value.length);
        exerciseIdList.push(value.uid);
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
    } = this.props.navigation.state.params;
    const { dirs } = RNFetchBlob.fs;
    const formattedFileName = episodeTitle.replace(/ /g, '_');
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
              });
            });
            exercisesList.map((exercise, i) => {
              const formattedExerciseName = exercise.title.replace(/\s+/g, '');
              RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`)
                .then((alreadyExist) => {
                  if (alreadyExist) {
                    realm.write(() => {
                      realm.create('SavedExercises', {
                        id: exercise.id,
                        title: exercise.title,
                        video: 'yes',
                      });
                    });
                    return;
                  }
                  if (exercise.video === '') {
                    RNFetchBlob
                      .config({
                        path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
                      })
                      .fetch('GET', `${exercise.image}`, {
                      }).then(() => {
                        RNFetchBlob
                          .config({
                            path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
                          })
                          .fetch('GET', exercise.advanced === undefined ? exercise.image : exercise.advanced.image, {
                          }).then(() => {
                            realm.write(() => {
                              realm.create('SavedExercises', {
                                id: exercise.id,
                                title: exercise.title,
                                video: 'no',
                              });
                            });
                            if (i === (exercisesList.length - 1)) {
                              this.setState({ loading: false });
                              return Alert.alert('Download Complete');
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
                        .fetch('GET', `${exercise.image}`, {
                        }).then(() => {
                          RNFetchBlob
                            .config({
                              path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
                            })
                            .fetch('GET', exercise.advanced === undefined ? exercise.video : exercise.advanced.video, {
                            }).then(() => {
                              RNFetchBlob
                                .config({
                                  path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
                                })
                                .fetch('GET', exercise.advanced === undefined ? exercise.image : exercise.advanced.image, {
                                }).then(() => {
                                  realm.write(() => {
                                    realm.create('SavedExercises', {
                                      id: exercise.id,
                                      title: exercise.title,
                                      video: 'yes',
                                    });
                                  });
                                  if (i === (exercisesList.length - 1)) {
                                    this.setState({ loading: false });
                                    return Alert.alert('Download Complete');
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
    return (
      <View style={styles.mainContaier}>
        <Text style={styles.text}>
          {`Download ${this.props.navigation.state.params.episodeTitle} ?` }
        </Text>
        <Button
          title="Download"
          buttonStyle={styles.button}
          onPress={() => {
            this.setState({ loading: true });
            this.download();
          }}
        />
        { this.state.loading ? <Loading /> : null }
      </View>
    );
  }
}
