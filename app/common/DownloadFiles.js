import React from 'react';
import { View, Button } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../config/firebase';
import Loading from './Loading';

let exercisesList = [];

export default class DownloadFiles extends React.Component {

  state = {
    loading: false,
    exercisesList: [],
  }

  componentDidMount() {
    console.log('downloadFile');
    const {
      exercises,
    } = this.props.navigation.state.params;
    console.log(exercises);
    exercises.map((value, i) => (
      firebase.database().ref(`exercises/${value.uid}`).on('value', (snapShot) => {
        const exercise = snapShot.val();
        exercisesList.push({ length: value.length, exercise });
      })
    ));
  }

  componentWillUnmount() {
    exercisesList = [];
  }

  download = () => {
    const {
      episodeTitle, episodeId, category, description, exercises, video,
    } = this.props.navigation.state.params;
    const { dirs } = RNFetchBlob.fs;
    RNFetchBlob.fs.mkdir(`${dirs.MovieDir}/AST/${episodeTitle}`)
      .then(() => {
        RNFetchBlob
          .config({
          // response data will be saved to this path if it has access right.
            path: `${dirs.MovieDir}/AST/${episodeTitle}/${episodeTitle}.mp4`,
          })
          // .fetch('GET', `${downloadUrl}`, {
          .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
            // some headers ..
          })
          .then((res) => {
          // the path should be dirs.DocumentDir + 'path-to-file.anything'
            console.log('The file saved to ', res.path());
            exercisesList.map((exercise, i) => {
              return RNFetchBlob
                .config({
                // response data will be saved to this path if it has access right.
                  path: `${dirs.MovieDir}/AST/${episodeTitle}/exercises/${exercise.length}/${exercise.exercise.title}.mp4`,
                })
                // .fetch('GET', `${downloadUrl}`, {
                .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
                  // some headers ..
                })
                .then(() => {
                  if (i === (exercisesList.length - 1)) {
                    return this.setState({ loading: false });
                  }
                });
            });
          });
      });
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
