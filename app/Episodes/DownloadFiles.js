import React from 'react';
import {
  View, Alert, Dimensions, Platform, BackHandler,
} from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import realm from '../config/Database';
import ShowModal from '../common/ShowModal';

const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'green',
  borderRadius: 5,
};

let exercisesList = [];
let exerciseLengthList = [];
let exerciseIdList = [];

const styles = {
  mainContaier: {
    flex: 1,
    backgroundColor: '#001331',
    paddingTop: 15,
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
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001331',
    height: 50,
    width: '100%',
  },
  textTitle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'gray',
  },
  innerView: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
};

export default class DownloadFiles extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      // title: navigation.getParam('mode', ''),
      header: null,
    };
  };

  state = {
    loading: false,
    progressPercentage: 0,
    showModal: false,
    modalText: '',
    downloadTitle: '',
    received: 0,
    totalSize: 0,
  }

  componentDidMount() {
    const {
      exercises,
    } = this.props.navigation.state.params;
    if (exercises === undefined) {
      return;
    }
    exercises.map((value, i) => {
      const {
        length, uid, visible, episodeExerciseTitle,
      } = value;
      firebase.database().ref(`exercises/${uid}`).on('value', (snapShot) => {
        const exercise = { ...snapShot.val(), id: uid, visible, episodeExerciseTitle };
        exerciseLengthList.push(length);
        exerciseIdList.push(uid);
        exercisesList.push(exercise);
      });
    });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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
      seriesIndex,
      startWT,
      endWT,
    } = this.props.navigation.state.params;
    const totalVideoSize = (parseInt(videoSize, 10) * (1024 * 1024));
    this.setState({ downloadTitle: episodeTitle });
    const { dirs } = RNFetchBlob.fs;
    const formattedFileName = episodeTitle.replace(/ /g, '_');
    RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
      .then((exist) => {
        if (exist) {
          return this.setState({ loading: false, showModal: true, modalText: 'Episode already downloaded' });
        }
        RNFetchBlob
          .config({
            path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`, // file saved in this path
          })
          .fetch('GET', `${video}`, {
          }).progress({ count: 10 }, (received, total) => {
            this.setState({ progressPercentage: ((received / totalVideoSize) * 100) });
          })
          .then((res) => {
            this.setState({ downloadTitle: 'Downloading exercises' });
            realm.write(() => {
              realm.create('SavedEpisodes', {
                id: episodeId,
                title: episodeTitle,
                category,
                description,
                exerciseLengthList,
                exerciseIdList,
                totalTime,
                video,
                workoutTime,
                videoSize,
                episodeIndex,
                seriesIndex,
                startWT,
                endWT,
              });
            });
            if (exercisesList.length === 0) {
              this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
              return this.props.navigation.navigate('EpisodeList', { downloaded: true });
            }
            exercisesList.map((exercise, i) => {
              const {
                cmsTitle, title, image, advanced, id, visible, episodeExerciseTitle,
              } = exercise;
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
                              this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
                              return this.props.navigation.navigate('EpisodeList', { downloaded: true });
                            }
                          })
                          .catch(error => console.log(error));
                      })
                      .catch(error => console.log(error));
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
                                    this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
                                    return this.props.navigation.navigate('EpisodeList', { downloaded: true });
                                  }
                                })
                                .catch(error => console.log(error));
                            })
                            .catch(error => console.log(error));
                        })
                        .catch(error => console.log(error));
                    })
                    .catch(error => console.log(error));
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
          })
          .catch(error => console.log(error));
      }).catch(() => this.setState({ loading: false }));
  }


  // download = () => {
  //   const {
  //     episodeTitle,
  //     episodeId,
  //     category,
  //     description,
  //     video,
  //     totalTime,
  //     workoutTime,
  //     videoSize,
  //     episodeIndex,
  //     seriesIndex,
  //     startWT,
  //     endWT,
  //   } = this.props.navigation.state.params;
  //   // const totalVideoSize = (parseInt(videoSize, 10) * (1024 * 1024));
  //   this.setState({ downloadTitle: episodeTitle });
  //   const { dirs } = RNFetchBlob.fs;
  //   const formattedFileName = episodeTitle.replace(/ /g, '_');
  //   RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
  //     .then((exist) => {
  //       if (exist) {
  //         return this.setState({ loading: false, showModal: true, modalText: 'Episode already downloaded' });
  //       }
  //       RNFetchBlob
  //         .config({
  //           path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`, // file saved in this path
  //         })
  //         .fetch('GET', `${video}`, {
  //         }).progress({ count: 10 }, (received, total) => {
  //           const receivedInt = parseInt(this.state.received, 10) + received;
  //           const totalInt = parseInt(this.state.totalSize, 10) + total;
  //           this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //           // this.setState(prevState => ({ received: parseInt(prevState.received, 10) + parseInt(received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //         })
  //         .then((res) => {
  //           this.setState({ downloadTitle: 'Downloading exercises' });
  //           realm.write(() => {
  //             realm.create('SavedEpisodes', {
  //               id: episodeId,
  //               title: episodeTitle,
  //               category,
  //               description,
  //               exerciseLengthList,
  //               exerciseIdList,
  //               totalTime,
  //               video,
  //               workoutTime,
  //               videoSize,
  //               episodeIndex,
  //               seriesIndex,
  //               startWT,
  //               endWT,
  //             });
  //           });
  //         })
  //         .catch(error => console.log(error));
  //       if (exercisesList.length === 0) {
  //         return console.log('HEY');
  //         // this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
  //         // return this.props.navigation.navigate('EpisodeList', { downloaded: true });
  //       }
  //       exercisesList.map((exercise, i) => {
  //         const {
  //           cmsTitle, title, image, advanced, id, visible, episodeExerciseTitle,
  //         } = exercise;
  //         const formattedExerciseName = cmsTitle.replace(/\s+/g, '');
  //         RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`)
  //           .then((alreadyExist) => {
  //             realm.write(() => {
  //               realm.create('SavedExercises', {
  //                 id,
  //                 title,
  //                 cmsTitle,
  //                 visible,
  //                 episodeExerciseTitle,
  //                 advanced: advanced === undefined ? false : true,
  //               });
  //             });
  //             if (alreadyExist) {
  //               return;
  //             }
  //             if (exercise.video === '') {
  //               RNFetchBlob
  //                 .config({
  //                   path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
  //                 })
  //                 .fetch('GET', `${image}`, {
  //                 }).progress({ count: 10 }, (received, total) => {
  //                   const receivedInt = parseInt(this.state.received, 10) + received;
  //                   const totalInt = parseInt(this.state.totalSize, 10) + total;
  //                   this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //                   // this.setState(prevState => ({ received: prevState.received + received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //                 });
  //               RNFetchBlob
  //                 .config({
  //                   path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
  //                 })
  //                 .fetch('GET', advanced === undefined ? image : advanced.image, {
  //                 }).progress({ count: 10 }, (received, total) => {
  //                   const receivedInt = parseInt(this.state.received, 10) + received;
  //                   const totalInt = parseInt(this.state.totalSize, 10) + total;
  //                   this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //                   // this.setState(prevState => ({ received: prevState.received + received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //                 });
  //               // if (i === (exercisesList.length - 1)) {
  //               //   this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
  //               //   // return this.props.navigation.navigate('EpisodeList', { downloaded: true });
  //               // }
  //               return;
  //             }
  //             RNFetchBlob
  //               .config({
  //                 path: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
  //               })
  //               .fetch('GET', `${exercise.video}`, {
  //               }).progress({ count: 10 }, (received, total) => {
  //                 const receivedInt = parseInt(this.state.received, 10) + received;
  //                 const totalInt = parseInt(this.state.totalSize, 10) + total;
  //                 this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //                 // this.setState(prevState => ({ received: prevState.received + received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //               });
  //             RNFetchBlob
  //               .config({
  //                 path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
  //               })
  //               .fetch('GET', `${image}`, {
  //               }).progress({ count: 10 }, (received, total) => {
  //                 const receivedInt = parseInt(this.state.received, 10) + received;
  //                 const totalInt = parseInt(this.state.totalSize, 10) + total;
  //                 this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //                 // this.setState(prevState => ({ received: prevState.received + received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //               });
  //             RNFetchBlob
  //               .config({
  //                 path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
  //               })
  //               .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
  //               }).progress({ count: 10 }, (received, total) => {
  //                 const receivedInt = parseInt(this.state.received, 10) + received;
  //                 const totalInt = parseInt(this.state.totalSize, 10) + total;
  //                 this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //                 // this.setState(prevState => ({ received: prevState.received + received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //               });
  //             RNFetchBlob
  //               .config({
  //                 path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
  //               })
  //               .fetch('GET', advanced === undefined ? image : advanced.image, {
  //               }).progress({ count: 10 }, (received, total) => {
  //                 const receivedInt = parseInt(this.state.received, 10) + received;
  //                 const totalInt = parseInt(this.state.totalSize, 10) + total;
  //                 this.setState({ received: receivedInt, totalSize: totalInt, progressPercentage: ((receivedInt / totalInt) * 100) });
  //                 // this.setState(prevState => ({ received: prevState.received + received, totalSize: prevState.totalSize + total, progressPercentage: ((prevState.received / prevState.totalSize) * 100) }));
  //               });
  //             // if (i === (exercisesList.length - 1)) {
  //             //   this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
  //             //   // return this.props.navigation.navigate('EpisodeList', { downloaded: true });
  //             // }
  //           }).catch(() => this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' }));
  //       });
  //     }).catch(() => this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' }));
  // }

  navigateToHome = () => {
    const { loading } = this.state;
    if (loading) {
      this.setState({ showModal: true, modalText: 'Please stay on this page until download completes' });
    } else {
      this.props.navigation.navigate('EpisodeList');
    }
  }

  handleBackButton = () => {
    this.navigateToHome();
    return true;
  }

  render() {
    const { progressPercentage, showModal, modalText, downloadTitle } = this.state;
    const platform = Platform.OS;
    return (
      <View style={styles.mainContaier}>
        <View style={styles.headerView}>
          <Icon
            iconStyle={{ marginLeft: platform === 'android' ? 15 : 0 }}
            name={platform === 'android' ? 'arrow-left' : 'chevron-left'}
            type={platform === 'android' ? 'material-community' : 'feather'}
            size={platform === 'android' ? 25 : 38}
            color="white"
            underlayColor="#001331"
            onPress={() => this.navigateToHome()}
          />
        </View>
        <View style={styles.line} />
        <ShowModal
          visible={showModal}
          title={modalText}
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <View style={styles.innerView}>
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
              <Text style={[styles.text, { fontSize: 12 }]}>
                {downloadTitle}
              </Text>
              <ProgressBarAnimated
                width={barWidth}
                {...progressCustomStyles}
                value={progressPercentage}
                barAnimationDuration={100}
              />
              <Loading />
            </View>
          ) : null
          }
        </View>
      </View>
    );
  }
}
