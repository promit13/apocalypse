import RNFetchBlob from 'react-native-fetch-blob';
import { AsyncStorage } from 'react-native';
import firebase from '../config/firebase';
import realm from '../config/Database';
import {
  ACTION_DOWNLOAD,
  ACTION_DOWNLOAD_PROGRESS,
  ACTION_DELETE_EPISODE,
  ACTION_DOWNLOAD_CANCEL,
} from './types';

let exercisesList = [];
let exerciseLengthList = [];
let exerciseIdList = [];
let task;
let introExerciseTask = [];
let introImageTask = [];
let advanceImageTask = [];
let advanceExerciseTask = [];

const saveEpisodeToDatabase = (
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
) => {
  realm.write(() => {
    console.log('SAVED EPISODES');
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
  // dispatch({
  //   type: ACTION_DOWNLOAD,
  //   payload: true,
  // });
};

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
  let episodeExerciseSize = 0;
  let episodeSizeReceived = 0;
  let count = 0;
  const totalVideoSizeInBytes = (videoSize * 1000 * 1000);
  dispatch({
    type: ACTION_DOWNLOAD,
    payload: false,
  });
  const { dirs } = RNFetchBlob.fs;
  const formattedFileName = episodeTitle.replace(/ /g, '_');
  task = RNFetchBlob
    .config({
      path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`, // file saved in this path
    })
    .fetch('GET', `${video}`, {
    })
    .progress({ count: 10 }, (received, total) => {
      episodeSizeReceived = parseInt(received, 10);
      dispatch({
        type: ACTION_DOWNLOAD_PROGRESS,
        payload: (received / totalVideoSizeInBytes),
      });
    });
  task.then(() => {
    if (exercisesList.length === 0) {
      saveEpisodeToDatabase(
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
      return;
    }
    exercisesList.map((exercise, i) => {
      const {
        cmsTitle, image, title, advanced, id, visible, episodeExerciseTitle, exerciseSize, index,
      } = exercise;
      const formattedExerciseName = cmsTitle.replace(/\s+/g, '');
      realm.write(() => {
        realm.create('SavedExercises', {
          id,
          title,
          cmsTitle,
          visible,
          episodeExerciseTitle,
          index,
          advanced: advanced === undefined ? false : true,
        });
      });
      if (exercise.video === '') {
        introImageTask[i] = RNFetchBlob
          .config({
            path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
          })
          .fetch('GET', `${image}`, {
          });
        introImageTask[i].then(() => {
          advanceImageTask = RNFetchBlob
            .config({
              path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
            })
            .fetch('GET', advanced === undefined ? image : advanced.image, {
            });
          advanceImageTask.then(() => {
            episodeExerciseSize = count === 0 ? (episodeSizeReceived + exerciseSize) : (episodeExerciseSize + exerciseSize);
            count += 1;
            dispatch({
              type: ACTION_DOWNLOAD_PROGRESS,
              payload: (episodeExerciseSize / totalVideoSizeInBytes),
            });
            if (i === (exercisesList.length - 1)) {
              saveEpisodeToDatabase(
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
          })
            .catch(error => console.log(error));
        })
          .catch(error => console.log(error));
        return;
      }
      introImageTask[i] = RNFetchBlob
        .config({
          path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
        })
        .fetch('GET', `${image}`, {
        });
      introImageTask[i].then(() => {
        introExerciseTask = RNFetchBlob
          .config({
            path: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
          })
          .fetch('GET', `${exercise.video}`, {
          });
        introExerciseTask.then(() => {
          advanceExerciseTask = RNFetchBlob
            .config({
              path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
            })
            .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
            });
          advanceExerciseTask.then(() => {
            advanceImageTask = RNFetchBlob
              .config({
                path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
              })
              .fetch('GET', advanced === undefined ? image : advanced.image, {
              });
            advanceImageTask.then(() => {
              episodeExerciseSize += exerciseSize;
              count += 1;
              dispatch({
                type: ACTION_DOWNLOAD_PROGRESS,
                payload: (episodeExerciseSize / totalVideoSizeInBytes),
              });
              if (i === (exercisesList.length - 1)) {
                saveEpisodeToDatabase(
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
            })
              .catch(error => console.log(error));
          })
            .catch(error => console.log(error));
        })
          .catch(error => console.log(error));
      })
        .catch(error => console.log(error));
    });
  })
    .catch(error => console.log(error));
};

// .progress({ count: 10 }, (received, total) => {
//   dataReceived = count === 0 ? (episodeSizeReceived + received) : (dataReceived + received);
//   count += 1;
//   dispatch({
//     type: ACTION_DOWNLOAD_PROGRESS,
//     payload: (dataReceived / totalVideoSizeInBytes),
//   });
// })

export const downloadEpisode = ({
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
  advanceImageTask = [];
  introExerciseTask = [];
  advanceExerciseTask = [];
  introImageTask = [];
  exercisesList = [];
  exerciseLengthList = [];
  exerciseIdList = [];
  return async (dispatch) => {
    if (exercises !== undefined) {
      await exercises.map(async (value, i) => {
        const {
          length, uid, visible, episodeExerciseTitle,
        } = value;
        exerciseLengthList.push(length);
        exerciseIdList.push(uid);
        introExerciseTask.push(i);
        introImageTask.push(i);
        advanceImageTask.push(i);
        advanceExerciseTask.push(i);
        await firebase.database().ref(`exercises/${uid}`).on('value', (snapShot) => {
          const exercise = { ...snapShot.val(), id: uid, visible, episodeExerciseTitle, index: i };
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

const deleteEpisode = (fileName, dispatch) => {
  const { dirs } = RNFetchBlob.fs;
  const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${fileName}"`));
  console.log(fileName);
  console.log(episodeDetail.length);
  if (episodeDetail.length === 0) {
    return;
  }
  const exerciseIdLists = Array.from(episodeDetail[0].exerciseIdList);
  const allEpisodes = Array.from(realm.objects('SavedEpisodes'));
  const formattedFileName = fileName.replace(/ /g, '_');

  RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
    .then(async () => {
      await exerciseIdLists.map((value) => {
        let count = 0;
        allEpisodes.map((episodeValue) => {
          const eachExerciseIdList = Array.from(episodeValue.exerciseIdList);
          if (eachExerciseIdList.includes(value)) {
            count += 1;
          }
        });
        if (count < 2) {
          const exerciseDetail = realm.objects('SavedExercises').filtered(`id="${value}"`);
          if ((Array.from(exerciseDetail)).length === 0) {
            return;
          }
          const exerciseTitle = Array.from(exerciseDetail)[0].cmsTitle;
          const formattedExerciseTitle = exerciseTitle.replace(/\s+/g, '');
          RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/episodes/${formattedExerciseTitle}.mp4`)
            .then(() => {
              RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseTitle}.mp4`)
                .then(() => {
                  RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/introExercises/${formattedExerciseTitle}.mp4`)
                    .then(() => {
                      RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/introImages/${formattedExerciseTitle}.png`)
                        .then(() => {
                          RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseTitle}.png`)
                            .then(() => {
                              realm.write(() => {
                                realm.delete(exerciseDetail);
                              });
                            }).catch(error => console.log(error));
                        }).catch(error => console.log(error));
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
        }
      });
      realm.write(() => {
        realm.delete(episodeDetail);
      });
      await AsyncStorage.removeItem(fileName);
      dispatch({
        type: ACTION_DELETE_EPISODE,
        payload: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const deleteEpisodeList = fileName => (dispatch) => {
  dispatch({
    type: ACTION_DELETE_EPISODE,
    payload: false,
  });
  deleteEpisode(fileName, dispatch);
};

export const stopDownload = title => async (dispatch) => {
  task.cancel(err => console.log(err));
  console.log(introExerciseTask.length);
  console.log(introExerciseTask);
  console.log(introImageTask);
  console.log(advanceExerciseTask);
  console.log(advanceImageTask);
  await introImageTask.map((value, i) => {
    console.log(i);
    if (introImageTask[i] !== i && introImageTask[i] !== undefined) {
      console.log(i);
      const intImgTask = introImageTask[i];
      intImgTask.cancel(err => console.log(err));
    }
    if (introExerciseTask[i] !== i && introExerciseTask[i] !== undefined) {
      const intExTask = introExerciseTask[i];
      intExTask.cancel(err => console.log(err));
    }
    if (advanceExerciseTask[i] !== i && advanceExerciseTask[i] !== undefined) {
      const advExTask = advanceExerciseTask[i];
      advExTask.cancel(err => console.log(err));
    }
    if (advanceImageTask[i] !== i && advanceImageTask[i] !== undefined) {
      const advImgTask = advanceImageTask[i];
      advImgTask.cancel(err => console.log(err));
    }
  });
  dispatch({
    type: ACTION_DOWNLOAD_CANCEL,
  });
  setTimeout(() => {
    deleteEpisode(title, dispatch);
  }, 5000);
};
