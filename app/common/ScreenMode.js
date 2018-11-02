import React from 'react';
import Orientation from 'react-native-orientation';

export default class PortraitScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log('SCREEN MODE CONSTRUCTOR');
    this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => Orientation.lockToPortrait());
  }

  componentWillUnmount() {
    console.log('SCREEN MODE');
    this.willFocusSubscription.remove();
  }
}
