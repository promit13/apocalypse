import React from 'react';
import { Image, View, ScrollView, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

const { width } = Dimensions.get('window');
const imageSize = width - 90;

const styles = {
  containerStyle: {
    flex: 1,
    backgroundColor: '#001331',
    paddingBottom: 10,
    paddingTop: 30,
    justifyContent: 'center',
  },
  swiperContainer: {
    flex: 1,
    alignItems: 'center',
  },
  textStyle: {
    marginTop: 20,
    color: 'white',
    textAlign: 'center',
  },
  imageStyle: {
    height: imageSize,
    width: imageSize,
  },
  slideStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    backgroundColor: '#001331',
    borderColor: '#f5cb23',
    borderRadius: 20,
    borderWidth: 2,
  },
};

export default class Tutorial extends React.Component {
  static navigationOptions = {
    title: 'Tutorial',
  };

  state = {
    tutorials: '',
    loading: true,
    showButton: false,
  }

  componentDidMount() {
    const showButton = this.props.navigation.state.params === undefined ? true : false;
    firebase.database().ref('tutorials').on('value', (snapshot) => {
      // this.setState({ tutorials: snapshot.val(), loading: false, showButton });
      const tutorials = Object.values(snapshot.val());
      const sortedTutorialArray = tutorials.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
      this.setState({ tutorials: sortedTutorialArray, loading: false, showButton });
    });
  }

  render() {
    const { loading, showButton } = this.state;
    const tutorials = Object.entries(this.state.tutorials).map(([key, value], i) => {
      return (
        <ScrollView>
          <View style={styles.slideStyle}>
            <Image resizeMode="contain" style={styles.imageStyle} source={{ uri: value.file }} />
            <Text style={styles.textStyle}>
              {value.description}
            </Text>
          </View>
        </ScrollView>
      );
    });
    return (
      <View style={styles.containerStyle}>
        <Swiper
          loop={false}
          // showsButtons // shows side arrows
          dotColor="#696238"
          activeDotColor="#f5cb23"
        >
          {tutorials}
        </Swiper>
        {
              showButton
              && (<Button
                buttonStyle={styles.buttonStyle}
                title="Take me in"
                onPress={() => firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
                  tutorial: true,
                })}
              />
              )
            }
        {/* <View style={{ flex: 1 }}>
          <View style={styles.swiperContainer}>
            <Swiper
              loop={false}
              // showsButtons // shows side arrows
              dotColor="#696238"
              activeDotColor="#f5cb23"
            >
              {tutorials}
            </Swiper>
          </View>
          {
        showButton
        && (<Button
          buttonStyle={styles.buttonStyle}
          title="Take me in"
          onPress={() => firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
            tutorial: true,
          })}
        />
        )
      }
        </View> */}
      </View>
    );
  }
}
