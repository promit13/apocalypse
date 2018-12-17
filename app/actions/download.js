import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../config/firebase';
import realm from '../config/Database';
import { ACTION_DOWNLOAD } from './types';

const exercisesList = [];
const exerciseLengthList = [];
const exerciseIdList = [];

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
            // this.setState({ loading: false, showModal: true, modalText: 'Episode downloaded successfully' });
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
                  dispatch({
                    type: ACTION_DOWNLOAD,
                    payload: 'Episode already exists',
                  });
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
                            dispatch({
                              type: ACTION_DOWNLOAD,
                              payload: 'Download complete',
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
                                  dispatch({
                                    type: ACTION_DOWNLOAD,
                                    payload: 'Download complete',
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
          }).catch(error => console.log(error));
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
        console.log(episodeExerciseTitle);
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
