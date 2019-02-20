import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';
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
let episodeTask = 0;
let introExerciseTask = 0;
let introImageTask = 0;
let advanceImageTask = 0;
let advanceExerciseTask = 0;
let episodeExerciseSize;
let iosTask = [];
// let count;

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
  dispatch,
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
  dispatch({
    type: ACTION_DOWNLOAD,
    payload: true,
  });
};

// const downloadExercises = (
//   episodeTitle,
//   episodeId,
//   category,
//   description,
//   video,
//   totalTime,
//   workoutTime,
//   videoSize,
//   episodeIndex,
//   seriesIndex,
//   startWT,
//   endWT,
//   dispatch,
//   exercise,
//   dirs,
//   i,
//   episodeSizeReceived,
//   totalVideoSizeInBytes,
// ) => {
//   const {
//     cmsTitle, image, title, advanced, id, visible, episodeExerciseTitle, exerciseSize, index,
//   } = exercise;
//   console.log('DOWNLOAD EXERCISE', title);
//   const formattedExerciseName = cmsTitle.replace(/\s+/g, '');
//   realm.write(() => {
//     realm.create('SavedExercises', {
//       id,
//       title,
//       cmsTitle,
//       visible,
//       episodeExerciseTitle,
//       index,
//       advanced: advanced === undefined ? false : true,
//     });
//   });
//   if (exercise.video === '') {
//     introImageTask[i] = RNFetchBlob
//       .config({
//         path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
//       })
//       .fetch('GET', `${image}`, {
//       });
//     introImageTask[i].then(() => {
//       advanceImageTask = RNFetchBlob
//         .config({
//           path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
//         })
//         .fetch('GET', advanced === undefined ? image : advanced.image, {
//         });
//       advanceImageTask.then(() => {
//         episodeExerciseSize = i === 0 ? (episodeSizeReceived + exerciseSize) : (episodeExerciseSize + exerciseSize);
//         // count += 1;
//         dispatch({
//           type: ACTION_DOWNLOAD_PROGRESS,
//           payload: (episodeExerciseSize / totalVideoSizeInBytes),
//         });
//         if (i === (exercisesList.length - 1)) {
//           saveEpisodeToDatabase(
//             episodeTitle,
//             episodeId,
//             category,
//             description,
//             video,
//             totalTime,
//             workoutTime,
//             videoSize,
//             episodeIndex,
//             seriesIndex,
//             startWT,
//             endWT,
//             dispatch,
//           );
//         }
//       })
//         .catch(error => console.log(error));
//     })
//       .catch(error => console.log(error));
//     return;
//   }
//   introImageTask[i] = RNFetchBlob
//     .config({
//       path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
//     })
//     .fetch('GET', `${image}`, {
//     });
//   introImageTask[i].then(() => {
//     introExerciseTask = RNFetchBlob
//       .config({
//         path: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
//       })
//       .fetch('GET', `${exercise.video}`, {
//       });
//     introExerciseTask.then(() => {
//       advanceExerciseTask = RNFetchBlob
//         .config({
//           path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
//         })
//         .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
//         });
//       advanceExerciseTask.then(() => {
//         advanceImageTask = RNFetchBlob
//           .config({
//             path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
//           })
//           .fetch('GET', advanced === undefined ? image : advanced.image, {
//           });
//         advanceImageTask.then(() => {
//           episodeExerciseSize += exerciseSize;
//           // count += 1;
//           dispatch({
//             type: ACTION_DOWNLOAD_PROGRESS,
//             payload: (episodeExerciseSize / totalVideoSizeInBytes),
//           });
//           if (i === (exercisesList.length - 1)) {
//             saveEpisodeToDatabase(
//               episodeTitle,
//               episodeId,
//               category,
//               description,
//               video,
//               totalTime,
//               workoutTime,
//               videoSize,
//               episodeIndex,
//               seriesIndex,
//               startWT,
//               endWT,
//               dispatch,
//             );
//           }
//         })
//           .catch(error => console.log(error));
//       })
//         .catch(error => console.log(error));
//     })
//       .catch(error => console.log(error));
//   })
//     .catch(error => console.log(error));
// };

