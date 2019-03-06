import { AsyncStorage } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import realm from '../config/Database';
import { ACTION_DELETE } from './types';

const deleteEpisode = fileName => (dispatch) => {
  dispatch({
    type: ACTION_DELETE,
    payload: false,
  });
  console.log(fileName);
  const dirs = RNFetchBlob.fs.dirs.DocumentDir;
  const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${fileName}"`));
  const exerciseIdList = Array.from(episodeDetail[0].exerciseIdList);
  const allEpisodes = Array.from(realm.objects('SavedEpisodes'));
  const formattedFileName = fileName.replace(/ /g, '_');

  RNFetchBlob.fs.unlink(`${dirs}/AST/episodes/${formattedFileName}.mp4`)
    .then(async () => {
      await exerciseIdList.map((value) => {
        let count = 0;
        allEpisodes.map((episodeValue) => {
          const eachExerciseIdList = Array.from(episodeValue.exerciseIdList);
          if (eachExerciseIdList.includes(value)) {
            count += 1;
          }
        });
        if (count < 2) {
          const exerciseDetail = realm.objects('SavedExercises').filtered(`id="${value}"`);
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
        type: ACTION_DELETE,
        payload: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
export default deleteEpisode;
