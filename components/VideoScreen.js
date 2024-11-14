import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

export default function VideoScreen({ navigation }) {
  const videoSource = require('../assets/entradauts.mp4');
  const videoRef = useRef(null);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.play();
  });


  useEffect(() => {
    const checkVideoStatus = () => {
      if (player.currentTime === player.duration) {
        navigation.replace('InicioSesion');
      }
    };

    const interval = setInterval(checkVideoStatus, 500); // Verificar cada segundo

    return () => {
      clearInterval(interval);
    };
  }, [player, navigation]);

  return (
    <View style={styles.container}>
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        resizeMode="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false} // Deshabilitar controles nativos
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
