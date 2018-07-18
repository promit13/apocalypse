import React from 'react';
import { View, Image } from 'react-native';
import {  Button, Text } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import firebase from '../config/firebase';

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

export const TUTORIALS = [
  {
    title: 'Tutorial 1',
    description: 'This is tutorial one. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
  },
  {
    title: 'Tutorial 2',
    description: 'This is tutorial two. TLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
  },
  {
    title: 'Tutorial 3',
    description: 'This is tutorial three. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
  },
  {
    title: 'Tutorial 4',
    description: 'This is tutorial Four. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
  },
  {
    title: 'Tutorial 5',
    description: 'This is tutorial Five. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
  },
  {
    title: 'Tutorial 6',
    description: 'This is tutorial Six. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
  },
];

export default class Tutorial extends React.Component {
  registerData = (e, state) => {
    if (state.index === (TUTORIALS.length - 1)) {
      firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
        tutorial: true,
      });
    }
  }

  render() {
    const tutorials = Object.entries(TUTORIALS).map(([key, value], i) => {
      return (
        <View style={styles.slideStyle}>
          <Text style={styles.textStyle}>
            {value.title}
          </Text>
          <Image style={styles.imageStyle} source={{ uri: value.imageUrl }} />
          <Text style={styles.textStyle}>
            {value.description}
          </Text>
        </View>
      );
    });
    return (
      <Swiper showsButtons onMomentumScrollEnd={this.registerData}>
        {tutorials}
      </Swiper>
    );
  }
}
