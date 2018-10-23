import React from 'react';
import Orientation from 'react-native-orientation';

export default class PortraitScreen extends React.Component {
  constructor(props) {
    super(props);
    this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => Orientation.lockToPortrait());
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove('willFoucs');
  }
}
