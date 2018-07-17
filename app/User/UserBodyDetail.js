import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-elements';
import t from 'tcomb-form-native';
import firebase from '../config/firebase';

const { Form } = t.form;

const User = t.struct({
  age: t.String,
  weight: t.String,
  height: t.String,
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    flex: 1,
  },
  button: {
    width: 50,
  },
});

const options = {
  fields: {
    age: {
      label: 'Age',
    },
    weight: {
      label: 'Weight',
    },
    height: {
      label: 'Height',
    },
  },
};

export default class UserBodyDetail extends React.Component {
  handleSubmit = () => {
    const value = this.submit.getValue(); // use that ref to get the form value
    if (value === null) {
      return;
    }
    firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
      age: value.age,
      weight: value.weight,
      height: value.height,
      extended: true,
    })
      .then(() => this.props.navigation.navigate('Tutorial'));
  }

  render() {
    return (
      <View>
        <Card contentContainerStyle={styles.container}>
          <Form
            ref={(c) => { this.submit = c; }}
            type={User}
            options={options}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            title="Sign up"
            onPress={this.handleSubmit}
          />
          <Button
            buttonStyle={{ marginTop: 20 }}
            title="Skip"
            onPress={() => this.props.navigation.navigate('Tutorial')}
          />
        </Card>
      </View>
    );
  }
}
