import React from 'react';
import {
  ScrollView,
  View,
  Image,
} from 'react-native';
import { Text, ListItem, Button } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = {
  titleContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#001331',
    padding: 10,
  },
  subtitleContainerStyle: {
    backgroundColor: '#34495E',
    padding: 10,
  },
  imageStyle: {
    width: '100%',
    height: 200,
  },
  textStyle: {
    color: 'white',
  },
  buttonContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buttonStyle: {
    width: 60,
    height: 20,
    borderColor: 'white',
    borderRadius: 2,
    borderWidth: 2,
  },
};

export default class Talon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bgColor: [
        '#AD0C18',
        '#0C6DAD',
        '#14A403',
      ],
      selectedColor: '',
      series: '',
    };
  }

  componentDidMount() {
    firebase.database().ref('series').on('value', snapshot => this.setState({ series: snapshot.val() }));
  }

  // set color on button randomly
  getRandomColor() {
    const item = this.state.bgColor[Math.floor(Math.random() * this.state.bgColor.length)];
    this.setState({
      selectedColor: item,
    });
  }

  renderLogsList = (logTitle, navigateTo) => {
    return (
      <View style={styles.subtitleContainerStyle}>
        <ListItem
          subtitle={
            <Text style={styles.textStyle}>
              {logTitle}
            </Text>
          }
          onPress={() => this.props.navigation.navigate(navigateTo)}
        />
      </View>
    );
  }

    renderButton = indexArray => indexArray
      .map((item, i) => {
        return (
          <Button
            buttonStyle={[styles.buttonStyle, { backgroundColor: this.state.selectedColor }]}
            title={item.index}
            // onPress={() => this.props.navigation.navigate('TalonIntelPlayer', {
              // episode: item.episode,
            // })}
          />
        );
      })

    renderEpisodes = ({ episodes }) => {
      const controlArray = [];
      const strengthArray = [];
      const speedArray = [];
      Object.entries(episodes).map(([key, value], i) => {
        if (value.category === 'Control') {
          return controlArray.push({ episode: value.title, index: i + 1 });
        }
        if (value.category === 'Strength') {
          return strengthArray.push({ episode: value.title, index: i + 1 });
        }
        if (value.category === 'Speed') {
          return speedArray.push({ episode: value.title, index: i + 1 });
        }
      });
      return (
        <View>
          <Text style={styles.textStyle}>
          Control
          </Text>
          <View style={styles.buttonContainerStyle}>
            {this.renderButton(controlArray)}
          </View>
          <Text style={styles.textStyle}>
          Speed
          </Text>
          <View style={styles.buttonContainerStyle}>
            {this.renderButton(speedArray)}
          </View>
          <Text style={styles.textStyle}>
          Strength
          </Text>
          <View style={styles.buttonContainerStyle}>
            {this.renderButton(strengthArray)}
          </View>
        </View>
      );
    }

    render() {
      const series = Object.entries(this.state.series).map(([key, value], i) => {
        return (
          <View>
            <View style={styles.titleContainerStyle}>
              <Text h4 style={styles.textStyle}>
                {value.title}
              </Text>
            </View>
            <View style={styles.subtitleContainerStyle}>
              <View>
                {this.renderEpisodes({ episodes: value.episodes })}
              </View>
            </View>
          </View>
        );
      });
      return (
        <ScrollView>
          <Image
            style={styles.imageStyle}
            source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
          />
          <View style={styles.titleContainerStyle}>
            <Text h4 style={styles.textStyle}>
              Logs
            </Text>
          </View>
          {this.renderLogsList('Essential Intel Files', 'TalonEssentialIntel')}
          {this.renderLogsList('Workout Logs')}
          {this.renderLogsList('Running Logs')}
          {series}
        </ScrollView>
      );
    }
}
