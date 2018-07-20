import React from 'react';
import { Image, View } from 'react-native';
import { Text, Button } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

const styles = {
  containerStyle: {
    flex: 1,
  },
  textStyle: {
    marginTop: 10,
  },
  imageStyle: {
    width: 200,
    height: 200,
  },
  slideStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 20,
  },
};

export default class Tutorial extends React.Component {
  state = {
    tutorials: '',
    loading: true,
  }

  componentDidMount() {
    firebase.database().ref('tutorials').on('value', snapshot => this.setState({ tutorials: snapshot.val(), loading: false }));
  }

  renderButton = (i) => {
    if (i === (Object.keys(this.state.tutorials).length - 1)) {
      return (
        <Button
          title="Finish"
          onPress={() => firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
            tutorial: true,
          })
      }
        />
      );
    }
  }

  render() {
    const tutorials = Object.entries(this.state.tutorials).map(([key, value], i) => {
      return (
        <View style={styles.slideStyle}>
          <Text style={styles.textStyle}>
            {value.title}
          </Text>
          <Image style={styles.imageStyle} source={{ uri: value.file }} />
          <Text style={styles.textStyle}>
            {value.description}
          </Text>
          {this.renderButton(i)}
        </View>
      );
    });
    if (this.state.loading) return <Loading />;
    return (
      <Swiper
        loop={false}
        showsButtons
      >
        {tutorials}
      </Swiper>
    );
  }
}
