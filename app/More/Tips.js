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
    title: 'FAQ',
  };

  state = {
    tips: '',
    loading: true,
    showContent: false,
    index: 0,
  }

  componentDidMount = async () => {
    if (!this.props.screenProps.netInfo) {
      const offlineData = await AsyncStorage.getItem('tips');
      const jsonObjectData = JSON.parse(offlineData);
      const { tips } = jsonObjectData;
      return this.setState({
        loading: false,
        tips,
      });
    }
    firebase.database().ref('faq').on('value', (snapshot) => {
      const tips = snapshot.val().answers;
      this.setState({ tips, loading: false });
      AsyncStorage.setItem('tips', JSON.stringify({
        tips,
      }));
    });
  }

  showContent = (i, content) => {
    if (i === this.state.index && this.state.showContent) {
      return (
        <View style={styles.listItemContainer}>
          <Text
            style={[styles.textStyle, { padding: moderateScale(10), marginLeft: moderateScale(20) }]}
          >
            {content}
          </Text>
          <View style={styles.line} />
        </View>
      );
    // }
    }
  }

  render() {
    const { loading, showContent, tips, index } = this.state;
    const tipsList = Object.entries(tips).map(([key, value], i) => {
      const { title, content } = value;
      return (
        <View>
          <ListItem
            key={key}
            title={
              (
                <Text style={[styles.textStyle, { fontSize: moderateScale(16), color: (index === i + 1) && showContent ? '#001331' : 'white' }]}>
                  {title}
                </Text>
              )
            }
            containerStyle={{ backgroundColor: (index === i + 1) && showContent ? '#f5cb23' : '#33425a' }}
            rightIcon={{ name: (index === i + 1) && showContent ? 'chevron-up' : 'chevron-down', type: 'feather', color: (index === i + 1) && showContent ? '#001331' : 'white' }}
            underlayColor="#2a3545"
            onPress={() => this.setState({ showContent: index === i + 1 ? !showContent : true, index: i + 1 })}
          />
          {this.showContent(i + 1, content)}
        </View>
      );
    });
    return (
      <View style={[styles.mainViewContainer, { justifyContent: loading ? 'center' : null, alignItems: loading ? 'center' : null }]}>
        {
          loading
            ? <LoadScreen />
            : (
              <ScrollView>
                {tipsList}
              </ScrollView>
            )
        }
      </View>
    );
  }
}
