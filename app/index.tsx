import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const CLIENT_ID = '34b091113ce943c09d9d07994befc8b0';

const redirectUri = 'https://auth.expo.io/@kuzeycaliskan/music-to-movie'; // elle URI
const scopes = [
  'user-read-email',
  'user-top-read',
  'user-read-private',
  'user-read-playback-state',
];

export default function IndexScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes,
      redirectUri,
      responseType: ResponseType.Code,
      useProxy: true, // BU ÖNEMLİ
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    console.log('🌀 AUTH RESPONSE:', response);

    if (response?.type === 'success' && response.params?.access_token) {
      const token = response.params.access_token;
      setAccessToken(token);
      console.log('✅ Access Token:', token);
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>🎵 Music to Movie</Text>
      <Button title="Login with Spotify" onPress={() => promptAsync()} />
      {accessToken && (
        <Text style={{ marginTop: 20, textAlign: 'center' }}>
          🎫 Giriş Başarılı!\nToken alındı.
        </Text>
      )}
    </View>
  );
}
