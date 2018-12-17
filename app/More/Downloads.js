import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import { Text, Icon } from 'react-native-elements';
import realm from '../config/Database';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';
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
    showModal: false,
    showDeleteDialog: false,
    deleteFileTitle: '',
    filesList: [],
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
    // this.requestPermissions();
    this.readDirectory();
  }
  
  readDirectory = () => {
    const { dirs, ls } = RNFetchBlob.fs;
    ls(`${dirs.DocumentDir}/AST/episodes`)
      .then((files) => {
        if (files.length === 0) {
          this.setState({ showModal: true });
        }
        this.setState({ filesList: files });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // requestPermissions = async () => {
  //   Permissions.check('mediaLibrary').then((response) => {
  //     // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
  //     if (response !== 'authorized') {
  //       Permissions.request('mediaLibrary').then((res) => {
  //         console.log(res);
  //       });
  //     }
  //   });
  // }

  delete = (fileName) => {
    this.child.deleteEpisodes(fileName);
    this.readDirectory();
  }

  renderDeleteButton = (i, fileName) => {
    // if (i === this.state.index && this.state.showDeleteButton) {
    // this.delete(fileName)
    return (
      <TouchableOpacity onPress={() => this.setState({ showDeleteDialog: true, deleteFileTitle: fileName })}>
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
    const { isConnected, showModal, showLoading, showDeleteDialog, deleteFileTitle } = this.state;
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
              purchased: true,
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
            {showLoading ? <Loading /> : null}
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
        { !isConnected ? <OfflineMsg /> : null }
        <DeleteDownloads ref={ref => (this.child = ref)} />
        <ShowModal
          visible={showModal}
          title="You do not have any downloads"
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <ShowModal
          visible={showDeleteDialog}
          description="Do you really want to delete episode?"
          buttonText="Cancel"
          secondButtonText="Confirm"
          askAdvance
          onSecondButtonPress={() => {
            this.setState({ showDeleteDialog: false });
            this.delete(deleteFileTitle);
          }}
          onPress={() => this.setState({ showDeleteDialog: false })}
        />
        <ScrollView>
          {filesList}
        </ScrollView>
      </View>
    );
  }
}
