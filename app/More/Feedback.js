import React from 'react';
import {
  View, Linking,
} from 'react-native';

const styles = {
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#001331',
  },
};

export default class Feedback extends React.Component {
  static navigationOptions = {
    title: 'Tracker',
  };

  componentDidMount() {
    this.sendEmail();
  }

  sendEmail = () => {
    Linking.openURL('mailto:appfeedback@imaginactive-fitness.com?subject=AST Feedback&body=Description');
  }

  render() {
    return (
      <View style={styles.container} />
    );
  }
}
