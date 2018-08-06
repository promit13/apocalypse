import React from 'react';
import {
  ScrollView,
  View,
  Image,
} from 'react-native';
import {
  Text,
  ListItem,
  Icon,
  Button,
} from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

export const EXERCISES = {
  benchPress: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPress: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FCatherine_Part1.mkv?alt=media&token=923656c5-ca39-4aab-94d3-283a22b513be',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  benchPressSecond: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPressSecond: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FCatherine_Part1.mkv?alt=media&token=923656c5-ca39-4aab-94d3-283a22b513be',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  benchPressThird: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPressThird: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FCatherine_Part1.mkv?alt=media&token=923656c5-ca39-4aab-94d3-283a22b513be',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
};


export const TRACKS = [
  {
    title: 'Zombie training',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Apocalypse monkeys',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Giant squids',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
];

const styles = {
  imageStyle: {
    width: '100%',
    height: 200,
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
  },
  purchaseButtonStyle: {
    alignItems: 'flex-end',
    backgroundColor: '#001331',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
  },
  episodeHeaderView: {
    padding: 15,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#001331',
  },
  playingEpisodeView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  circularImageView: {
    height: 60,
    width: 60,
    borderWidth: 5,
    borderColor: 'white',
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
export default class EpisodeList extends React.Component {
  state = {
    series: '',
    loading: true,
  }

  componentDidMount() {
    firebase.database().ref('series').on('value', snapshot => this.setState({ series: snapshot.val(), loading: false }));
  }

  onEpisodeClick = (episodeId) => {
    this.setState({ loading: true });
    firebase.database().ref(`episodes/${episodeId}`).on('value', (snapshot) => {
      this.setState({ loading: false });
      this.props.navigation.navigate('EpisodeView', {
        tracks: TRACKS,
        exercises: EXERCISES,
        episodeId,
        title: snapshot.val().title,
        category: snapshot.val().category,
        description: snapshot.val().description,
        imageUrl: snapshot.val().intel,
      });
    });
  }

  renderList = () => {
    let minIndex = 0;
    let maxIndex = 0;
    const seriesList = Object.entries(this.state.series).map(([key, value], i) => {
      minIndex = maxIndex + 1;
      maxIndex += Object.keys(value.episodes).length;
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], episodeIndex) => {
          return (
            <ListItem
              key={episodeKey}
              title={`${episodeIndex + minIndex}. ${episodeValue.title}`}
              subtitle={episodeValue.category}
              titleStyle={{ color: 'white', fontSize: 18 }}
              subtitleStyle={{ color: 'white' }}
              rightIcon={{ name: 'download', type: 'feather', color: 'white' }}
              containerStyle={{ backgroundColor: '#33425a' }}
              underlayColor="#2a3545"
              onPress={() => {
                this.onEpisodeClick(
                  episodeKey,
                );
              }}
            />
          );
        });
      return (
        <View>
          <View style={styles.episodeHeaderView}>
            <Text style={styles.textStyle}>
              {`Part ${i + 1} (Episodes ${minIndex}-${maxIndex})`}
            </Text>
            <Button title="Purchased" buttonStyle={styles.purchaseButtonStyle} />
          </View>
          {episodesList}
        </View>
      );
    });
    return (
      <View>
        {seriesList}
      </View>
    );
  }

  render() {
    if (this.state.loading) return <Loading />;
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        <ScrollView>
          <View>
            <Image
              style={styles.imageStyle}
              source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
            />
            <View style={styles.playingEpisodeView}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.circularImageView}>
                  <Image
                    style={{
                      height: 60,
                      width: 60,
                      borderRadius: 60 / 2,
                    }}
                    source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
                  />
                </View>
                <View>
                  <Text style={{
                    fontSize: 18,
                    color: '#001331',
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                  >
                    Play First Episode
                  </Text>
                  <Text style={{ color: '#001331', marginLeft: 10, marginRight: 10 }}>
                    6. Welcome to the Apocalypse
                  </Text>
                </View>
              </View>
              <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" />
            </View>
            {this.renderList()}
          </View>
        </ScrollView>
      </View>
    );
  }
}