const downloadExercises = async (
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
  listExercises,
  dirs,
  i,
  episodeSizeReceived,
  totalVideoSizeInBytes,
) => {
  if (i >= exercisesList.length) {
    return;
  }
  const exercise = listExercises[i];
  const {
    cmsTitle, image, title, advanced, id, visible, episodeExerciseTitle, exerciseSize, index,
  } = listExercises[i];
  console.log(title);
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
    introImageTask = RNFetchBlob
      .config({
        IOSBackgroundTask: true, // required for both upload
        IOSDownloadTask: true,
        path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
      })
      .fetch('GET', `${image}`, {
      });
    introImageTask.then(() => {
      advanceImageTask = RNFetchBlob
        .config({
          IOSBackgroundTask: true, // required for both upload
          IOSDownloadTask: true,
          path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
        })
        .fetch('GET', advanced === undefined ? image : advanced.image, {
        });
      advanceImageTask.then(() => {
        episodeExerciseSize = i === 0 ? (episodeSizeReceived + exerciseSize) : (episodeExerciseSize + exerciseSize);
        // count += 1;
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
          return;
        }
        downloadExercises(episodeTitle,
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
          exercisesList,
          dirs,
          i + 1,
          episodeSizeReceived,
          totalVideoSizeInBytes);
      })
        .catch(error => console.log(error));
    })
      .catch(error => console.log(error));
    return;
  }
  introImageTask = RNFetchBlob
    .config({
      IOSBackgroundTask: true, // required for both upload
      IOSDownloadTask: true,
      path: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
    })
    .fetch('GET', `${image}`, {
    });
  introImageTask.then(() => {
    introExerciseTask = RNFetchBlob
      .config({
        IOSBackgroundTask: true, // required for both upload
        IOSDownloadTask: true,
        path: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
      })
      .fetch('GET', `${exercise.video}`, {
      });
    introExerciseTask.then(() => {
      advanceExerciseTask = RNFetchBlob
        .config({
          IOSBackgroundTask: true, // required for both upload
          IOSDownloadTask: true,
          path: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
        })
        .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
        });
      advanceExerciseTask.then(() => {
        advanceImageTask = RNFetchBlob
          .config({
            IOSBackgroundTask: true, // required for both upload
            IOSDownloadTask: true,
            path: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
          })
          .fetch('GET', advanced === undefined ? image : advanced.image, {
          });
        advanceImageTask.then(() => {
          episodeExerciseSize += exerciseSize;
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
            return;
          }
          downloadExercises(episodeTitle,
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
            exercisesList,
            dirs,
            i + 1,
            episodeSizeReceived,
            totalVideoSizeInBytes);
        })
          .catch(error => console.log(error));
      })
        .catch(error => console.log(error));
    })
      .catch(error => console.log(error));
  })
    .catch(error => console.log(error));
};

const startDownload = async (
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
  let episodeSizeReceived = 0;
  episodeExerciseSize = 0;
  const totalVideoSizeInBytes = (videoSize * 1000 * 1000);
  dispatch({
    type: ACTION_DOWNLOAD,
    payload: undefined,
  });
  const { dirs } = RNFetchBlob.fs;
  const formattedFileName = episodeTitle.replace(/ /g, '_');
  task = RNFetchBlob
    .config({
      IOSBackgroundTask: true, // required for both upload
      IOSDownloadTask: true,
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
    // exercisesList.map(async (exercise, i) => {
    //   await downloadExercises(
    // episodeTitle,
    // episodeId,
    // category,
    // description,
    // video,
    // totalTime,
    // workoutTime,
    // videoSize,
    // episodeIndex,
    // seriesIndex,
    // startWT,
    // endWT,
    // dispatch,
    // exercise,
    // dirs,
    // i,
    // episodeSizeReceived,
    // totalVideoSizeInBytes,
    //   );
    // });

    downloadExercises(episodeTitle,
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
      exercisesList,
      dirs,
      0,
      episodeSizeReceived,
      totalVideoSizeInBytes);
  })
    .catch(error => console.log(error));
};


