import React from 'react';
import { Image, View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

const styles = {
  containerStyle: {
    flex: 1,
    backgroundColor: '#001331',
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'center',
  },
  textStyle: {
    marginTop: 20,
    color: 'white',
    textAlign: 'center',
  },
  imageStyle: {
    height: 200,
    width: 200,
  },
  slideStyle: {
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
    title: 'Tutorials',
  };

  state = {
    tutorials: '',
    loading: true,
    showButton: false,
  }

  componentDidMount() {
    const { showButton } = this.props.navigation.state.params;
    firebase.database().ref('tutorials').on('value', (snapshot) => {
      // this.setState({ tutorials: snapshot.val(), loading: false, showButton });
      const tutorials = Object.values(snapshot.val());
      const sortedTutorialArray = tutorials.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
      this.setState({ tutorials: sortedTutorialArray, loading: false, showButton });
    });
  }

  render() {
    const tutorials = Object.entries(this.state.tutorials).map(([key, value], i) => {
      return (
        <ScrollView>
          <View style={styles.slideStyle}>
            {/* <Text style={styles.textStyle}>
              {value.title}
            </Text> */}
            <Image resizeMode="contain" style={styles.imageStyle} source={{ uri: value.file }} />
            <Text style={styles.textStyle}>
              {value.description}
            </Text>
          </View>
        </ScrollView>
      );
    });
    if (this.state.loading) return <Loading />;
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
          this.state.showButton
          && (<Button
            buttonStyle={styles.buttonStyle}
            title="Take me in"
            onPress={() => firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
              tutorial: true,
            })}
          />
          )
        }
      </View>
    );
  }
}
