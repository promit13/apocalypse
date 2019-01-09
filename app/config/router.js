import React from 'react';
import { Image } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import Login from '../User/Login';
import UserNew from '../User/UserNew';
import UserBodyDetail from '../User/UserBodyDetail';
import Tutorial from '../User/Tutorial';
import MyAccount from '../User/UserEdit';
import EpisodeSingle from '../Episodes/EpisodeSingle';
import EpisodeList from '../Episodes/EpisodeList';
import EpisodeView from '../Episodes/EpisodeView';
import ExercisePlayer from '../Exercises/ExercisePlayer';
import TalonScreen from '../Talon/TalonScreen';
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
import DownloadFiles from '../Episodes/DownloadFiles';
import DownloadPlayer from '../More/DownloadPlayer';
import ForgotPassword from '../User/ForgotPassword';
import LoginSignup from '../User/LoginSignup';
import DownloadTestPlayer from '../More/DownloadTestPlayer';
import SplashScreen from '../common/Splashscreen';

const talonIcon = require('../../img/talondark.png');
const episodeIcon = require('../../img/episodes.png');
const exerciseIcon = require('../../img/exercises.png');

export const SignedOut = createStackNavigator({
  SplashScreen: { screen: SplashScreen },
  LoginSignup: { screen: LoginSignup },
  Login: { screen: Login },
  Signup: { screen: UserNew },
  Agreement: { screen: Agreement },
  ForgotPassword: { screen: ForgotPassword },
  UserBodyDetail: { screen: UserBodyDetail },
},
{
  navigationOptions: {
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
  },
});
export const UserDetails = createStackNavigator({
  UserBodyDetail: { screen: UserBodyDetail },
  Tutorial: { screen: Tutorial },
},
{
  navigationOptions: {
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
});
export const TutorialDisplay = createStackNavigator({
  Tutorial: { screen: Tutorial },
},
{
  navigationOptions: {
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
});

const EpisodeStack = createStackNavigator({
  SplashScreen: { screen: SplashScreen },
  EpisodeList: { screen: EpisodeList },
  EpisodeView: { screen: EpisodeView },
  TalonScreen: { screen: TalonScreen },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
  ExercisePlayer: { screen: ExercisePlayer },
  EpisodeSingle: { screen: EpisodeSingle },
  DownloadFiles: { screen: DownloadFiles },
  DownloadPlayer: { screen: DownloadPlayer },
  DownloadTestPlayer: { screen: DownloadTestPlayer },
}, {
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }),
});

EpisodeStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index === 0 || navigation.state.index > 1) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const ExerciseStack = createStackNavigator({
  ExerciseCategory: { screen: ExerciseCategory },
  ExerciseList: { screen: ExerciseList },
  ExercisePlayer: { screen: ExercisePlayer },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
},
{
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }),
});

ExerciseStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const TalonStack = createStackNavigator({
  TalonScreen: { screen: TalonScreen },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
},
{
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }),
});

TalonStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const MoreStack = createStackNavigator({
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
  DownloadPlayer: { screen: DownloadPlayer },
  EpisodeView: { screen: EpisodeView },
  ExercisePlayer: { screen: ExercisePlayer },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
  UserBodyDetail: { screen: UserBodyDetail },
  DownloadTestPlayer: { screen: DownloadTestPlayer },
},
{
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }),
});

MoreStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

export const SignedIn = createBottomTabNavigator({
  Episodes: EpisodeStack,
  Exercises: ExerciseStack,
  TALON: TalonStack,
  More: MoreStack,
}, {
  // initialRouteName: 'Episode',

  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      if (routeName === 'More') {
        return <Icon name="dots-three-horizontal" type="entypo" size={30} color={tintColor} />;
        // return (
        //   <View>
        //     <Badge
        //       wrapperStyle={{ marginBottom: -20, marginLeft: 40, zIndex: 2 }}
        //       value={5}
        //       containerStyle={{ padding: 7, backgroundColor: 'red' }}
        //     />
        //     <Icon name="dots-three-horizontal" type="entypo" size={35} color={tintColor} />
        //   </View>
        // );
      }
      if (routeName === 'TALON') {
        // return <Icon name="connectdevelop" type="font-awesome" size={30} color={tintColor} />;
        return <Image source={talonIcon} style={{ height: 30, width: 30, tintColor }} />;
      }
      if (routeName === 'Exercises') {
        // return <Icon name="man" type="entypo" size={30} color={tintColor} />;
        return <Image source={exerciseIcon} style={{ height: 36, width: 20, tintColor }} />;
      }
      if (routeName === 'Episodes') {
        // return <Icon name="soundcloud" type="entypo" size={30} color={tintColor} />;
        return <Image source={episodeIcon} style={{ height: 30, width: 35, tintColor }} />;
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
