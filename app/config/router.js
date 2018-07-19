import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import Login from '../Login';
import UserNew from '../User/UserNew';
import UserBodyDetail from '../User/UserBodyDetail';
import Tutorial from '../User/Tutorial';
import Play from '../Play';
import UserEdit from '../User/UserEdit';
import EpisodeSingle from '../Episodes/EpisodeSingle';
import EpisodeList from '../Episodes/EpisodeList';
import EpisodeView from '../Episodes/EpisodeView';
import Exercise from '../Exercise';
import SeasonList from '../SeasonList';
import Talon from '../Talon/Talon';
import TalonEssentialIntel from '../Talon/TalonEssentialIntel';
import TalonIntelPlayer from '../Talon/TalonIntelPlayer';

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
  Profile: { screen: UserEdit },
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
  Episode: {
    screen: createStackNavigator({
      SeasonList: { screen: SeasonList },
      EpisodeList: { screen: EpisodeList },
      EpisodeView: { screen: EpisodeView },
      EpisodeSingle: { screen: EpisodeSingle },
      Exercise: { screen: Exercise },
    }),
    navigationOptions: () => ({
      title: 'Exercise',
      headerTransparent: false,
      headerTitleStyle: {
        color: 'white',
      },
    }),
  },
}, {
  initialRouteName: 'Episode',

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
