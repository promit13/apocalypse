import React from 'react';
import { createStackNavigator } from 'react-navigation';

import Play from './../Play';
import Exercise from './../Exercise';

export default SignedIn = createStackNavigator({
  Home: {
    screen: Play,
    title: 'Play',
    navigationOptions: ({ navigation }) => ({
      title: 'Player',
      headerTransparent: true,
      headerTitleStyle: {
      	color: 'white'
      }
    }),
  },
  Exercise: {
    screen: Exercise,
    navigationOptions: ({ navigation }) => ({
      title: 'Exercise',
    }),
  },
});
