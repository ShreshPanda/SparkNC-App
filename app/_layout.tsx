import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../providers/ThemeProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { PresentationProvider } from '../providers/PresentationProvider';
import { AuthProvider } from '../providers/AuthProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PresentationProvider>
          <QueryProvider>
            <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            </AuthProvider>
            <StatusBar style="auto" />
          </QueryProvider>
        </PresentationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
