import React from 'react';
import { View, ScrollView, AsyncStorage } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { ListItem, Text } from 'react-native-elements';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';

const styles = {
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
  },
  listItemContainer: {
    backgroundColor: '#33425a',
  },
  textStyle: {
    color: 'white',
    fontSize: moderateScale(14),
  },
  line: {
    width: '100%',
    height: moderateScale(2),
    backgroundColor: '#59677A',
  },
};

export default class Tips extends React.Component {
  static navigationOptions = {
    title: 'Notification',
  };

  state = {
    notification: '',
  }

  componentDidMount = async () => {
    const offlineData = await AsyncStorage.getItem('notificationArray');
    const jsonObjectData = JSON.parse(offlineData);
    const { notification } = jsonObjectData;
    this.setState({ notification });
  }

  render() {
    const { notification } = this.state;
    return (
      <View style={styles.mainViewContainer}>
        {
          <Text>
            {`Title: ${notification.title} /n Body: ${notification.body}`}
          </Text>
        }
      </View>
    );
  }
}
