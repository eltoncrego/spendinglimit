import React, { Component } from 'react';
import { createStackNavigator } from "react-navigation";
import { AsyncStorage } from 'react-native';
import Dashboard from './../screens/dashboard';
import ChangeLimit from './../screens/change-spending-limit';

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
      spendinglimit__set: false,
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
    this.retrieveItem('spendinglimit').then((data) => {
      that.setState({
        spendinglimit__set: true,
      });
    }).catch((error) => {
      console.log(error.message);
      that.setState({
        spendinglimit__set: false,
      });
    });
  }

  render() {
    if(this.state.spendinglimit__set != null){
      if(this.state.spendinglimit__set){
        return <LimitSet/>;
      } else {
        return <SetLimit/>;
      }
    } else {
      // Loader would go here
      return null;
    }

  }
}
