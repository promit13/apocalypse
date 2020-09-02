import React from 'react';
import {
  ScrollView, View, StatusBar, Alert, Image, Linking, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { ListItem, Icon, Text, Button } from 'react-native-elements';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';
import ErrorMessage from '../common/Error';
import Loading from '../common/Loading';
import firebase from '../config/firebase';

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
  // downloads: {
  //   title: 'Manage Downloads', navigateTo: 'Downloads', iconName: 'ios-cloud-download', iconType: 'ionicon', margin: 8,
  // },
  agreement: {
    title: 'User Agreement', navigateTo: 'Agreement', iconName: 'check', iconType: 'entypo', margin: 5,
  },
  feedback: {
    title: 'Feedback', navigateTo: 'Feedback', iconName: 'message-circle', iconType: 'feather', margin: 5,
  },
  redeem: {
    title: 'Redeem Code', navigateTo: 'Redeem', iconName: 'redeem', iconType: 'material', margin: 5,
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
  modalView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: moderateScale(10),
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    padding: moderateScale(10),
  },
  inputStyle: {
    borderColor: '#001331',
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(2),
    padding: moderateScale(10),
    height: moderateScale(40),
    color: '#001331',
    margin: moderateScale(10),
    fontSize: moderateScale(12),
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: '#001331',
  },
  textStyle: {
    color: '#001331',
    alignSelf: 'center',
  }
};

export default class More extends React.Component {
  static navigationOptions = {
    title: 'More',
  };
  
  state = {
    showNoInternetDialog: false,
    showRedeemPopUp: false,
    showLoading: false,
    showError: false,
    code: '',
    modalMessage: '',
    description: '',
  }

  sendEmail = () => {
    Linking.openURL('mailto:appfeedback@imaginactive-fitness.com?subject=AST Feedback&body=Description');
  }

  checkRedeemCode = (code) => {
    const { uid } = this.props.screenProps.user;
    if (uid === code) {
      firebase.database().ref(`userDatas/${uid}/code`).set({
        hasRedeemCode: true,
      }).then(() => this.setState({
        showError: false,
        showLoading: false,
        showRedeemPopUp: false,
        showNoInternetDialog: true,
        modalMessage: 'Code check successful',
        description: 'Return to the home page to access the Part 1 Special Offer',
      }));
    } else {
      this.setState({ showError: true, showLoading: false });
    }
  }

  showModal = () => {
    const { showRedeemPopUp, showLoading, showError, code } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      <Modal transparent visible={showRedeemPopUp}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={() => this.setState({ showRedeemPopUp: false })}>
            <View style={styles.modalInnerView}>
              <Text style={[styles.textStyle, { fontWeight: 'bold' }]}>
                Got a code to redeem?
              </Text>
              <Text style={[styles.textStyle, {marginTop: 2 }]}>
                Pop it in the box below
              </Text>
              <TextInput
                underlineColorAndroid="transparent"
                style={styles.inputStyle}
                placeholder="Enter code"
                placeholderTextColor="#001331"
                onChangeText={password => this.setState({ code: password })}
                value={code}
              />
              {showError ? <ErrorMessage errorMessage="Incorrect code" /> : null}
              {showLoading ? <Loading /> : null}
              <Button
                color="#001331"
                buttonStyle={[styles.button, { backgroundColor: 'white' }]}
                fontSize={moderateScale(18)}
                title="Cancel"
                onPress={() => {
                  this.setState({ showRedeemPopUp: false });
                }}
              />
              <Button
                color="#fff"
                buttonStyle={[styles.button, { marginTop: moderateScale(10) }]}
                fontSize={moderateScale(18)}
                title="Confirm"
                onPress={() => {
                  if (!netInfo) {
                    return this.setState({ showNoInternetDialog: true, modalMessage: 'Please check your internet connection' });
                  }
                  this.setState({ showLoading: true });
                  this.checkRedeemCode(code);
                }}
              />
              {/* </View> */}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  navigateTo = (navigateScreen) => {
    const { netInfo } = this.props.screenProps;
    const screenArray = ['Downloads', 'Tips', 'Agreement', 'Tutorial', 'Credits', 'Kickstarter'];
    if (!netInfo && !screenArray.includes(navigateScreen)) {
      return this.setState({ showNoInternetDialog: true, modalMessage: 'Please check your internet connection' });
    }
    if (navigateScreen === 'Feedback') {
      return this.sendEmail();
    }
    if (navigateScreen === 'Redeem') {
      return this.setState({ showRedeemPopUp: true });
    }
    if (navigateScreen === 'Account') {
      if (this.props.screenProps.user === undefined) {
        return this.props.navigation.navigate('LoginSignup');
      }
    }
    this.props.navigation.navigate(navigateScreen, { showButton: false, showCheckbox: false });
    // showButton for tutorial, showCheckbox for Agreement
  }

  render() {
    const { showNoInternetDialog, modalMessage, description } = this.state;
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
          title={modalMessage}
          description={description}
          buttonText="OK"
          onPress={() => {
            this.setState({ showNoInternetDialog: false, description: '' });
          }}
        />
        {this.showModal()}
        <ScrollView>
          { menuList }
        </ScrollView>
      </View>
    );
  }
}