const downloadIOSExercises = async (
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
  listExercises,
  dirs,
  i,
  episodeSizeReceived,
  totalVideoSizeInBytes,
) => {
  if (i >= exercisesList.length) {
    return;
  }
  const exercise = listExercises[i];
  const {
    cmsTitle, image, title, advanced, id, visible, episodeExerciseTitle, exerciseSize, index,
  } = listExercises[i];
  console.log(title);
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
    await RNFS.downloadFile({
      fromUrl: `${image}`,
      toFile: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
      background: true,
      begin: (job) => {
        iosTask.push(job.jobId);
        // introImageTask = job.jobId;
        console.log(job.jobId);
      },
    }).promise.then((response) => {
      RNFS.downloadFile({
        fromUrl: `${image}`,
        toFile: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
        background: true,
        begin: (job) => {
          iosTask.push(job.jobId);
          // advanceImageTask = job.jobId;
          console.log(job.jobId);
        },
      }).promise.then((res) => {
        episodeExerciseSize = i === 0 ? (episodeSizeReceived + exerciseSize) : (episodeExerciseSize + exerciseSize);
        // count += 1;
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
          return;
        }
        downloadIOSExercises(episodeTitle,
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
          exercisesList,
          dirs,
          i + 1,
          episodeSizeReceived,
          totalVideoSizeInBytes);
      });
    });
    return;
  }
  RNFS.downloadFile({
    fromUrl: `${image}`,
    toFile: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`,
    background: true,
    begin: (job) => {
      iosTask.push(job.jobId);
      // introImageTask = job.jobId;
      console.log(job.jobId);
    },
  }).promise.then((response) => {
    RNFS.downloadFile({
      fromUrl: `${exercise.video}`,
      toFile: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
      background: true,
      begin: (job) => {
        iosTask.push(job.jobId);
        // introExerciseTask = job.jobId;
        console.log(job.jobId);
      },
    }).promise.then((respons) => {
      RNFS.downloadFile({
        fromUrl: advanced === undefined ? exercise.video : advanced.video,
        toFile: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
        background: true,
        begin: (job) => {
          iosTask.push(job.jobId);
          // advanceExerciseTask = job.jobId;
          console.log(job.jobId);
        },
      }).promise.then((respo) => {
        RNFS.downloadFile({
          fromUrl: advanced === undefined ? image : advanced.image,
          toFile: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`,
          background: true,
          begin: (job) => {
            iosTask.push(job.jobId);
            // advanceImageTask = job.jobId;
            console.log(job.jobId);
          },
        }).promise.then((res) => {
          episodeExerciseSize += exerciseSize;
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
            return;
          }
          downloadIOSExercises(
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
            exercisesList,
            dirs,
            i + 1,
            episodeSizeReceived,
            totalVideoSizeInBytes,
          );
        });
      });
    });
  });
};

