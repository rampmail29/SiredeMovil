import { Video } from 'expo-av';
import { View } from 'react-native';
import React  from 'react';

export default function VideoScreen({ navigation }) {
    return (
      <View style={{ flex: 1 }}>
        <Video
          source={require('../assets/entradauts.mp4')}
          style={{ flex: 1 }}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              navigation.replace('InicioSesion');
            }
          }}
        />
      </View>
    );
  }