import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';
import { AsyncStorage, Platform } from 'react-native';
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
let introExerciseTask;
let introImageTask;
let advanceImageTask;
let advanceExerciseTask;
let episodeExerciseSize;
// let iosTask = [];
// let count;
let iosTask = 0;

const saveEpisodeToDatabase = async (
  episodeTitle,
  episodeId,
  category,
  description,
  video,
  totalTime,
  workoutTime,
  videoSize,
  episodeIndex,
  seriesKey,
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
      seriesId: seriesKey,
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
  await RNFS.completeHandlerIOS(iosTask);
  iosTask = 0;
};

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
  seriesKey,
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
        path: `${dirs}/AST/introImages/${formattedExerciseName}.png`,
      })
      .fetch('GET', `${image}`, {
      });
    introImageTask.then(() => {
      advanceImageTask = RNFetchBlob
        .config({
          path: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
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
            seriesKey,
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
          seriesKey,
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
      path: `${dirs}/AST/introImages/${formattedExerciseName}.png`,
    })
    .fetch('GET', `${image}`, {
    });
  introImageTask.then(() => {
    introExerciseTask = RNFetchBlob
      .config({
        path: `${dirs}/AST/introExercises/${formattedExerciseName}.mp4`,
      })
      .fetch('GET', `${exercise.video}`, {
      });
    introExerciseTask.then(() => {
      advanceExerciseTask = RNFetchBlob
        .config({
          path: `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`,
        })
        .fetch('GET', advanced === undefined ? exercise.video : advanced.video, {
        });
      advanceExerciseTask.then(() => {
        advanceImageTask = RNFetchBlob
          .config({
            path: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
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
              seriesKey,
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
            seriesKey,
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
  seriesKey,
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
      showInfo: exercise.video === '' ? false : true,
      advanced: advanced === undefined ? false : true,
    });
  });
  if (exercise.video === '') {
    const introImageExists = await RNFS.exists(`${dirs}/AST/introImages/${formattedExerciseName}.png`);
    if (!introImageExists) {
      RNFS.downloadFile({
        fromUrl: image,
        toFile: `${dirs}/AST/introImages/${formattedExerciseName}.png`,
        background: true,
        discretionary: true,
        begin: (job) => {
          iosTask = job.jobId;
          // iosTask.push(job.jobId);
          // introImageTask = job.jobId;
          console.log(job.jobId);
        },
      }).promise.then(async () => {
        const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
        if (!advanceImageExists) {
          RNFS.downloadFile({
            fromUrl: image,
            toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
            background: true,
            discretionary: true,
            begin: (job) => {
              iosTask = job.jobId;
              // iosTask.push(job.jobId);
              // advanceImageTask = job.jobId;
              console.log(job.jobId);
            },
          });
        }
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
            seriesKey,
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
          seriesKey,
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
    } else {
      // iosTask += 1;
      const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
      if (!advanceImageExists) {
        RNFS.downloadFile({
          fromUrl: image,
          toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
          background: true,
          discretionary: true,
          begin: (job) => {
            iosTask = job.jobId;
            // iosTask.push(job.jobId);
            // advanceImageTask = job.jobId;
            console.log(job.jobId);
          },
        });
      }
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
          seriesKey,
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
        seriesKey,
        seriesIndex,
        startWT,
        endWT,
        dispatch,
        exercisesList,
        dirs,
        i + 1,
        episodeSizeReceived,
        totalVideoSizeInBytes);
    }
    return;
  }
  const introImageExists = await RNFS.exists(`${dirs}/AST/introImages/${formattedExerciseName}.png`);
  if (!introImageExists) {
    // await download(dirs, image, `${dirs}/AST/introImages/${formattedExerciseName}.png`);
    RNFS.downloadFile({
      fromUrl: image,
      toFile: `${dirs}/AST/introImages/${formattedExerciseName}.png`,
      background: true,
      discretionary: true,
      begin: (job) => {
        iosTask = job.jobId;
        // iosTask.push(job.jobId);
        // introImageTask = job.jobId;
        console.log(job.jobId);
      },
    }).promise.then(async () => {
      const introExerciseExists = await RNFS.exists(`${dirs}/AST/introExercises/${formattedExerciseName}.mp4`);
      if (!introExerciseExists) {
        // await download(dirs, exercise.video, `${dirs}/AST/introExercises/${formattedExerciseName}.mp4`);
        RNFS.downloadFile({
          fromUrl: exercise.video,
          toFile: `${dirs}/AST/introExercises/${formattedExerciseName}.mp4`,
          background: true,
          discretionary: true,
          begin: (job) => {
            iosTask = job.jobId;
            // iosTask.push(job.jobId);
            // introImageTask = job.jobId;
            console.log(job.jobId);
          },
        }).promise.then(async () => {
          const advanceExerciseExists = await RNFS.exists(`${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
          if (!advanceExerciseExists) {
          // await download(dirs, advanced === undefined ? exercise.video : advanced.video, `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
            RNFS.downloadFile({
              fromUrl: advanced === undefined ? exercise.video : advanced.video,
              toFile: `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`,
              background: true,
              discretionary: true,
              begin: (job) => {
                iosTask = job.jobId;
                // iosTask.push(job.jobId);
                // introImageTask = job.jobId;
                console.log(job.jobId);
              },
            }).promise.then(async () => {
              const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
              if (!advanceImageExists) {
                // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
                RNFS.downloadFile({
                  fromUrl: advanced === undefined ? image : advanced.image,
                  toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
                  background: true,
                  discretionary: true,
                  begin: (job) => {
                    iosTask = job.jobId;
                    // iosTask.push(job.jobId);
                    // introImageTask = job.jobId;
                    console.log(job.jobId);
                  },
                });
              }
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
                  seriesKey,
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
                seriesKey,
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
          } else {
            // iosTask += 1;
            const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
            if (!advanceImageExists) {
              // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
              RNFS.downloadFile({
                fromUrl: advanced === undefined ? image : advanced.image,
                toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
                background: true,
                discretionary: true,
                begin: (job) => {
                  iosTask = job.jobId;
                  // iosTask.push(job.jobId);
                  // introImageTask = job.jobId;
                  console.log(job.jobId);
                },
              });
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
                  seriesKey,
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
                seriesKey,
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
            }
          }
        });
      } else {
        // iosTask += 1;
        const advanceExerciseExists = await RNFS.exists(`${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
        if (!advanceExerciseExists) {
          // await download(dirs, advanced === undefined ? exercise.video : advanced.video, `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
          RNFS.downloadFile({
            fromUrl: advanced === undefined ? exercise.video : advanced.video,
            toFile: `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`,
            background: true,
            discretionary: true,
            begin: (job) => {
              iosTask = job.jobId;
              // iosTask.push(job.jobId);
              // introImageTask = job.jobId;
              console.log(job.jobId);
            },
          }).promise.then(async () => {
            const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
            if (!advanceImageExists) {
              // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
              RNFS.downloadFile({
                fromUrl: advanced === undefined ? image : advanced.image,
                toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
                background: true,
                discretionary: true,
                begin: (job) => {
                  iosTask = job.jobId;
                  // iosTask.push(job.jobId);
                  // introImageTask = job.jobId;
                  console.log(job.jobId);
                },
              });
            }
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
                seriesKey,
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
              seriesKey,
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
        } else {
          // iosTask += 1;
          const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
          if (!advanceImageExists) {
            // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
            RNFS.downloadFile({
              fromUrl: advanced === undefined ? image : advanced.image,
              toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
              background: true,
              discretionary: true,
              begin: (job) => {
                iosTask = job.jobId;
                // iosTask.push(job.jobId);
                // introImageTask = job.jobId;
                console.log(job.jobId);
              },
            });
          }
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
              seriesKey,
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
            seriesKey,
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
        }
      }
    });
  } else {
    // iosTask += 1;
    const introExerciseExists = await RNFS.exists(`${dirs}/AST/introExercises/${formattedExerciseName}.mp4`);
    if (!introExerciseExists) {
      // await download(dirs, exercise.video, `${dirs}/AST/introExercises/${formattedExerciseName}.mp4`);
      RNFS.downloadFile({
        fromUrl: exercise.video,
        toFile: `${dirs}/AST/introExercises/${formattedExerciseName}.mp4`,
        background: true,
        discretionary: true,
        begin: (job) => {
          iosTask = job.jobId;
          // iosTask.push(job.jobId);
          // introImageTask = job.jobId;
          console.log(job.jobId);
        },
      }).promise.then(async () => {
        const advanceExerciseExists = await RNFS.exists(`${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
        if (!advanceExerciseExists) {
          // await download(dirs, advanced === undefined ? exercise.video : advanced.video, `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
          RNFS.downloadFile({
            fromUrl: advanced === undefined ? exercise.video : advanced.video,
            toFile: `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`,
            background: true,
            discretionary: true,
            begin: (job) => {
              iosTask = job.jobId;
              // iosTask.push(job.jobId);
              // introImageTask = job.jobId;
              console.log(job.jobId);
            },
          }).promise.then(async () => {
            const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
            if (!advanceImageExists) {
              // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
              RNFS.downloadFile({
                fromUrl: advanced === undefined ? image : advanced.image,
                toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
                background: true,
                discretionary: true,
                begin: (job) => {
                  iosTask = job.jobId;
                  // iosTask.push(job.jobId);
                  // introImageTask = job.jobId;
                  console.log(job.jobId);
                },
              });
            }
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
                seriesKey,
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
              seriesKey,
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
        } else {
          // iosTask += 1;
          const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
          if (!advanceImageExists) {
            // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
            RNFS.downloadFile({
              fromUrl: advanced === undefined ? image : advanced.image,
              toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
              background: true,
              discretionary: true,
              begin: (job) => {
                iosTask = job.jobId;
                // iosTask.push(job.jobId);
                // introImageTask = job.jobId;
                console.log(job.jobId);
              },
            });
          }
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
              seriesKey,
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
            seriesKey,
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
        }
      });
    } else {
      // iosTask += 1;
      const advanceExerciseExists = await RNFS.exists(`${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
      if (!advanceExerciseExists) {
        // await download(dirs, advanced === undefined ? exercise.video : advanced.video, `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`);
        RNFS.downloadFile({
          fromUrl: advanced === undefined ? exercise.video : advanced.video,
          toFile: `${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4`,
          background: true,
          discretionary: true,
          begin: (job) => {
            iosTask = job.jobId;
            // iosTask.push(job.jobId);
            // introImageTask = job.jobId;
            console.log(job.jobId);
          },
        }).promise.then(async () => {
          const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
          if (!advanceImageExists) {
            // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
            RNFS.downloadFile({
              fromUrl: advanced === undefined ? image : advanced.image,
              toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
              background: true,
              discretionary: true,
              begin: (job) => {
                iosTask = job.jobId;
                // iosTask.push(job.jobId);
                // introImageTask = job.jobId;
                console.log(job.jobId);
              },
            });
          }
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
              seriesKey,
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
            seriesKey,
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
      } else {
        // iosTask += 1;
        const advanceImageExists = await RNFS.exists(`${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
        if (!advanceImageExists) {
          // await download(dirs, advanced === undefined ? image : advanced.image, `${dirs}/AST/advanceImages/${formattedExerciseName}.png`);
          RNFS.downloadFile({
            fromUrl: advanced === undefined ? image : advanced.image,
            toFile: `${dirs}/AST/advanceImages/${formattedExerciseName}.png`,
            background: true,
            discretionary: true,
            begin: (job) => {
              iosTask = job.jobId;
              // iosTask.push(job.jobId);
              // introImageTask = job.jobId;
              console.log(job.jobId);
            },
          });
        }
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
            seriesKey,
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
          seriesKey,
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
      }
    }
  }
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
  seriesKey,
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
  const dirs = RNFetchBlob.fs.dirs.DocumentDir;
  
  const formattedFileName = episodeTitle.replace(/ /g, '_');
  RNFS.mkdir(`${dirs}/AST/episodes`).then(() => {
    RNFS.mkdir(`${dirs}/AST/introImages`).then(() => {
      RNFS.mkdir(`${dirs}/AST/introExercises`).then(() => {
        RNFS.mkdir(`${dirs}/AST/advanceExercises`).then(() => {
          RNFS.mkdir(`${dirs}/AST/advanceImages`).then(async () => {
            const episodeExists = await RNFS.exists(`${dirs}/AST/episodes/${formattedFileName}.mp4`);
            if (episodeExists) {
              await RNFS.stat(`${dirs}/AST/episodes/${formattedFileName}.mp4`).then((resultStat) => {
                const { size } = resultStat;
                episodeSizeReceived = size;
                dispatch({
                  type: ACTION_DOWNLOAD_PROGRESS,
                  payload: (size / totalVideoSizeInBytes),
                });
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
                  seriesKey,
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
            } else {
              RNFS.downloadFile({
                fromUrl: `${video}`,
                toFile: `${dirs}/AST/episodes/${formattedFileName}.mp4`,
                progressDivider: 10,
                background: true,
                discretionary: true,
                begin: (job) => {
                  // iosTask = job.jobId;
                  episodeTask = job.jobId;
                  console.log(job.jobId);
                  // iosTask.push(job.jobId);
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
                  seriesKey,
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
            }
          });
        });
      });
    });
  });
};

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
  seriesKey,
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
      seriesKey,
      seriesIndex,
      startWT,
      endWT,
      dispatch,
    );
    // }
  };
};

const deleteEpisode = (fileName, dispatch, check) => {
  const dirs = RNFetchBlob.fs.dirs.DocumentDir;
  const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${fileName}"`));
  console.log(fileName);
  console.log(episodeDetail.length);
  const exerciseIdLists = Array.from(episodeDetail[0].exerciseIdList);
  const allEpisodes = Array.from(realm.objects('SavedEpisodes'));
  const formattedFileName = fileName.replace(/ /g, '_');

  RNFetchBlob.fs.unlink(`${dirs}/AST/episodes/${formattedFileName}.mp4`)
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
          RNFetchBlob.fs.unlink(`${dirs}/AST/episodes/${formattedExerciseTitle}.mp4`)
            .then(() => {
              RNFetchBlob.fs.unlink(`${dirs}/AST/advanceExercises/${formattedExerciseTitle}.mp4`)
                .then(() => {
                  RNFetchBlob.fs.unlink(`${dirs}/AST/introExercises/${formattedExerciseTitle}.mp4`)
                    .then(() => {
                      RNFetchBlob.fs.unlink(`${dirs}/AST/introImages/${formattedExerciseTitle}.png`)
                        .then(() => {
                          RNFetchBlob.fs.unlink(`${dirs}/AST/advanceImages/${formattedExerciseTitle}.png`)
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
          payload: true,
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
  RNFS.stopDownload(episodeTask);
  RNFS.stopDownload(iosTask - 1);
  RNFS.stopDownload(iosTask);
  RNFS.stopDownload(iosTask + 1);
  RNFS.stopDownload(iosTask + 2);
  iosTask = 0;

  dispatch({
    type: ACTION_DOWNLOAD_CANCEL,
    payload: true,
  });
};

export const stopIOSDownload = title => async (dispatch) => {
  dispatch({
    type: ACTION_DOWNLOAD_CANCEL,
    payload: undefined,
  });
  console.log('STOP DOWNLOAD', iosTask);

  RNFS.stopDownload(episodeTask);
  RNFS.stopDownload(iosTask + 1);

  deleteEpisode(title, dispatch, true);
};
