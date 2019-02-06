import React from 'react';
import {
  ScrollView, View, StatusBar, Alert, Image, Linking,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { ListItem } from 'react-native-elements';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';

const episodesIcon = require('../../img/episodes.png');

const menu = {
  account: { 
    title: 'My Account', navigateTo: 'Account', iconName: 'account', iconType: 'material-community',
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

  state = {
    showNoInternetDialog: false,
  }

  sendEmail = () => {
    Linking.openURL('mailto:appfeedback@imaginactive-fitness.com?subject=AST Feedback&body=Description');
  }

  navigateTo = (navigateScreen) => {
    const { netInfo } = this.props.screenProps;
    if (!netInfo && navigateScreen !== 'Downloads') {
      return this.setState({ showNoInternetDialog: true });
    }
    if (navigateScreen === 'Feedback') {
      return this.sendEmail();
    }
    this.props.navigation.navigate(navigateScreen, { showButton: false, showCheckbox: false });
    // showButton for tutorial, showCheckbox for Agreement
  }

  render() {
    const { showNoInternetDialog } = this.state;
    const { netInfo } = this.props.screenProps;
    const menuList = Object.entries(menu).map(([key, value], i) => {
      return (
        <ListItem
          key={key}
          title={value.title}
          titleStyle={{ color: 'white', fontSize: moderateScale(18) }}
          containerStyle={{ backgroundColor: '#33425a' }}
          leftIcon={value.title === 'Trailers'
            ? (
              <Image
                source={episodesIcon}
                style={{
                  height: moderateScale(30), width: moderateScale(30), tintColor: 'white', marginRight: moderateScale(5),
                }}
              />
            )
            : {
              name: value.iconName,
              type: value.iconType,
              size: moderateScale(30),
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
        { !netInfo ? <OfflineMsg /> : null }
        <ShowModal
          visible={showNoInternetDialog}
          title="Please check your internet connection"
          buttonText="OK"
          onPress={() => {
            this.setState({ showNoInternetDialog: false });
          }}
        />
        <ScrollView>
          { menuList }
        </ScrollView>
      </View>
    );
  }
}