const startIosDownload = (
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
  let episodeSizeReceived = 0;
  episodeExerciseSize = 0;
  const totalVideoSizeInBytes = (videoSize * 1000 * 1000);
  dispatch({
    type: ACTION_DOWNLOAD,
    payload: undefined,
  });
  const { dirs } = RNFetchBlob.fs;
  const formattedFileName = episodeTitle.replace(/ /g, '_');
  RNFS.downloadFile({
    fromUrl: `${video}`,
    toFile: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`,
    progressDivider: 20,
    background: true,
    begin: (job) => {
      // episodeTask = job.jobId;
      console.log(job.jobId);
      iosTask.push(job.jobId);
    },
    progress: ((response) => {
      const { contentLength, bytesWritten } = response;
      episodeSizeReceived = parseInt(bytesWritten, 10);
      dispatch({
        type: ACTION_DOWNLOAD_PROGRESS,
        payload: (bytesWritten / totalVideoSizeInBytes),
      });
    }),
  }).promise.then((response) => {
    downloadIOSExercises(
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
      exercisesList,
      dirs,
      0,
      episodeSizeReceived,
      totalVideoSizeInBytes,
    );
  });
  // task = RNFetchBlob
  //   .config({
  //     IOSBackgroundTask: true, // required for both upload
  //     IOSDownloadTask: true,
  //     path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`, // file saved in this path
  //   })
  //   .fetch('GET', `${video}`, {
  //   })
  //   .progress({ count: 10 }, (received, total) => {
  //     episodeSizeReceived = parseInt(received, 10);
  //     dispatch({
  //       type: ACTION_DOWNLOAD_PROGRESS,
  //       payload: (received / totalVideoSizeInBytes),
  //     });
  //   });
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
  completeExercises,
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
  console.log(completeExercises);
  exercisesList = [];
  exerciseLengthList = [];
  exerciseIdList = [];
  return async (dispatch) => {
    await exercises.map(async (value, i) => {
      const {
        length, uid, visible, episodeExerciseTitle,
      } = value;
      exerciseLengthList.push(length);
      exerciseIdList.push(uid);

      const getExercise = completeExercises[uid];
      const exercise = {
        ...getExercise, id: uid, visible, episodeExerciseTitle, index: i,
      };
      exercisesList.push(exercise);
    });
    startIosDownload(
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
  };
};

const deleteEpisode = (fileName, dispatch, check) => {
  const { dirs } = RNFetchBlob.fs;
  const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${fileName}"`));
  console.log(fileName);
  console.log(episodeDetail.length);
  if (episodeDetail.length === 0) {
    dispatch({
      type: ACTION_DOWNLOAD_CANCEL,
      payload: true,
    });
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
      if (check) {
        dispatch({
          type: ACTION_DOWNLOAD_CANCEL,
          payload: false,
        });
      }
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
  dispatch({
    type: ACTION_DOWNLOAD_CANCEL,
    payload: undefined,
  });
  if (task !== undefined) {
    task.cancel(err => console.log(err));
  }
  if (introImageTask !== undefined) {
    introImageTask.cancel(err => console.log(err));
  }
  if (introExerciseTask !== undefined) {
    introExerciseTask.cancel(err => console.log(err));
  }
  if (advanceImageTask !== undefined) {
    advanceImageTask.cancel(err => console.log(err));
  }
  if (advanceExerciseTask !== undefined) {
    advanceExerciseTask.cancel(err => console.log(err));
  }
  deleteEpisode(title, dispatch, true);
  // setTimeout(() => {
  //   deleteEpisode(title, dispatch, true);
  //   // dispatch({
  //   //   type: ACTION_DELETE_EPISODE,
  //   //   payload: false,
  //   // });
  // }, 10000);
};

export const stopIOSDownload = title => async (dispatch) => {
  dispatch({
    type: ACTION_DOWNLOAD_CANCEL,
    payload: undefined,
  });
  console.log('STOP DOWNLOAD');
  await iosTask.map((value, index) => {
    console.log(value);
    RNFS.stopDownload(value);
  });
  
  // RNFS.stopDownload(episodeTask);
  // RNFS.stopDownload(introImageTask);
  // RNFS.stopDownload(introExerciseTask);
  // RNFS.stopDownload(advanceExerciseTask);
  // RNFS.stopDownload(advanceImageTask);
  deleteEpisode(title, dispatch, true);
  // setTimeout(() => {
  //   deleteEpisode(title, dispatch, true);
  //   // dispatch({
  //   //   type: ACTION_DELETE_EPISODE,
  //   //   payload: false,
  //   // });
  // }, 10000);
};
