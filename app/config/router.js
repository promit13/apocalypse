import { createStackNavigator, createBottomTabNavigator, StackNavigator } from 'react-navigation';
import React from 'react';
import { Text, View } from 'react-native';
import Login from '../Login';
import Play from '../Play';
import UserEdit from '../User/UserEdit';
import EpisodeSingle from '../Episodes/EpisodeSingle';
import EpisodeList from '../Episodes/EpisodeList';
import Exercise from '../Exercise';

export const SignedOut = createStackNavigator({
  Login: {
    screen: Login,
    title: 'Login',
    navigationOptions: () => ({
      title: 'Login',
      headerTransparent: true,
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
});
export const SignedIn = createBottomTabNavigator({
  Profile: { screen: UserEdit },
  Episode: {
    screen: StackNavigator({
      Session: { screen: EpisodeList },
      EpisodeSingle: { screen: EpisodeSingle },
      Exercise: { screen: Exercise },
    }),
    navigationOptions: () => ({
      title: 'Exercise',
      headerTransparent: true,
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
}, {
  initialRouteName: 'Profile',

  tabBarOptions: {
    activeTintColor: 'black',
    inactiveTintColor: '#3e2465',
    activeBackgroundColor: '#694fad',
  },
});

export const PlayerFlow = createStackNavigator({
  Home: {
    screen: Play,
    title: 'Play',
    navigationOptions: () => ({
      title: 'Player',
      headerTransparent: true,
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
  Exercise: {
    screen: Exercise,
    navigationOptions: () => ({
      title: 'Exercise',
    }),
  },
});
