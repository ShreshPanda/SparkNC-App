import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider';

export default function Index() {
  const { status } = useAuth();

  // Hold routing until session restoration resolves so neither the login
  // screen nor protected screens flash on launch.
  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={status === 'authenticated' ? '/(tabs)/dashboard' : '/(auth)/login'} />;
}
