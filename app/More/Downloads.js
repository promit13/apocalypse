import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity, NetInfo,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import { Text, Icon, ListItem } from 'react-native-elements';
import firebase from '../config/firebase';
import OfflineMsg from '../common/OfflineMsg';
import LoadScreen from '../LoadScreen';

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
    hideChevron: true,
    loading: true,
    exercises: '',
    index: 0,
    filesList: [],
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.screenProps.isConnected });
    this.readDirectory();
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange');
  }

  deleteExercise = (exerciseId) => {
    firebase.database().ref(`exercises/${exerciseId}`).remove()
      .then(() => this.setState({ index: 0 }));
  }

  readDirectory = () => {
    const { dirs } = RNFetchBlob.fs;
    RNFetchBlob.fs.ls(`${dirs.MovieDir}/AST/episodes`)
    // files will an array contains filenames
      .then((files) => {
        this.setState({ filesList: files, loading: false });
        console.log(files);
      });
  }

  renderDeleteButton = (i, exerciseId) => {
    if (i === this.state.index) {
      return (
        <TouchableOpacity onPress={() => this.deleteExercise(exerciseId)}>
          <View style={{
            flex: 1,
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
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
    if (this.state.loading) return <LoadScreen />;
    const filesList = this.state.filesList.map((file, i) => {
      const fileName = file.split('.');
      return (
        <ListItem
          key={i}
          title={fileName[0]}
          hideChevron
          titleStyle={{ color: 'white', fontSize: 18 }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            this.props.navigation.navigate('EpisodeView', {
              offline: true,
              title: fileName[0],
            });
          }}
        />
        // <TouchableWithoutFeedback
        //   onPress={() => {
        //     this.setState({ loading: true });
        //     this.props.navigation.navigate('EpisodeView', {
        //       offline: true,
        //       episodeTitle: fileName[0],
        //     });
        //   }}
        //   onLongPress={() => this.setState({ index: i + 1 })}
        // >
        //   <View>
        //     <View style={styles.mainContainer}>
        //       <Text style={{ fontSize: 18, color: 'white', margin: 10 }}>
        //         {fileName[0]}
        //       </Text>
        //     </View>
        //     <View style={{
        //       height: 1,
        //       width: '100%',
        //       leftmargin: 10,
        //       backgroundColor: 'white',
        //     }}
        //     />
        //   </View>
        // </TouchableWithoutFeedback>
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
