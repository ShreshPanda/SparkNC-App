import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { ThemeProvider } from '../providers/ThemeProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { PresentationProvider } from '../providers/PresentationProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PresentationProvider>
          <QueryProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="light" />
          </QueryProvider>
        </PresentationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
