import React from 'react';
import {
  View, Alert, Dimensions, Platform, BackHandler,
} from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import RNBackgroundDownloader from 'react-native-background-downloader';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import realm from '../config/Database';
import ShowModal from '../common/ShowModal';

const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'green',
  borderRadius: 5,
};

let exercisesList = [];
let exerciseLengthList = [];
let exerciseIdList = [];

const styles = {
  mainContaier: {
    flex: 1,
    backgroundColor: '#001331',
    paddingTop: 15,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#33425a',
    padding: 10,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001331',
    height: 50,
    width: '100%',
  },
  textTitle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'gray',
  },
  innerView: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
};

export default class DownloadFiles extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      // title: navigation.getParam('mode', ''),
      header: null,
    };
  };

  state = {
    loading: false,
    progressPercentage: 0,
    showModal: false,
    modalText: '',
    downloadTitle: '',
    received: 0,
    totalSize: 0,
  }

  componentDidMount() {
    const {
      exercises,
    } = this.props.navigation.state.params;
    if (exercises === undefined) {
      return;
    }
    exercises.map((value, i) => {
      const {
        length, uid, visible, episodeExerciseTitle,
      } = value;
      firebase.database().ref(`exercises/${uid}`).on('value', (snapShot) => {
        const exercise = { ...snapShot.val(), id: uid, visible, episodeExerciseTitle };
        exerciseLengthList.push(length);
        exerciseIdList.push(uid);
        exercisesList.push(exercise);
      });
    });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    exerciseLengthList = [];
    exercisesList = [];
    exerciseIdList = [];
  }

  download = () => {
    const {
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
    } = this.props.navigation.state.params;
    const totalVideoSize = (parseInt(videoSize, 10) * (1024 * 1024));
    this.setState({ downloadTitle: episodeTitle });
    const { dirs } = RNFetchBlob.fs;
    const formattedFileName = episodeTitle.replace(/ /g, '_');

    let task = RNBackgroundDownloader.download({
      id: 'episode',
      url: video,
      destination: `${RNBackgroundDownloader.directories.documents}/AST/episodes/${formattedFileName}.mp4`,
    }).begin((expectedBytes) => {
      console.log(`Going to download ${expectedBytes} bytes!`);
    }).progress((percent) => {
      // console.log(`Downloaded: ${percent * 100}%`);
      this.setState({ progressPercentage: (percent * 100) });
    }).done(() => {
      // console.log('Download is done!');
      realm.write(() => {
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
    })
      .error((error) => {
        console.log('Download canceled due to error: ', error);
      });
  }

  navigateToHome = () => {
    const { loading } = this.state;
    if (loading) {
      this.setState({ showModal: true, modalText: 'Please stay on this page until download completes' });
    } else {
      this.props.navigation.navigate('EpisodeList');
    }
  }

  handleBackButton = () => {
    this.navigateToHome();
    return true;
  }

  render() {
    const { progressPercentage, showModal, modalText, downloadTitle } = this.state;
    const platform = Platform.OS;
    return (
      <View style={styles.mainContaier}>
        <View style={styles.headerView}>
          <Icon
            iconStyle={{ marginLeft: platform === 'android' ? 15 : 0 }}
            name={platform === 'android' ? 'arrow-left' : 'chevron-left'}
            type={platform === 'android' ? 'material-community' : 'feather'}
            size={platform === 'android' ? 25 : 38}
            color="white"
            underlayColor="#001331"
            onPress={() => this.navigateToHome()}
          />
        </View>
        <View style={styles.line} />
        <ShowModal
          visible={showModal}
          title={modalText}
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <View style={styles.innerView}>
          <Text style={styles.text}>
            {`Download ${this.props.navigation.state.params.episodeTitle}?` }
          </Text>
          <Button
            title="Download"
            buttonStyle={styles.button}
            onPress={() => {
              this.setState({ loading: true });
              this.download();
            }}
          />
          { this.state.loading ? (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.text, { fontSize: 12 }]}>
                {downloadTitle}
              </Text>
              <ProgressBarAnimated
                width={barWidth}
                {...progressCustomStyles}
                value={progressPercentage}
                barAnimationDuration={100}
              />
              <Loading />
            </View>
          ) : null
          }
        </View>
      </View>
    );
  }
}
