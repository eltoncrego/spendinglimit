import React, { Component } from 'react';
import {createStackNavigator} from "react-navigation";
import Dashboard from './../screens/dashboard';
import ChangeLimit from './../screens/change-spending-limit';

export const AppRouter = createStackNavigator ({
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

export default class App extends Component {
  render() {
    return <AppRouter/>;
  }
}
