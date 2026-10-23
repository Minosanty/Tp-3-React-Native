const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/TopicSubscriptionModule.android.js'
);

if (fs.existsSync(targetPath)) {
  const content = fs.readFileSync(targetPath, 'utf8');
  if (content.includes("requireNativeModule('ExpoTopicSubscriptionModule')")) {
    const patchedContent = `import { requireOptionalNativeModule } from 'expo';
const nativeModule = typeof requireOptionalNativeModule === 'function'
  ? requireOptionalNativeModule('ExpoTopicSubscriptionModule')
  : null;
export default nativeModule ?? {
  subscribeToTopicAsync: async () => null,
  unsubscribeFromTopicAsync: async () => null,
};
`;
    fs.writeFileSync(targetPath, patchedContent, 'utf8');
    console.log('[patch] Patched TopicSubscriptionModule.android.js successfully');
  } else {
    console.log('[patch] TopicSubscriptionModule.android.js already patched or modified');
  }
} else {
  console.log('[patch] TopicSubscriptionModule.android.js not found, skipping');
}

