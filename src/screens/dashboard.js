GLOBAL = require('./../global-color');

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  AsyncStorage
} from 'react-native';

const button_label = 'set new spending limit'

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fade_animation: new Animated.Value(0),
      spendinglimit: 0,
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
        spendinglimit: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  componentDidMount() {
    Animated.timing(
      this.state.fade_animation,
      {
        toValue: 1,
        duration: 500,
      }
    ).start();
  }

  changeSpendingLimit() {
    this.props.navigation.navigate('ChangeLimit');
  }

  render() {

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content' />
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation}]}>
          <Text style={styles.prompt}>${parseInt(this.state.spendinglimit).toFixed(2)} left</Text>
          <View style={styles.form}>
            <TouchableOpacity style={styles.button} onPress={() => this.changeSpendingLimit()}>
              <Text style={styles.button_label}>{button_label}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLOBAL.COLOR.GREEN,
  },
  view_container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLOBAL.COLOR.GREEN,
    padding: 32,
  },
  prompt: {
    fontSize: 40,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: 'Montserrat',
    fontWeight: '900',
    color: GLOBAL.COLOR.WHITE,
  },
  prompt_label: {
    paddingTop: 4,
    fontSize: 15,
    alignSelf: 'flex-start',
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.WHITE,
  },
  form: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    fontSize: 15,
    fontFamily: 'Open Sans',
    backgroundColor: GLOBAL.COLOR.WHITE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    color: GLOBAL.COLOR.DARKGRAY,
  },
  button: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: GLOBAL.COLOR.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  button_label: {
    fontSize: 15,
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.DARKGRAY,
  }
});
