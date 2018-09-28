import React from 'react';
import {
  ScrollView, View, StatusBar, Alert, Image,
} from 'react-native';
import { ListItem } from 'react-native-elements';

const episodesIcon = require('../../img/episodes.png');

const menu = {
  account: {
    title: 'Account', navigateTo: 'Account', iconName: 'account', iconType: 'material-community',
  },
  credits: {
    title: 'Credits', navigateTo: 'Credits', iconName: 'menu', iconType: 'entypo',
  },
  trailers: {
    title: 'Trailers', navigateTo: 'Trailers', iconName: 'soundcloud', iconType: 'entypo',
  },
  kickstarters: {
    title: 'Kickstarter Backers', navigateTo: 'Kickstarter', iconName: 'ios-ribbon', iconType: 'ionicon',
  },
  tutorial: {
    title: 'Tutorial', navigateTo: 'Tutorial', iconName: 'question', iconType: 'font-awesome',
  },
  tips: {
    title: 'FAQ', navigateTo: 'Tips', iconName: 'star', iconType: 'entypo',
  },
  downloads: {
    title: 'Manage Downloads', navigateTo: 'Downloads', iconName: 'ios-cloud-download', iconType: 'ionicon',
  },
  // purchases: {
  //   title: 'Restore Purchases', navigateTo: 'Purchases', iconName: 'replay', iconType: 'material-community',
  // },
  agreement: {
    title: 'User Agreement', navigateTo: 'Agreement', iconName: 'check', iconType: 'entypo',
  },
  feedback: {
    title: 'Feedback', navigateTo: 'Feedback', iconName: 'message-circle', iconType: 'feather',
  },
};

export default class More extends React.Component {
  static navigationOptions = {
    title: 'More',
  };

  componentWillMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
  }

  navigateTo = (navigateScreen) => {
    if (!this.state.isConnected && navigateScreen !== 'Downloads') {
      return Alert.alert('No internet connection');
    }
    this.props.navigation.navigate(navigateScreen);
  }

  render() {
    const menuList = Object.entries(menu).map(([key, value], i) => {
      return (
        <ListItem
          key={key}
          title={value.title}
          titleStyle={{ color: 'white', fontSize: 18 }}
          containerStyle={{ backgroundColor: '#33425a' }}
          leftIcon={value.title === 'Trailers'
            ? (
              <Image
                source={episodesIcon}
                style={{
                  height: 30, width: 30, tintColor: 'white', marginRight: 5,
                }}
              />
            )
            : {
              name: value.iconName,
              type: value.iconType,
              size: 30,
              color: 'white',
            }}
          underlayColor="#2a3545"
          onPress={() => this.navigateTo(value.navigateTo)}
        />
      );
    });
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        <StatusBar
          backgroundColor="#00000b"
        />
        <View style={{ height: 1, backgroundColor: 'gray' }} />
        <ScrollView>
          { menuList }
        </ScrollView>
      </View>
    );
  }
}
