import React from 'react';
import { View, ScrollView, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import { CheckBox, Text, Icon } from 'react-native-elements';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import axios from 'axios';
import HTML from 'react-native-render-html';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ShowModal from '../common/ShowModal';

const styles = {
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
    marginTop: 1,
    padding: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    backgroundColor: '#3C5A96',
    borderRadius: 5,
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
    marginLeft: 15,
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
    showError: false,
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
                const { email, first_name, last_name } = response.data;
                const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
                firebase.auth().signInAndRetrieveDataWithCredential(credential)
                  .then((currentUser) => {
                    firebase.database().ref(`users/${currentUser.user.uid}`).on('value', (snapShot) => {
                      if (snapShot.val() === null) {
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
                        });
                      }
                    })
                      .then(() => {
                        this.setState({ showLoading: false });
                      });
                  })
                  .catch((error) => {
                    this.setState({ showLoading: false, errorMessage: 'An account already exists with the same email address', showModal: true });
                  });
              });
            });
        }
      },
    ).catch(error => console.log(`Login failed with error: ${error}`));
  }

  render() {
    const {
      content, checked, showCheckbox, showLoading, showModal, showError, errorMessage,
    } = this.state;
    return (
      <View style={styles.mainViewContainer}>
        {
          showLoading
            ? <Loading />
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
                    style={{flexDirection:'row', flexWrap:'wrap'}}
                    onPress={() => this.setState({ checked: !checked })}
                  >
                    <CheckBox
                      checked={checked}
                      onPress={() => this.setState({ checked: !checked })}
                      checkedColor="#f5cb23"
                      containerStyle={{ backgroundColor: '#001331', borderColor: 'transparent', marginRight: -20 }}

                    />
                    <Text style={{ color: checked ? '#f5cb23' : 'white', fontWeight: 'bold', marginTop: 17 }}>
                      I agree to the User Agreement
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => {
                  if (checked) {
                    this.doFacebookSignUp();
                  } else {
                    this.setState({ showModal: true, errorMessage: 'Please accept the User Agreements' });
                  }
                }}
                >
                  <View style={styles.fieldContainer}>
                    <Icon name="facebook" type="entypo" color="white" />
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
