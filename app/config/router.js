import React from 'react';
import { View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon, Badge } from 'react-native-elements';
import Login from '../Login';
import UserNew from '../User/UserNew';
import UserBodyDetail from '../User/UserBodyDetail';
import Tutorial from '../User/Tutorial';
import Play from '../Play';
import UserEdit from '../User/UserEdit';
import EpisodeSingle from '../Episodes/EpisodeSingle';
import EpisodeList from '../Episodes/EpisodeList';
import EpisodeView from '../Episodes/EpisodeView';
import ExercisePlayer from '../ExercisePlayer';
import SeasonList from '../SeasonList';
import Talon from '../Talon/Talon';
import TalonEssentialIntel from '../Talon/TalonEssentialIntel';
import TalonIntelPlayer from '../Talon/TalonIntelPlayer';
import ExerciseCategory from '../Exercises/ExerciseCategory';
import ExerciseList from '../Exercises/ExerciseList';
import More from '../More/More';

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
  Signup: {
    screen: createStackNavigator({
      Signup: { screen: UserNew },
      UserBodyDetail: { screen: UserBodyDetail },
      Tutorial: { screen: Tutorial },
    }),
    navigationOptions: () => ({
      title: 'Signup',
      headerTransparent: true,
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
}, {
  initialRouteName: 'Login',
});
export const UserDetails = createStackNavigator({
  UserBodyDetail: { screen: UserBodyDetail },
  Tutorial: { screen: Tutorial },
});
export const TutorialDisplay = createStackNavigator({
  Tutorial: { screen: Tutorial },
});
export const SignedIn = createBottomTabNavigator({
  Episode: {
    screen: createStackNavigator({
      SeasonList: { screen: SeasonList },
      EpisodeList: { screen: EpisodeList },
      EpisodeView: { screen: EpisodeView },
      EpisodeSingle: { screen: EpisodeSingle },
      ExercisePlayer: { screen: ExercisePlayer },
    }),
    navigationOptions: () => ({
      title: 'Episodes',
      headerStyle: {
        backgroundColor: '#001331',
      },
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
  Exercises: {
    screen: createStackNavigator({
      ExerciseCategory: { screen: ExerciseCategory },
      ExerciseList: { screen: ExerciseList },

    }),
    navigationOptions: () => ({
      title: 'Exercises',
      headerTransparent: false,
      headerStyle: {
        backgroundColor: '#001331',
      },
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
  Talon: {
    screen: createStackNavigator({
      Talon: { screen: Talon },
      TalonEssentialIntel: { screen: TalonEssentialIntel },
      TalonIntelPlayer: { screen: TalonIntelPlayer },
    }),
    navigationOptions: () => ({
      title: 'Talon',
      headerTransparent: false,
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
  More: {
    screen: createStackNavigator({
      More: { screen: More },
      Account: { screen: UserEdit },
    }),
  },
}, {
  initialRouteName: 'Episode',

  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      if (routeName === 'More') {
        return (
          <View>
            <Badge
              wrapperStyle={{ marginBottom: -20, marginLeft: 40, zIndex: 2 }}
              value={5}
              containerStyle={{ padding: 7, backgroundColor: 'orange' }}
            />
            <Icon name="dots-three-horizontal" type="entypo" size={35} color={tintColor} />
          </View>
        );
      }
      if (routeName === 'Talon') {
        return <Icon name="network" type="entypo" size={30} color={tintColor} />;
      }
      if (routeName === 'Exercises') {
        return <Icon name="man" type="entypo" size={30} color={tintColor} />;
      }
      if (routeName === 'Episode') {
        return <Icon name="soundcloud" type="entypo" size={30} color={tintColor} />;
      }
    },
  }),

  tabBarOptions: {
    activeTintColor: '#f5cb23',
    inactiveTintColor: '#fff',
    activeBackgroundColor: '#001331',
    inactiveBackgroundColor: '#001331',
    style: { height: 65 },
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
  ExercisePlayer: {
    screen: ExercisePlayer,
    navigationOptions: () => ({
      title: 'Exercise',
    }),
  },
});
