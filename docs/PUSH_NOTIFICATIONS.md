# Push Notifications

SparkNC supports real push delivery through the `NotificationProvider` interface. The default `NoopNotificationProvider` is used for development and testing. Production should register `ExpoPushProvider`.

## Architecture

```
PushNotificationService
  ↓ uses PushTokenRepository to fetch tokens
  ↓ tries providers in order
  ↓ ExpoPushProvider sends to Expo Push Service
```

## Expo Push Provider

`workers/api/services/notificationProviders/ExpoPushProvider.ts` sends notifications to iOS, Android, and web via the Expo Push API.

Requirements:

- `EXPO_ACCESS_TOKEN` secret configured with `wrangler secret put EXPO_ACCESS_TOKEN`.
- Device tokens registered with `PushTokenRepository` in `ios`, `android`, or `web` device type.
- Token format `ExponentPushToken[...]` or a valid token string.

## Configuration

Register the provider in the Worker entrypoint:

```ts
import { ExpoPushProvider } from './api/services/notificationProviders/ExpoPushProvider';

const pushService = new PushNotificationService(new PushTokenRepository(env.DB));
pushService.registerProvider(new ExpoPushProvider(env));
```

Or via a factory that only registers when `EXPO_ACCESS_TOKEN` is present.

## Testing

Use `wrangler dev` and call `POST /notifications/push-token` from the app to register a token.

Trigger test notifications:

- Task reminders
- Event reminders
- Goal reminders
- Streak warnings
- Achievement notifications

## Payload format

```ts
{
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: 'normal' | 'high';
}
```

## Future providers

Additional providers can implement `NotificationProvider` and be registered without changing `PushNotificationService`.

- `APNsProvider` for direct iOS delivery.
- `FCMProvider` for direct Android delivery.
- `WebPushProvider` for browser push.
