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

  download = async () => {
    const {
      episodeTitle, episodeId, category, description, exercises, video,
    } = this.props.navigation.state.params;
    const { dirs } = RNFetchBlob.fs;
    const formattedFileName = episodeTitle.replace(/ /g, '_');
    // RNFetchBlob.fs.mkdir(`${dirs.MovieDir}/AST/episodes`)
    //   .then(() => {
    RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
      .then((exist) => {
        if (exist) {
          this.setState({ loading: false });
          return Alert.alert('Episode already downloaded');
        }
        RNFetchBlob
          .config({
          // response data will be saved to this path if it has access right.
            path: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`,
          })
          .fetch('GET', `${video}`, {
          // .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
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
            });
            // the path should be dirs.DocumentDir + 'path-to-file.anything'
            exercisesList.map((exercise, i) => {
              const formattedExerciseName = exercise.title.replace(/\s+/g, '');
              return RNFetchBlob
                .config({
                // response data will be saved to this path if it has access right.
                  path: `${dirs.DocumentDir}/AST/exercises/${formattedExerciseName}.mp4`,
                })
                .fetch('GET', `${exercise.video}`, {
                // .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
                  // some headers ..
                }).then(() => {
                  RNFetchBlob
                    .config({
                    // response data will be saved to this path if it has access right.
                      path: `${dirs.DocumentDir}/AST/images/${exercise}.png`,
                    })
                    .fetch('GET', `${exercise.image}`, {
                    // .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FHome.jpg?alt=media&token=8c4beb9d-d6c3-43f7-a5a6-27527fe21029', {
                      // some headers ..
                    }).then(() => {
                      realm.write(() => {
                        const exerciseDetail = realm.create('SavedExercises', {
                          id: exercise.id,
                          title: exercise.title,
                          image: `${dirs.DownloadDir}/AST/images/${exercise.title}.png`,
                          path: `${dirs.DownloadDir}/AST/exercises/${exercise.title}.mp4`,
                        });
                      });
                      if (i === (exercisesList.length - 1)) {
                        this.setState({ loading: false });
                        return Alert.alert('Download Complete');
                      }
                    }).catch((error) => {
                      console.log(error);
                    });
                }).catch((error) => {
                  console.log(error);
                });
            });
          }).catch((error) => {
            this.setState({ loading: false });
            return Alert.alert('Episode already downloaded');
          });
      });
  // });
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
