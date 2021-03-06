import React from 'react';
import { Image, Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { moderateScale, scale } from 'react-native-size-matters';
import Login from '../User/Login';
import UserNew from '../User/UserNew';
import UserBodyDetail from '../User/UserBodyDetail';
import Tutorial from '../User/Tutorial';
import MyAccount from '../User/UserEdit';
import EpisodeSingle from '../Episodes/EpisodeSingle';
import EpisodeList from '../Episodes/EpisodeList';
import EpisodeView from '../Episodes/EpisodeView';
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
import DownloadPlayer from '../More/DownloadPlayer';
import ForgotPassword from '../User/ForgotPassword';
import LoginSignup from '../User/LoginSignup';
import TrialEpisodeList from '../Episodes/TrialEpisodeList';

const talonIcon = require('../../img/talondark.png');
const episodeIcon = require('../../img/episodes.png');
const exerciseIcon = require('../../img/exercises.png');

export const SignedOut = createStackNavigator({
  LoginSignup: { screen: LoginSignup },
  Login: { screen: Login },
  Signup: { screen: UserNew },
  Agreement: { screen: Agreement },
  ForgotPassword: { screen: ForgotPassword },
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
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
  },
});

const TrialStack = createStackNavigator({
  Tutorial: { screen: Tutorial },
  TrialEpisodeList: { screen: TrialEpisodeList },
  EpisodeView: { screen: EpisodeView },
  EpisodeSingle: { screen: EpisodeSingle },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
  LoginSignup: { screen: LoginSignup },
  Login: { screen: Login },
  Signup: { screen: UserNew },
  Agreement: { screen: Agreement },
  ForgotPassword: { screen: ForgotPassword },
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
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
  },
});

TrialStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = false;
  if (navigation.state.index === 0) {
    tabBarVisible = true;
  }
  return {
    tabBarVisible,
  };
};

// export const SignedOutContainer = createAppContainer(SignedOut);

// export const UserDetails = createStackNavigator({
//   UserBodyDetail: { screen: UserBodyDetail },
//   Tutorial: { screen: Tutorial },
// },
// {
//   navigationOptions: {
//     headerStyle: {
//       backgroundColor: '#001331',
//     },
//     headerTintColor: '#fff',
//     headerTitleStyle: {
//       fontWeight: 'bold',
//       fontSize: moderateScale(16),
//     },
//   },
// });

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
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
  },
});

// export const TutorialDisplayContainer = createAppContainer(TutorialDisplay);

const EpisodeStack = createStackNavigator({
  EpisodeList: { screen: EpisodeList },
  EpisodeView: { screen: EpisodeView },
  TalonScreen: { screen: TalonScreen },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
  EpisodeSingle: { screen: EpisodeSingle },
  DownloadPlayer: { screen: DownloadPlayer },
}, {
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      color: '#fff',
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
  }),
});

EpisodeStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index === 1 || navigation.state.index === 2) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const ExerciseStack = createStackNavigator({
  ExerciseCategory: { screen: ExerciseCategory },
  ExerciseList: { screen: ExerciseList },
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
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
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
  Agreement: { screen: Agreement },
  LoginSignup: { screen: LoginSignup },
  Login: { screen: Login },
  Signup: { screen: UserNew },
  ForgotPassword: { screen: ForgotPassword },
},
{
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
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
  EpisodeView: { screen: EpisodeView },
  TalonIntelPlayer: { screen: TalonIntelPlayer },
  LoginSignup: { screen: LoginSignup },
  Login: { screen: Login },
  Signup: { screen: UserNew },
  ForgotPassword: { screen: ForgotPassword },
},
{
  navigationOptions: () => ({
    headerStyle: {
      backgroundColor: '#001331',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: moderateScale(16),
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Arial',
    },
    gesturesEnabled: false,
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

  navigationOptions: ({ navigation, horizontal }) => ({
    tabBarLabel: navigation.state.routeName,
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      if (routeName === 'More') {
        return <Icon name="dots-three-horizontal" type="entypo" size={horizontal ? moderateScale(20) : moderateScale(30)} color={tintColor} />;
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
        return <Image source={talonIcon} style={{ height: moderateScale(30), width: moderateScale(30), tintColor }} />;
      }
      if (routeName === 'Exercises') {
        // return <Icon name="man" type="entypo" size={30} color={tintColor} />;
        return <Image source={exerciseIcon} style={{ height: moderateScale(36), width: moderateScale(20), tintColor }} />;
      }
      if (routeName === 'Episodes') {
        // return <Icon name="soundcloud" type="entypo" size={30} color={tintColor} />;
        return <Image source={episodeIcon} style={{ height: moderateScale(30), width: moderateScale(35), tintColor }} />;
      }
    },
  }),
  tabBarOptions: {
    activeTintColor: '#f5cb23',
    inactiveTintColor: '#fff',
    activeBackgroundColor: '#001331',
    inactiveBackgroundColor: '#001331',
    style: { height: moderateScale(75), backgroundColor: '#001331', paddingVertical: 5 }, // set to 65 for ios
    tabStyle: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelStyle: {
      marginLeft: 0,
      marginTop: moderateScale(4),
      fontSize: moderateScale(10),
    },
    safeAreaInset: { bottom: 'never' },
  },
});

// export const SignedInContainer = createAppContainer(SignedIn);

export const TrialBottomNavigator = createBottomTabNavigator({
  Episodes: TrialStack,
  Exercises: ExerciseStack,
  TALON: TalonStack,
  More: MoreStack,
}, {
  // initialRouteName: 'Episode',

  navigationOptions: ({ navigation, horizontal }) => ({
    tabBarLabel: navigation.state.routeName,
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      if (routeName === 'More') {
        return <Icon name="dots-three-horizontal" type="entypo" size={horizontal ? moderateScale(20) : moderateScale(30)} color={tintColor} />;
      }
      if (routeName === 'TALON') {
        return <Image source={talonIcon} style={{ height: moderateScale(30), width: moderateScale(30), tintColor }} />;
      }
      if (routeName === 'Exercises') {
        return <Image source={exerciseIcon} style={{ height: moderateScale(36), width: moderateScale(20), tintColor }} />;
      }
      if (routeName === 'Episodes') {
        return <Image source={episodeIcon} style={{ height: moderateScale(30), width: moderateScale(35), tintColor }} />;
      }
    },
  }),
  tabBarOptions: {
    activeTintColor: '#f5cb23',
    inactiveTintColor: '#fff',
    activeBackgroundColor: '#001331',
    inactiveBackgroundColor: '#001331',
    style: { height: moderateScale(75), backgroundColor: '#001331', paddingVertical: 5 }, // set to 65 for ios
    tabStyle: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelStyle: {
      marginLeft: 0,
      marginTop: moderateScale(4),
      fontSize: moderateScale(10),
    },
    safeAreaInset: { bottom: 'never' },
  },
});