import React, { Component } from 'react';
import { createStackNavigator } from "react-navigation";
import { AsyncStorage } from 'react-native';
import Dashboard from './../screens/dashboard';
import ChangeLimit from './../screens/change-spending-limit';

import { clearExpirationData } from './storage';

import NotificationsIOS from 'react-native-notifications';

export const SetLimit = createStackNavigator ({
  ChangeLimit: {
    screen: ChangeLimit,
    navigationOptions: {
      title: 'Change Spending Limit',
      header: null,
      gesturesEnabled: false,
    },
  },
  Dashboard: {
    screen: Dashboard,
    navigationOptions: {
      title: 'Dashboard',
      header: null,
      gesturesEnabled: false,
    },
  },
});

export const LimitSet = createStackNavigator ({
  Dashboard: {
    screen: Dashboard,
    navigationOptions: {
      title: 'Dashboard',
      header: null,
      gesturesEnabled: false,
    },
  },
  ChangeLimit: {
    screen: ChangeLimit,
    navigationOptions: {
      title: 'Change Spending Limit',
      header: null,
      gesturesEnabled: false,
    },
  },
});

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      today: new Date(),
      spendinglimit__checked: false,
      spendinglimit__set: false,
      spendinglimit_expiration: new Date(),
    };

    this._boundOnNotificationReceivedForeground = this.onNotificationReceivedForeground.bind(this);
    this._boundOnNotificationReceivedBackground = this.onNotificationReceivedBackground.bind(this);
    this._boundOnNotificationOpened = this.onNotificationOpened.bind(this);
    NotificationsIOS.addEventListener('notificationReceivedForeground', this._boundOnNotificationReceivedForeground);
    NotificationsIOS.addEventListener('notificationReceivedBackground', this._boundOnNotificationReceivedBackground);
    NotificationsIOS.addEventListener('notificationOpened', this._boundOnNotificationOpened);
  }

  onNotificationReceivedForeground(notification) {
  	console.log("Notification Received - Foreground", notification);
  }

  onNotificationReceivedBackground(notification) {
  	console.log("Notification Received - Background", notification);
  }

  onNotificationOpened(notification) {
  	console.log("Notification opened by device user", notification);
  }

  async retrieveItem(key) {
    try {
      const item =  await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      return error;
    }
  }

  componentWillMount() {

    const that = this;
    this.retrieveItem('spendinglimit').then((data1) => {
      this.retrieveItem('expiration').then((data2) => {
        that.setState({
          spendinglimit__checked: true,
          spendinglimit__set: data1 != null,
          spendinglimit_expiration: new Date(data2),
        });
      }).catch((error) => {
        that.setState({
          spendinglimit__checked: true,
          spendinglimit__set: data1 != null,
        });
        console.log(error.message);
      });
    }).catch((error) => {
      console.log(error.message);
      that.setState({
        spendinglimit__checked: false,
      });
    });
  }

  componentWillUnmount() {
  	NotificationsIOS.removeEventListener('notificationReceivedForeground', this._boundOnNotificationReceivedForeground);
  	NotificationsIOS.removeEventListener('notificationReceivedBackground', this._boundOnNotificationReceivedBackground);
  	NotificationsIOS.removeEventListener('notificationOpened', this._boundOnNotificationOpened);
  }

  render() {
    if(this.state.spendinglimit__checked != null){
      if(this.state.spendinglimit_expiration.setHours(0,0,0,0) <= this.state.today.getTime()){
        return <SetLimit/>;
      } else if (this.state.spendinglimit__set){
        return <LimitSet/>;
      }
    } else {
      // Loader would go here
      return null;
    }

  }
}
