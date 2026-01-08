Summary of Expo SDK 54 alignment

What I changed
- Updated `babel-preset-expo` to `~54.0.9` and attempted to pin `expo` to `54.0.6`.
- Ran a clean reinstall which resulted in `expo` being set to `~54.0.31` (the install tool aligned to expected SDK 54 package versions).
- Removed `node_modules` and `package-lock.json`, then ran `npm install`.
- Ran `npx expo install --fix` to align native modules to SDK 54.
- Ran `npx expo-doctor` (17/17 checks passed).
- Started the dev server using `npx expo start --tunnel` (no startup errors reported).

Commands I ran

- `npx rimraf node_modules package-lock.json`
- `npm install`
- `npx expo install --fix`
- `npx expo-doctor`
- `npx expo start --tunnel`

Notes & next steps
- The installed `expo` package ended up at `~54.0.31` which is in the SDK 54 series and should be compatible with Expo Go client `54.0.6` and SDK 54.
- I pinned `expo` to **54.0.6** and re-ran a clean reinstall and `npx expo install --fix`.
- After any changes, run `npx expo-doctor` and `npx expo start` to confirm everything runs as expected.
