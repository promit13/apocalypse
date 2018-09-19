import React from 'react';
import { View, Button } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import Realm from 'realm';
import firebase from '../config/firebase';
import Loading from './Loading';
import realm from '../config/Database';

let exercisesList = [];
let exerciseLengthList = [];
let exerciseIdList = [];

export default class DownloadFiles extends React.Component {
  state = {
    loading: false,
  }


  componentDidMount() {
    console.log('downloadFile');
    const {
      exercises,
    } = this.props.navigation.state.params;
    console.log(exercises);
    exercises.map((value, i) => {
      firebase.database().ref(`exercises/${value.uid}`).on('value', (snapShot) => {
        const exercise = { ...snapShot.val(), id: value.uid };
        // exercise.id = value.uid;
        // const exercise = snapShot.val();
        // exerciseIdLength.push({ length: value.length, exerciseId: value.uid });
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
    console.log(exercisesList);
    console.log(exerciseLengthList);
    const {
      episodeTitle, episodeId, category, description, exercises, video,
    } = this.props.navigation.state.params;
    const { dirs } = RNFetchBlob.fs;
    // RNFetchBlob.fs.mkdir(`${dirs.MovieDir}/AST/episodes`)
    //   .then(() => {
    RNFetchBlob
      .config({
      // response data will be saved to this path if it has access right.
        path: `${dirs.MovieDir}/AST/episodes/${episodeTitle}.mp4`,
      })
      // .fetch('GET', `${downloadUrl}`, {
      .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
        // some headers ..
      })
      .then((res) => {
        realm.write(() => {
          const episodeData = realm.create('SavedEpisodes', {
            id: episodeId,
            title: episodeTitle,
            category,
            description,
            exerciseLengthList,
            exerciseIdList,
          // console.log(episodeData);
          });
          console.log(episodeData);
          console.log(Array.from(episodeData.exerciseIdList));
        });
        // the path should be dirs.DocumentDir + 'path-to-file.anything'
        console.log('The file saved to ', res.path());
        exercisesList.map((exercise, i) => {
          return RNFetchBlob
            .config({
            // response data will be saved to this path if it has access right.
              path: `${dirs.MovieDir}/AST/exercises/${exercise.title}.mp4`,
            })
            // .fetch('GET', `${exercise.video}`, {
            .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
              // some headers ..
            }).then(() => {
              RNFetchBlob
                .config({
                // response data will be saved to this path if it has access right.
                  path: `${dirs.MovieDir}/AST/images/${exercise.title}.png`,
                })
                // .fetch('GET', `${exercise.image}`, {
                .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FHome.jpg?alt=media&token=8c4beb9d-d6c3-43f7-a5a6-27527fe21029', {
                  // some headers ..
                }).then(() => {
                  realm.write(() => {
                    const exerciseDetail = realm.create('SavedExercises', {
                      id: exercise.id,
                      title: exercise.title,
                      image: `${dirs.MovieDir}/AST/images/${exercise.title}.png`,
                      path: `${dirs.MovieDir}/AST/exercises/${exercise.title}.mp4`,
                    });
                    console.log(exerciseDetail);
                  });
                  if (i === (exercisesList.length - 1)) {
                    return this.setState({ loading: false });
                  }
                }).catch((error) => {
                  console.log(error);
                });
            }).catch((error) => {
              console.log(error);
            });
        });
      }).catch((error) => {
        console.log(error);
      });
  // });
  }

  render() {
    return (
      <View>
        { this.state.loading ? <Loading /> : null }
        <Button
          title="Download"
          onPress={() => {
            this.setState({ loading: true });
            this.download();
          }}
        />
      </View>
    );
  }
}
