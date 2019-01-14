import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../config/firebase';
import realm from '../config/Database';
import { ACTION_DOWNLOAD, ACTION_DOWNLOAD_PROGRESS } from './types';

let exercisesList = [];
let exerciseLengthList = [];
let exerciseIdList = [];
let episodeExerciseSize = 0;
let episodeSizeReceived = 0;
let count = 0;

const startDownload = (
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
  dispatch,
) => {
  const totalVideoSizeInBytes = (videoSize * 1000 * 1000);
  console.log(totalVideoSizeInBytes);
  dispatch({
    type: ACTION_DOWNLOAD,
    payload: false,
  });
  const { dirs } = RNFetchBlob.fs;
  const formattedFileName = episodeTitle.replace(/ /g, '_');
  RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
    .then((exist) => {
      // if (exist) {
      //   console.log('already exists');
      //   return this.setState({ loading: false, showModal: true, modalText: 'Episode already downloaded' });
      // }
      
      RNFetchBlob
        .config({
          path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`, // file saved in this path
        })
        .fetch('GET', `${video}`, {
        })
        .progress({ count: 10 }, (received, total) => {
          console.log(received);
          episodeSizeReceived = parseInt(received, 10);
          dispatch({
            type: ACTION_DOWNLOAD_PROGRESS,
            payload: (received / totalVideoSizeInBytes),
          });
        })
        .then((res) => {
          if (exercisesList.length === 0) {
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
            exercisesList = [];
            exerciseLengthList = [];
            exerciseIdList = [];
            // this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
            dispatch({
              type: ACTION_DOWNLOAD,
              payload: true,
            });
            return;
          }
          exercisesList.map((exercise, i) => {
            const {
              cmsTitle, title, image, advanced, id, visible, episodeExerciseTitle, exerciseSize,
            } = exercise;
            console.log(exerciseSize);
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
                // if (alreadyExist) {
                //   return;
                // }
                if (exercise.video === '') {
                  RNFetchBlob
                    .config({
                      path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
                    })
                    .fetch('GET', `${image}`, {
                    })
                    .then(() => {
                      RNFetchBlob
                        .config({
                          path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
                        })
                        .fetch('GET', advanced === undefined ? image : advanced.image, {
                        })
                        .then(() => {
                          episodeExerciseSize = count === 0 ? (episodeSizeReceived + exerciseSize) : (episodeExerciseSize + exerciseSize);
                          count += 1;
                          dispatch({
                            type: ACTION_DOWNLOAD_PROGRESS,
                            payload: (episodeExerciseSize / totalVideoSizeInBytes),
                          });
                          if (i === (exercisesList.length - 1)) {
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
                            exercisesList = [];
                            exerciseLengthList = [];
                            exerciseIdList = [];
                            episodeExerciseSize = 0;
                            episodeSizeReceived = 0;
                            count = 0;
                            dispatch({
                              type: ACTION_DOWNLOAD,
                              payload: true,
                            });
                            // this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
                            // return this.props.navigation.navigate('EpisodeList', { downloaded: true });
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
                  })
                  .then(() => {
                    RNFetchBlob
                      .config({
                        path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
                      })
                      .fetch('GET', `${image}`, {
                      })
                      .then(() => {
                        RNFetchBlob
                          .config({
                            path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
                          })
                          .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
                          })
                          .then(() => {
                            RNFetchBlob
                              .config({
                                path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
                              })
                              .fetch('GET', advanced === undefined ? image : advanced.image, {
                              })
                              .then(() => {
                                episodeExerciseSize = count === 0 ? (episodeSizeReceived + exerciseSize) : (episodeExerciseSize + exerciseSize);
                                count += 1;
                                dispatch({
                                  type: ACTION_DOWNLOAD_PROGRESS,
                                  payload: (episodeExerciseSize / totalVideoSizeInBytes),
                                });
                                if (i === (exercisesList.length - 1)) {
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
                                  exercisesList = [];
                                  exerciseLengthList = [];
                                  exerciseIdList = [];
                                  episodeExerciseSize = 0;
                                  episodeSizeReceived = 0;
                                  count = 0;
                                  dispatch({
                                    type: ACTION_DOWNLOAD,
                                    payload: true,
                                  });
                                  // this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
                                  // return this.props.navigation.navigate('EpisodeList', { downloaded: true });
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
          });
        })
        .catch(error => console.log(error));
    }).catch(() => {});
};

const downloadEpisode = ({
  exercises,
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
}) => {
  return async (dispatch) => {
    if (exercises !== undefined) {
      await exercises.map((value, i) => {
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
      startDownload(
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
        dispatch,
      );
    } else {
      startDownload(
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
        dispatch,
      );
    }
  };
};
export default downloadEpisode;
