import React from 'react';
import { View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon, Badge } from 'react-native-elements';
import Login from '../Login';
import UserNew from '../User/UserNew';
import UserBodyDetail from '../User/UserBodyDetail';
import Tutorial from '../User/Tutorial';
import Play from '../Play';
import MyAccount from '../User/UserEdit';
import EpisodeSingle from '../Episodes/EpisodeSingle';
import EpisodeList from '../Episodes/EpisodeList';
import EpisodeView from '../Episodes/EpisodeView';
import ExercisePlayer from '../Exercises/ExercisePlayer';
import Talon from '../Talon/Talon';
import TalonEssentialIntel from '../Talon/TalonEssentialIntel';
import TalonIntelPlayer from '../Talon/TalonIntelPlayer';
import ExerciseCategory from '../Exercises/ExerciseCategory';
import ExerciseList from '../Exercises/ExerciseList';
import More from '../More/More';
import Agreement from '../More/Agreement';
import Credits from '../More/Credits';
import Downloads from '../More/Downloads';
import Feedback from '../More/Feedback';
import Kickstarter from '../More/Kickstarter';
import Purchases from '../More/Purchases';
import Tips from '../More/Tips';
import Trailers from '../More/Trailers';
import ChangeEmailPassword from '../User/ChangeEmailPassword';

const homeTabbarVisible = (navigation, screen) => {
  const { routes } = navigation.state;
  if (routes && routes.length > 0) {
    const route = routes[routes.length - 1];
    if (route.routeName === screen) {
      return false;
    }
  }
  return true;
};

export const SignedOut = createStackNavigator({
  Login: { screen: Login },
  Signup: { screen: UserNew },
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
      EpisodeList: { screen: EpisodeList },
      EpisodeView: { screen: EpisodeView },
      EpisodeSingle: { screen: EpisodeSingle },
      ExercisePlayer: { screen: ExercisePlayer },
    }),
    navigationOptions: ({ navigation }) => ({
      title: 'Episodes',
      headerStyle: {
        backgroundColor: '#001331',
      },
      headerTitleStyle: {
        color: 'white',
      },
      tabBarVisible: homeTabbarVisible(navigation, 'EpisodeSingle'),
    }),
  },
  Exercises: {
    screen: createStackNavigator({
      ExerciseCategory: { screen: ExerciseCategory },
      ExerciseList: { screen: ExerciseList },
      ExercisePlayer: { screen: ExercisePlayer },
    }),
    navigationOptions: ({ navigation }) => ({
      title: 'Exercises',
      headerTransparent: false,
      headerStyle: {
        backgroundColor: '#001331',
      },
      headerTitleStyle: {
        color: 'white',
      },
      tabBarVisible: homeTabbarVisible(navigation, 'ExercisePlayer'),
    }),
  },
  Talon: {
    screen: createStackNavigator({
      Talon: { screen: Talon },
      TalonEssentialIntel: { screen: TalonEssentialIntel },
      TalonIntelPlayer: { screen: TalonIntelPlayer },
    }),
    navigationOptions: ({ navigation }) => ({
      title: 'Talon',
      headerTransparent: false,
      headerTitleStyle: {
        color: 'white',
      },
      tabBarVisible: homeTabbarVisible(navigation, 'TalonIntelPlayer'),
    }),
  },
  More: {
    screen: createStackNavigator({
      More: { screen: More },
      Account: { screen: MyAccount },
      Agreement: { screen: Agreement },
      Credits: { screen: Credits },
      Downloads: { screen: Downloads },
      Feedback: { screen: Feedback },
      Kickstarter: { screen: Kickstarter },
      Purchases: { screen: Purchases },
      Tips: { screen: Tips },
      Trailers: { screen: Trailers },
      Tutorial: { screen: Tutorial },
      ChangeEmailPassword: { screen: ChangeEmailPassword },
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
