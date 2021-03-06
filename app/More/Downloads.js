import React from 'react';
import {
  ScrollView, View, TouchableWithoutFeedback, TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import { Text, Icon } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import realm from '../config/Database';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';
import Loading from '../common/Loading';
import deleteEpisode from '../actions/deleteEpisode';
// import DeleteDownloads from '../common/DeleteDownloads';

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#33425a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listText: {
    color: 'white',
    marginLeft: moderateScale(15),
  },
  text: {
    color: 'white',
    fontSize: moderateScale(14),
  },
};
class Downloads extends React.Component {
  static navigationOptions = {
    title: 'Downloads',
  };

  state = {
    showLoading: false,
    showModal: false,
    showDeleteDialog: false,
    deleteFileTitle: '',
    filesList: [],
    deleteStatus: false,
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
    this.readDirectory();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.deleteStatus === this.state.deleteStatus) {
      this.readDirectory();
    }
  }
  
  readDirectory = () => {
    const allEpisodes = Array.from(realm.objects('SavedEpisodes'));
    const files = allEpisodes.map((episodeValue) => {
      const {
        title, episodeIndex, category, videoSize,
      } = episodeValue;
      return {
        title, episodeIndex, category, videoSize,
      };
    });
    console.log(allEpisodes);
    this.setState({ filesList: files, deleteStatus: false, showModal: allEpisodes.length === 0 ? true: false });
  }

  delete = (fileName) => {
    // this.child.deleteEpisodes(fileName);
    this.setState({ deleteStatus: true });
    this.props.deleteEpisode(fileName);
  }

  renderDeleteButton = (fileName) => {
    return (
      <TouchableOpacity onPress={() => this.setState({ showDeleteDialog: true, deleteFileTitle: fileName })}>
        <View style={{
          alignSelf: 'flex-end',
          marginRight: moderateScale(15),
        }}
        >
          <Icon
            name="trash-2"
            color="white"
            type="feather"
            size={moderateScale(30)}
          />
        </View>
      </TouchableOpacity>
    );
    // }
  }

  render() {
    const {
      isConnected, showModal, showLoading, showDeleteDialog, deleteFileTitle, filesList,
    } = this.state;
    const episodesList = filesList.map((file) => {
      // const fileName = file.split('.');
      // const title = fileName[0].replace(/_/g, ' ');
      const {
        title, episodeIndex, category, videoSize,
      } = file;
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            this.props.navigation.navigate('EpisodeView', {
              offline: true,
              title,
              purchased: true,
              episodeIndex,
              episodesList: false,
            });
          }}
        >
          <View>
            <View style={styles.mainContainer}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={[styles.listText, { marginTop: moderateScale(15), fontSize: moderateScale(18) }]}>
                  {`${episodeIndex + 1}. ${title}`}
                </Text>
                <Text style={[styles.listText, { marginBottom: moderateScale(15), fontSize: moderateScale(10) }]}>
                  {`${category} - ${videoSize} MB`}
                </Text>
              </View>
              {this.renderDeleteButton(title)}
            </View>
            {showLoading ? <Loading /> : null}
            <View style={{
              height: 1,
              width: '100%',
              leftmargin: moderateScale(10),
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
        {/* <DeleteDownloads ref={ref => (this.child = ref)} /> */}
        <ShowModal
          visible={showModal}
          title="No Downloads Available"
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
          {episodesList}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = ({ deleteEpisodeReducer }) => {
  return { deleteStatus: deleteEpisodeReducer.message };
};

const mapDispatchToProps = {
  deleteEpisode,
};

export default connect(mapStateToProps, mapDispatchToProps)(Downloads);
