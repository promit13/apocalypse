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
    padding: 20,
  },
  textStyle: {
    marginTop: 10,
    marginLeft: 10,
    color: 'white',
    alignSelf: 'center',
  },
  imageStyle: {
    width: 200,
    height: 200,
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
  }

  componentDidMount() {
    firebase.database().ref('tutorials').on('value', snapshot => this.setState({ tutorials: snapshot.val(), loading: false }));
  }

  render() {
    const tutorials = Object.entries(this.state.tutorials).map(([key, value], i) => {
      return (
        <ScrollView>
          <View style={styles.slideStyle}>
            {/* <Text style={styles.textStyle}>
              {value.title}
            </Text> */}
            <Image style={styles.imageStyle} source={{ uri: value.file }} />
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
        <Button
          buttonStyle={styles.buttonStyle}
          title="Take me in"
          onPress={() => firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
            tutorial: true,
          })}
        />
      </View>
    );
  }
}
