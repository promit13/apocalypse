import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, StatusBar,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

export const EXERCISES = {
  benchPress: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'http://techslides.com/demos/sample-videos/small.mp4',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPress: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  benchPressSecond: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'http://techslides.com/demos/sample-videos/small.mp4',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPressSecond: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  benchPressThird: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'http://techslides.com/demos/sample-videos/small.mp4',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPressThird: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
};


export const TRACKS = [
  {
    title: 'Zombie training',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Apocalypse monkeys',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Giant squids',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
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
  },
  latestIntelView: {
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
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default class TalonScreen extends React.Component {
  static navigationOptions = {
    title: 'Talon',
  };

  constructor(props) {
    super(props);
    this.state = {
      series: '',
      index: 0,
      loading: true,
    };
  }

  componentDidMount() {
    firebase.database().ref('series').on('value', snapshot => this.setState({ series: snapshot.val(), loading: false }));
  }

  renderContent = (i) => {
    if (this.state.index === i) {
      return (
        <View style={{ backgroundColor: '#445878' }}>
          <ListItem
            title={`Episode ${i} Intel`}
            titleStyle={{ color: 'white' }}
            underlayColor="#2a3545"
            onPress={() => this.props.navigation.navigate('TalonIntelPlayer', {
              tracks: TRACKS,
              exercises: EXERCISES,
            })}
          />
          <View style={{ padding: 15 }}>
            <Text style={styles.textStyle}>
              01/02/18 - Ep01 -4.00 km/2.48 m in 31:46
            </Text>
            <View style={{
              marginTop: 10,
              marginBottom: 10,
              height: 1,
              width: '100%',
              backgroundColor: 'white',
            }}
            />
            <Text style={styles.textStyle}>
              07/02/18 - Ep01 -4.60 km/2.58 m in 31:46
            </Text>
          </View>
        </View>
      );
    }
  }

  render() {
    const series = Object.entries(this.state.series).map(([key, value], i) => {
      return (
        <View>
          <ListItem
            key={key}
            roundAvatar
            avatar={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
            title={`Episode ${i + 1} Intel File`}
            titleStyle={{ color: 'white', fontSize: 16 }}
            rightIcon={{ name: 'chevron-down', type: 'feather', color: '#f5cb23' }}
            containerStyle={{ backgroundColor: '#33425a' }}
            underlayColor="#2a3545"
            onPress={() => {
              this.setState({ index: i + 1 });
            }}
          />
          {this.renderContent(i + 1)}
        </View>
      );
    });
    if (this.state.loading) return <Loading />;
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        <StatusBar
          backgroundColor="#00000b"
        />
        <ScrollView>
          <Image
            style={styles.imageStyle}
            resizeMode="stretch"
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FHome.jpg?alt=media&token=8c4beb9d-d6c3-43f7-a5a6-27527fe21029' }}
          />
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.latestIntelView}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="connectdevelop" type="font-awesome" size={60} color="black" />
                <View>
                  <Text style={{
                    fontSize: 18,
                    color: '#001331',
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                  >
                    Play Latest Essential Intel
                  </Text>
                  <Text style={{ color: '#001331', marginLeft: 10, marginRight: 10 }}>
                    6. The War Within
                  </Text>
                </View>
              </View>
              <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" />
            </View>
          </TouchableOpacity>
          {series}
        </ScrollView>
      </View>
    );
  }
}
