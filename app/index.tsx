import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ScrollView } from 'react-native';
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
  exchangeCodeAsync,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const CLIENT_ID = 'YOUR_CLIENT_ID'; // 🔁 Spotify Console'dan al
const REDIRECT_URI = makeRedirectUri({ useProxy: true }); // ✅ Bu işe yarıyor
const SCOPES = ['user-read-playback-state'];

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [queue, setQueue] = useState<any[]>([]);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      responseType: ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    const fetchToken = async () => {
      if (response?.type === 'success') {
        try {
          const tokenResponse = await exchangeCodeAsync(
            {
              clientId: CLIENT_ID,
              code: response.params.code,
              redirectUri: REDIRECT_URI,
              extraParams: {
                code_verifier: request?.codeVerifier ?? '',
              },
            },
            discovery
          );
          console.log('✅ Access Token:', tokenResponse.accessToken);
          setAccessToken(tokenResponse.accessToken);
        } catch (err) {
          console.error('❌ Token alma hatası:', err);
        }
      }
    };
    fetchToken();
  }, [response]);

  const fetchQueue = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/queue', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      console.log('🎶 Queue:', data);
      const allTracks = [data.currently_playing, ...data.queue];
      setQueue(allTracks);
    } catch (err) {
      console.error('❌ Queue çekilemedi:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 16 }}>
        🎧 Music Queue Viewer
      </Text>
      {!accessToken ? (
        <Button title="Login with Spotify" onPress={() => promptAsync()} />
      ) : (
        <>
          <Button title="Fetch Queue" onPress={fetchQueue} />
          <FlatList
            style={{ marginTop: 16 }}
            data={queue}
            keyExtractor={(item) => item?.id ?? Math.random().toString()}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold' }}>{item?.name}</Text>
                <Text>{item?.artists?.map((a: any) => a.name).join(', ')}</Text>
              </View>
            )}
          />
        </>
      )}
    </ScrollView>
  );
}
