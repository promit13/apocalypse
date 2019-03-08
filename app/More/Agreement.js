import React from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { CheckBox, Text, Icon } from 'react-native-elements';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import axios from 'axios';
import HTML from 'react-native-render-html';
import firebase from '../config/firebase';
import ShowModal from '../common/ShowModal';
import LoadScreen from '../common/LoadScreen';

const styles = {
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
    marginTop: moderateScale(1),
    padding: moderateScale(16),
  },
  fieldContainer: {
    flexDirection: 'row',
    backgroundColor: '#3C5A96',
    borderRadius: moderateScale(5),
    alignItems: 'center',
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: moderateScale(20),
    marginLeft: moderateScale(15),
  },
};

export default class Agreement extends React.Component {
  static navigationOptions = {
    title: 'Agreement',
    loading: true,
  };

  state = {
    content: '',
    checked: false,
    showCheckbox: false,
    showLoading: true,
    showModal: false,
    errorMessage: '',
  }

  componentDidMount() {
    const { showCheckbox } = this.props.navigation.state.params;
    firebase.database().ref('screens')
      .orderByChild('title')
      .equalTo('Agreement')
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          this.setState({ showCheckbox, content: `<div style="color:white;">${childSnapshot.val().description}</div>`, showLoading: false });
        });
      });
  }

  doFacebookSignUp = () => {
    LoginManager.logOut();
    LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
      (result) => {
        if (result.isCancelled) {
          this.setState({ showLoading: false });
        } else {
          AccessToken.getCurrentAccessToken()
            .then((data) => {
              console.log(data);
              axios.get(
                `https://graph.facebook.com/v3.1/me?access_token=${data.accessToken}&fields=email,first_name,last_name`,
              ).then((response) => {
                console.log(response);
                const { email, first_name, last_name } = response.data;
                const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
                firebase.auth().signInAndRetrieveDataWithCredential(credential)
                  .then((currentUser) => {
                    // firebase.database().ref(`users/${currentUser.user.uid}`).on('value', (snapShot) => {
                    //   if (snapShot.val() === null) {
                    axios.post('http://178.128.170.252/', { email });
                    firebase.database().ref(`users/${currentUser.user.uid}`).set({
                      firstName: first_name,
                      lastName: last_name,
                      email,
                      tutorial: false,
                      fullNameLowercase: `${first_name.toLowerCase()} ${last_name.toLocaleLowerCase()}`,
                      purchases: '',
                      lastPlayedEpisode: '',
                      playedIntelArray: '',
                      episodeCompletedArray: '',
                      checked: false,
                      distanceUnit: false,
                    }).then(() => {
                      this.setState({ showLoading: false });
                    });
                    //   }
                    // })
                  })
                  .catch((error) => {
                    // Alert.alert(error);
                    this.setState({ showLoading: false, errorMessage: 'Your email is currently linked to another account which has been previously registered. Please log in using your email address.', showModal: true });
                  });
              });
            });
        }
      },
    ).catch((error) => {
      // Alert.alert(error);
      console.log(`Login failed with error: ${error}`);
    });
  }

  render() {
    const {
      content, checked, showCheckbox, showLoading, showModal, errorMessage,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      <View style={[styles.mainViewContainer, { justifyContent: showLoading ? 'center' : null, alignItems: showLoading ? 'center' : null }]}>
        {
          showLoading
            ? <LoadScreen />
            : (
              <ScrollView>
                <HTML html={content} />
              </ScrollView>
            )
        }
        <ShowModal
          visible={showModal}
          title={errorMessage}
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        {
          showCheckbox
            ? (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', flexWrap: 'wrap' }}
                    onPress={() => this.setState({ checked: !checked })}
                  >
                    <CheckBox
                      checked={checked}
                      size={moderateScale(30)}
                      onPress={() => this.setState({ checked: !checked })}
                      checkedColor="#f5cb23"
                      containerStyle={{ backgroundColor: '#001331', borderColor: 'transparent', marginRight: -20 }}

                    />
                    <Text style={{ color: checked ? '#f5cb23' : 'white', fontWeight: 'bold', marginTop: 25, fontSize: moderateScale(12) }}>
                      I agree to the User Agreement
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => {
                  if (!netInfo) {
                    return this.setState({ showModal: true, errorMessage: 'Please check your internet connection' });
                  }
                  if (checked) {
                    this.doFacebookSignUp();
                  } else {
                    this.setState({ showModal: true, errorMessage: 'Please accept the User Agreements' });
                  }
                }}
                >
                  <View style={styles.fieldContainer}>
                    <Icon name="facebook" type="entypo" color="white" size={moderateScale(30)} />
                    <Text style={styles.text}>
                      Continue with Facebook
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )
            : null
        }
      </View>
    );
  }
}
