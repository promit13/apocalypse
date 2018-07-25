import React from 'react';
import {
  ScrollView,
  View,
  Image,
} from 'react-native';
import {
  ListItem,
  Button,
  Text,
} from 'react-native-elements';

const styles = {
  mainContainer: {
    backgroundColor: '#001331',
  },
  buttonsViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5cb23',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  circularImageView: {
    height: 120,
    width: 120,
    borderWidth: 5,
    borderColor: 'white',
    borderRadius: 120 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    marginLeft: 15,
    marginRight: 15,
  },
  buttonView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#f5cb23',
    color: 'blue',
    alignSelf: 'flex-start',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
};

export default class EpisodeView extends React.Component {
  navigateToEpisodeSingle = (check) => {
    const {
      tracks,
      exercises,
    } = this.props.navigation.state.params;
    this.props.navigation.navigate('EpisodeSingle', {
      tracks,
      exercises,
      check,
    });
  }

  render() {
    const {
      exercises,
      title,
      description,
      category,
      index,
    } = this.props.navigation.state.params;
    const exercisesList = Object.entries(exercises).map(([key, value], i) => (
      <ListItem
        key={i}
        title={value.title}
        titleStyle={{ color: 'white' }}
        containerStyle={{ backgroundColor: '#33425a' }}
        underlayColor="#2a3545"
        onPress={() => {
          this.props.navigation.navigate('Exercise', {
            exercise: { value },
          });
        }}
      />
    ));
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={styles.line} />
        <View style={{ flexDirection: 'row', padding: 15 }}>
          <View style={styles.circularImageView}>
            <Image
              style={{
                height: 120,
                width: 120,
                borderRadius: 120 / 2,
              }}
              source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text h4 style={styles.text}>
              {category}
            </Text>
            <Text style={styles.text}>
              Running Training
            </Text>
            <Text style={styles.text}>
              Workout time: 38:00
            </Text>
            <Text style={styles.text}>
              Total audio time: 40:00
            </Text>
            <Text style={styles.text}>
              Size: 40 MB
            </Text>
          </View>
        </View>
        <View>
          <Text h4 style={styles.text}>
            {`${index}. ${title}`}
          </Text>
          <Text style={styles.text}>
            {description}
          </Text>
        </View>
        <View style={styles.buttonsViewContainer}>
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: 30 }}
              color="#001331"
              fontSize={18}
              title="Workout Mode"
              onPress={() => this.navigateToEpisodeSingle()}
            />
          </View>
          <View style={{
            width: 1,
            height: 30,
            backgroundColor: '#001331',
          }}
          />
          <View style={styles.buttonView}>
            <Button
              buttonStyle={styles.button}
              icon={{ name: 'play-arrow', color: '#001331', size: 30 }}
              color="#001331"
              fontSize={18}
              title="Listen Mode"
              onPress={() => this.navigateToEpisodeSingle(true)}
            />
          </View>
        </View>
        <Text style={{ color: 'white', margin: 15 }}>
          EXERCISES IN EPISODE
        </Text>
        <View style={styles.line} />
        <View />
        {exercisesList}
      </ScrollView>
    );
  }
}
