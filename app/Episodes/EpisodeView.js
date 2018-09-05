import React from 'react';
import {
  ScrollView, View, Image,
} from 'react-native';
import {
  ListItem, Button, Text,
} from 'react-native-elements';
import firebase from '../config/firebase';

const styles = {
  mainContainer: {
    backgroundColor: '#001331',
  },
  buttonsViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5cb23',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  circularImageView: {
    height: 120,
    width: 120,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 120 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    marginLeft: 15,
    marginRight: 15,
  },
  buttonView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#f5cb23',
    color: 'blue',
    alignSelf: 'flex-start',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
};

const imageUrls = [
  'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/Running%20Logo%20White%20BG.png?alt=media&token=6df03197-e7cb-4bc2-aac5-b51e6404ff90',
  'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/Circuit%20Logo%20White%20BG.png?alt=media&token=ac1d355d-3a86-417a-9327-8ad00032a077',
  'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/Holistic%20Logo%20White%20BG.png?alt=media&token=ad9ce094-4e19-4d7c-b96b-c3550dbfc291',
];
export default class EpisodeView extends React.Component {
  static navigationOptions = {
    title: 'Episode',
  };

  state = {
    url: '',
  }

  componentDidMount() {
    const { category } = this.props.navigation.state.params;
    if (category === 'Speed') {
      return this.setState({ url: imageUrls[0] });
    }
    if (category === 'Strength') {
      return this.setState({ url: imageUrls[1] });
    }
    if (category === 'Control') {
      return this.setState({ url: imageUrls[2] });
    }
    // firebase.storage().ref('temp/Home.jpg').getDownloadURL()
    // firebase.storage().ref(`episodes/${episodeId}/${imageUrl}`).getDownloadURL()
    //   .then((url) => {
    //     this.setState({ url });
    //     console.log(url);
    //   });
  }

  navigateToEpisodeSingle = (check, mode) => {
    const {
      tracks,
      exercises,
      episodeId,
      index,
      exerciseList,
      videoUrl,
    } = this.props.navigation.state.params;
    this.props.navigation.navigate('EpisodeSingle', {
      tracks,
      exercises,
      check,
      mode,
      episodeId,
      index,
      exerciseList,
      videoUrl,
    });
  }

  render() {
    const {
      title,
      description,
      category,
      exerciseList,
    } = this.props.navigation.state.params;
    const exercisesList = Object.entries(exerciseList).map(([key, value], i) => (
      <ListItem
        key={key}
        title={value.title}
        titleStyle={{ color: 'white' }}
        containerStyle={{ backgroundColor: '#33425a' }}
        underlayColor="#2a3545"
        onPress={() => {
          this.props.navigation.navigate('ExercisePlayer', {
            // videoUrl: value.videoUrl,
            videoUrl: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fsmall.mp4?alt=media&token=ff107dd4-0a01-41ce-a84a-4e65cf306e9c',
            exerciseId: key,
            title: value.title,
          });
        }}
      />
    ));
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={{ flexDirection: 'row', padding: 15 }}>
          <View style={styles.circularImageView}>
            <Image
              style={{
                height: 120,
                width: 120,
                borderRadius: 120 / 2,
              }}
              source={{ uri: this.state.url }}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text h4 style={styles.text}>
              {category}
            </Text>
            <Text style={styles.text}>
              Running Training
            </Text>
            <Text style={styles.text}>
              Workout time: 38:00
            </Text>
            <Text style={styles.text}>
              Total audio time: 40:00
            </Text>
            <Text style={styles.text}>
              Size: 40 MB
            </Text>
          </View>
        </View>
        <View>
          <Text h4 style={styles.text}>
            {`${title}`}
          </Text>
          <Text style={styles.text}>
            {description}
          </Text>
        </View>
        <View style={styles.buttonsViewContainer}>
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: 30 }}
              color="#001331"
              fontSize={18}
              title="Workout"
              onPress={() => this.navigateToEpisodeSingle(false, 'Workout Mode Player')}
            />
          </View>
          <View style={{
            width: 1,
            height: 30,
            backgroundColor: '#001331',
          }}
          />
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: 30 }}
              color="#001331"
              fontSize={18}
              title="Listen"
              onPress={() => this.navigateToEpisodeSingle(true, 'Listen Mode Player')}
            />
          </View>
        </View>
        <Text style={{ color: 'white', margin: 15 }}>
          EXERCISES IN EPISODE
        </Text>
        <View style={styles.line} />
        <View />
        {exercisesList}
      </ScrollView>
    );
  }
}
