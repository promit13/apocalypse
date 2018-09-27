import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity, NetInfo, Alert,
} from 'react-native';
import Permissions from 'react-native-permissions';
import RNFetchBlob from 'react-native-fetch-blob';
import { Text, Icon, ListItem } from 'react-native-elements';
import firebase from '../config/firebase';
import OfflineMsg from '../common/OfflineMsg';
import realm from '../config/Database';
import Loading from '../common/Loading';

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#33425a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};
export default class Downloads extends React.Component {
  static navigationOptions = {
    title: 'Downloads',
  };

  state = {
    showLoading: false,
    showDeleteButton: false,
    exercises: '',
    index: 0,
    filesList: [],
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
    this.requestPermissions();
    this.readDirectory();
  }

  // componentWillUnmount() {
  //   NetInfo.isConnected.removeEventListener('connectionChange');
  // }

  deleteExercise = (fileName) => {
    this.setState({ showLoading: true });
    const { dirs } = RNFetchBlob.fs;
    const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`title="${fileName}"`));
    const exerciseIdList = Array.from(episodeDetail[0].exerciseIdList);
    const allEpisodes = Array.from(realm.objects('SavedEpisodes'));

    RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/AST/episodes/${fileName}.mp4`)
      .then(() => {
        exerciseIdList.map((value) => {
          let count = 0;
          allEpisodes.map((episodeValue) => {
            const eachExerciseIdList = Array.from(episodeValue.exerciseIdList);
            if (eachExerciseIdList.includes(value)) {
              count += 1;
            }
          });
          if (count < 2) {
            const exerciseDetail = realm.objects('SavedExercises').filtered(`id="${value}"`);
            realm.write(() => {
              realm.delete(exerciseDetail);
            });
          }
        });
        realm.write(() => {
          realm.delete(episodeDetail);
        });
        this.readDirectory();
        this.setState({ showLoading: false, showDeleteButton: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ showLoading: false });
      });
  }

  readDirectory = () => {
    const { dirs, ls } = RNFetchBlob.fs;
    ls(`${dirs.DocumentDir}/AST/episodes`)
    // files will an array contains filenames
      .then((files) => {
        if (files.length === 0) {
          Alert.alert('You have no any downloads');
        }
        this.setState({ filesList: files });
        console.log(files);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  requestPermissions = async () => {
    Permissions.check('mediaLibrary').then((response) => {
      console.log(response);
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      if (response !== 'authorized') {
        Permissions.request('mediaLibrary').then((res) => {
          console.log(res);
        });
      }
    });
  }

  renderDeleteButton = (i, fileName) => {
    if (i === this.state.index && this.state.showDeleteButton) {
      return (
        <TouchableOpacity onPress={() => this.deleteExercise(fileName)}>
          <View style={{
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-end',
            padding: 5,
          }}
          >
            <Icon
              name="delete"
              color="white"
            />
            <Text style={{ color: 'white' }}>
            Delete
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  render() {
    const filesList = this.state.filesList.map((file, i) => {
      const fileName = file.split('.');
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({ showDeleteButton: false });
            this.props.navigation.navigate('EpisodeView', {
              offline: true,
              title: fileName[0],
            });
          }}
          onLongPress={() => {
            this.setState({ showDeleteButton: true, index: i + 1 });
          }}
        >
          <View>
            <View style={styles.mainContainer}>
              <Text style={{ fontSize: 18, color: 'white', margin: 15 }}>
                {fileName[0]}
              </Text>
              {this.renderDeleteButton((i + 1), fileName[0])}
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
        <View style={{ height: 1, backgroundColor: 'gray' }} />
        <ScrollView>
          {filesList}
        </ScrollView>
      </View>
    );
  }
}
