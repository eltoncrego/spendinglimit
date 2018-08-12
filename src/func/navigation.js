import React, { Component } from 'react';
import { createStackNavigator } from "react-navigation";
import { AsyncStorage, PushNotificationIOS } from 'react-native';
import PushNotification from 'react-native-push-notification';

import Dashboard from './../screens/dashboard';
import ChangeLimit from './../screens/change-spending-limit';
import { clearExpirationData } from './storage';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

PushNotification.configure({
    onRegister: function(token) {
      console.log( 'TOKEN:', token );
    },

    onNotification: function(notification) {
      console.log( 'NOTIFICATION:', notification );
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    popInitialNotification: true,
    requestPermissions: true,
});

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
        }, () => {
          var notif_date = that.state.spendinglimit_expiration
          var notif_title = "It's " + months[(new Date(that.state.spendinglimit_expiration)).getMonth()] + " " + (new Date(that.state.spendinglimit_expiration)).getDate() + "!";
          var notif_message = "Your previous spending limit has expired. Come back to app to set your next spending limit."

          PushNotification.localNotificationSchedule({
            title: notif_title, // (optional)
            message: notif_message, // (required)
            date: notif_date
          });
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
