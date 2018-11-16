import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity, Alert,
} from 'react-native';
import Permissions from 'react-native-permissions';
import RNFetchBlob from 'react-native-fetch-blob';
import { Text, Icon } from 'react-native-elements';
import realm from '../config/Database';
import OfflineMsg from '../common/OfflineMsg';
import Loading from '../common/Loading';
import DeleteDownloads from '../common/DeleteDownloads';

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#33425a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: 'white',
    fontSize: 14,
  },
};
export default class Downloads extends React.Component {
  static navigationOptions = {
    title: 'Downloads',
  };

  state = {
    showLoading: false,
    filesList: [],
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
    this.requestPermissions();
    this.readDirectory();
  }

  // deleteEpisode = (fileName) => {
  //   this.setState({ showLoading: true });
  //   const { dirs } = RNFetchBlob.fs;
  //   const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${fileName}"`));
  //   const exerciseIdList = Array.from(episodeDetail[0].exerciseIdList);
  //   const allEpisodes = Array.from(realm.objects('SavedEpisodes'));
  //   const formattedFileName = fileName.replace(/ /g, '_');

  //   RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
  //     .then(async () => {
  //       await exerciseIdList.map((value) => {
  //         let count = 0;
  //         allEpisodes.map((episodeValue) => {
  //           const eachExerciseIdList = Array.from(episodeValue.exerciseIdList);
  //           if (eachExerciseIdList.includes(value)) {
  //             count += 1;
  //           }
  //         });
  //         if (count < 2) {
  //           const exerciseDetail = realm.objects('SavedExercises').filtered(`id="${value}"`);
  //           const exerciseTitle = Array.from(exerciseDetail)[0].title;
  //           const formattedExerciseTitle = exerciseTitle.replace(/\s+/g, '');
  //           RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/episodes/${formattedExerciseTitle}.mp4`)
  //             .then(() => {
  //               RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseTitle}.mp4`)
  //                 .then(() => {
  //                   RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/introExercises/${formattedExerciseTitle}.mp4`)
  //                     .then(() => {
  //                       RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/introImages/${formattedExerciseTitle}.png`)
  //                         .then(() => {
  //                           RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseTitle}.png`)
  //                             .then(() => {
  //                               realm.write(() => {
  //                                 realm.delete(exerciseDetail);
  //                               });
  //                             }).catch(error => console.log(error));
  //                         }).catch(error => console.log(error));
  //                     }).catch(error => console.log(error));
  //                 }).catch(error => console.log(error));
  //             }).catch(error => console.log(error));
  //         }
  //       });
  //       realm.write(() => {
  //         realm.delete(episodeDetail);
  //       });
  //       this.readDirectory();
  //       this.setState({ showLoading: false });
  //     })
  //     .catch((err) => {
  //       this.setState({ showLoading: false });
  //     });
  // }

  readDirectory = () => {
    const { dirs, ls } = RNFetchBlob.fs;
    ls(`${dirs.DocumentDir}/AST/episodes`)
      .then((files) => {
        if (files.length === 0) {
          Alert.alert('You do not have any downloads.');
        }
        this.setState({ filesList: files });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  requestPermissions = async () => {
    Permissions.check('mediaLibrary').then((response) => {
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      if (response !== 'authorized') {
        Permissions.request('mediaLibrary').then((res) => {
          console.log(res);
        });
      }
    });
  }

  delete = (fileName) => {
    this.child.deleteEpisodes(fileName);
    this.readDirectory();
  }

  renderDeleteButton = (i, fileName) => {
    // if (i === this.state.index && this.state.showDeleteButton) {
    return (
      <TouchableOpacity onPress={() => this.delete(fileName)}>
        <View style={{
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'flex-end',
          padding: 5,
        }}
        >
          <Icon
            name="trash"
            color="white"
            type="evilicon"
          />
          <Text style={styles.text}>
          Delete
          </Text>
        </View>
      </TouchableOpacity>
    );
    // }
  }

  render() {
    const filesList = this.state.filesList.map((file, i) => {
      const fileName = file.split('.');
      const formattedFile = fileName[0].replace(/_/g, ' ');
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${formattedFile}"`));
            const { episodeIndex } = episodeDetail[0];
            this.props.navigation.navigate('EpisodeView', {
              offline: true,
              title: formattedFile,
              episodeIndex,
            });
          }}
          // onLongPress={() => {
          //   this.setState({ showDeleteButton: true, index: i + 1 });
          // }}
        >
          <View>
            <View style={styles.mainContainer}>
              <Text style={{ fontSize: 18, color: 'white', margin: 15 }}>
                {formattedFile}
              </Text>
              {this.renderDeleteButton((i + 1), formattedFile)}
            </View>
            {this.state.showLoading ? <Loading /> : null}
            <View style={{
              height: 1,
              width: '100%',
              leftmargin: 10,
              backgroundColor: 'white',
            }}
            />
          </View>
        </TouchableWithoutFeedback>
      );
    });
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        { !this.state.isConnected ? <OfflineMsg /> : null }
        <DeleteDownloads ref={ref => (this.child = ref)} />
        <ScrollView>
          {filesList}
        </ScrollView>
      </View>
    );
  }
}
