GLOBAL = require('./../global-color');

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';

const spendingPrompt = 'What is your spending limit?'
const label1 = 'This amount will be for one week.'
const placeholder = 'eg. $120.00'
const button_label = 'lets go!'

export default class ChangeLimit extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      fade_animation: new Animated.Value(0),
    };
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

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation}]}>
          <View>
            <Text style={styles.prompt}>{spendingPrompt}</Text>
            <View style={styles.form}>
              <TextInput keyboardType='numeric' style={styles.input} placeholder={placeholder} value={this.state.text}/>
            </View>
            <Text style={styles.prompt_label}>{label1}</Text>
          </View>
          <View style={styles.form}>
            <TouchableOpacity style={styles.button}>
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
