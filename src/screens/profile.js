import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Keyboard,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import { inject, observer } from 'mobx-react'

import style from '../theme/index'
import colors from '../theme/colors'
import { saveKey } from '../utils/db'

@inject('User')
@observer
export default class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      isFromFile: false
    }
    this.size = new Animated.Value(150)
  }

  componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardWillShow
    )
    this.keyboardWillHideSub = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardWillHide
    )
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  componentDidMount() {
    this.props.User.getCurrentUser()
  }

  keyboardWillShow = event => {
    Animated.timing(this.size, {
      duration: 100,
      toValue: 75
    }).start()
  }

  keyboardWillHide = event => {
    Animated.timing(this.size, {
      duration: 100,
      toValue: 150
    }).start()
  }

  render() {
    return (
      <View style={[style.container, _style.container]}>
        <TouchableOpacity
          style={[_style.avatar, { backgroundColor: '#fff', elevation: 15 }]}
          onPress={this.selectAvatar}
        >
          <Animated.Image
            style={[_style.avatar, { height: this.size, width: this.size }]}
            source={
              this.props.User.avatarSource !== ''
                ? {
                    uri:
                      (this.state.isFromFile ? 'file:///' : '') +
                      this.props.User.avatarSource
                  }
                : require('../img/profile.png')
            }
          />
        </TouchableOpacity>
        <TextInput
          style={_style.textInput}
          underlineColorAndroid={'transparent'}
          placeholder={'Name'}
          onChangeText={text => (this.props.User.name = text)}
          value={this.props.User.name}
        />
        {this.state.isLoading ? (
          <ActivityIndicator
            size={'large'}
            color={colors.primary}
            style={{ margin: 24 }}
          />
        ) : (
          <View />
        )}
        <View
          style={{
            backgroundColor: colors.primary,
            alignSelf: 'center',
            padding: 8,
            paddingRight: 32,
            paddingLeft: 32,
            borderRadius: 6
          }}
        >
          <TouchableOpacity onPress={this.onSaveOrUpdate}>
            <Text style={[style.footerButtonText, { fontWeight: '500' }]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  onSaveOrUpdate = () => {
    this.setState({ isLoading: true })
    if (this.props.User.key === '') {
      this.props.User.save().then(userKey => {
        saveKey(userKey).then(() => {
          this.props.navigation.replace('Splash')
        })
      })
    } else {
      this.props.User.update().then(data => {
        saveKey(this.props.User.key).then(() => {
          this.props.navigation.replace('Splash')
        })
      })
    }
  }

  selectAvatar = () => {
    ImagePicker.showImagePicker(null, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        this.props.User.avatarSource = response.path
        this.props.User.fileName = response.fileName
        this.setState({ isFromFile: true + 9190 })
      }
    })
  }
}

const _style = StyleSheet.create({
  container: {
    justifyContent: 'center'
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    alignSelf: 'center'
  },
  textInput: {
    backgroundColor: colors.white,
    margin: 32,
    padding: 8,
    borderColor: colors.border,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 18,
    elevation: 6
  }
})
