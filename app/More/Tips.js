import React from 'react';
import { View, ScrollView } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { ListItem, Text } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

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

  componentDidMount() {
    firebase.database().ref('faq').on('value', snapshot => this.setState({ tips: snapshot.val().answers, loading: false }));
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
            title={title}
            titleStyle={[styles.textStyle, { fontSize: moderateScale(16) }]}
            containerStyle={{ backgroundColor: (index === i + 1) && showContent ? '#f5cb23' : '#33425a' }}
            rightIcon={{ name: (index === i + 1) && showContent ? 'chevron-up' : 'chevron-down', type: 'feather', color: 'white' }}
            underlayColor="#2a3545"
            onPress={() => this.setState({ showContent: !showContent, index: i + 1 })}
          />
          {this.showContent(i + 1, content)}
        </View>
      );
    });
    return (
      <View style={styles.mainViewContainer}>
        {
          loading
            ? <Loading />
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
