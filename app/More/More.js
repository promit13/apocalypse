import React from 'react';
import {
  ScrollView, View, StatusBar, Alert, Image, Linking, TouchableOpacity,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { ListItem, Icon, Text } from 'react-native-elements';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';

const episodesIcon = require('../../img/episodes.png');

const menu = {
  account: { 
    title: 'My Account', navigateTo: 'Account', iconName: 'account', iconType: 'material-community', margin: 7,
  },
  credits: {
    title: 'Credits', navigateTo: 'Credits', iconName: 'menu', iconType: 'entypo', margin: 7,
  },
  trailers: {
    title: 'Trailers', navigateTo: 'Trailers', iconName: 'soundcloud', iconType: 'entypo', margin: 0,
  },
  kickstarters: {
    title: 'Kickstarter Backers', navigateTo: 'Kickstarter', iconName: 'ios-ribbon', iconType: 'ionicon', margin: 12,
  },
  tutorial: {
    title: 'Tutorial', navigateTo: 'Tutorial', iconName: 'question', iconType: 'font-awesome', margin: 18,
  },
  tips: {
    title: 'FAQ', navigateTo: 'Tips', iconName: 'star', iconType: 'entypo', margin: 5,
  },
  downloads: {
    title: 'Manage Downloads', navigateTo: 'Downloads', iconName: 'ios-cloud-download', iconType: 'ionicon', margin: 8,
  },
  agreement: {
    title: 'User Agreement', navigateTo: 'Agreement', iconName: 'check', iconType: 'entypo', margin: 5,
  },
  feedback: {
    title: 'Feedback', navigateTo: 'Feedback', iconName: 'message-circle', iconType: 'feather', margin: 5,
  },
  // notification: {
  //   title: 'Notification', navigateTo: 'Notification', iconName: 'bell', iconType: 'feather', margin: 5,
  // },
};

const styles = {
  itemContainers: {
    backgroundColor: '#33425a',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(10),
  },
  titleStyle: {
    color: 'white',
    fontSize: moderateScale(18),
    marginLeft: moderateScale(10),
    flex: 0.7,
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
    const screenArray = ['Downloads', 'Tips', 'Agreement', 'Tutorial', 'Credits', 'Kickstarter'];
    if (!netInfo && !screenArray.includes(navigateScreen)) {
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
                  height: moderateScale(30),
                  width: moderateScale(30),
                  tintColor: 'white',
                  marginRight: moderateScale(7),
                }}
              />
            )
            : {
              name: value.iconName,
              type: value.iconType,
              size: moderateScale(30),
              color: 'white',
              style: { marginRight: moderateScale(value.margin) },
            }}
          underlayColor="#2a3545"
          onPress={() => this.navigateTo(value.navigateTo)}
        />
        // <View>
        //   <TouchableOpacity onPress={() => this.navigateTo(value.navigateTo)}>
        //     <View style={styles.itemContainers}>
        //       <View style={{ flexDirection: 'row' }}>
        //         {value.title === 'Trailers'
        //           ? (
        //             <Image
        //               source={episodesIcon}
        //               style={{
        //                 height: moderateScale(30),
        //                 width: moderateScale(30),
        //                 tintColor: 'white',
        //                 marginRight: moderateScale(10),
        //               }}
        //             />
        //           )
        //           : (
        //             <Icon
        //               name={value.iconName}
        //               type={value.iconType}
        //               size={moderateScale(30)}
        //               color="white"
        //               underlayColor="#2a3545"
        //               onPress={() => this.navigateTo(value.navigateTo)}
        //               style={{ flex: 0.3 }}
        //             />
        //           )
        //         }
        //         <Text style={styles.titleStyle}>
        //           {value.title}
        //         </Text>
        //       </View>
        //       <Icon
        //         name="chevron-right"
        //         type="entypo"
        //         size={moderateScale(30)}
        //         color="white"
        //         underlayColor="#2a3545"
        //         style={{ alignSelf: 'flex-end' }}
        //       />
        //     </View>
        //     <View style={{ flex: 1, backgroundColor: 'white', height: 1 }} />
        //   </TouchableOpacity>
        // </View>
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
