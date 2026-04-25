# iOS App Store Submission Guide (for MacBook/Xcode)

This project is a hybrid app built with **Vite (React)** and **Capacitor**. Since you are on a MacBook, you can handle the iOS build and App Store submission.

## 1. Prerequisites
Ensure you have the following installed on your MacBook:
- **Node.js** (v18 or higher recommended)
- **Xcode** (Latest version)
- **CocoaPods** (Run `sudo gem install cocoapods` if not installed)

## 2. Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/srdec7/Daily_Saju_Premium.git
   cd Daily_Saju_Premium
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## 3. Build & Sync
1. Build the web project:
   ```bash
   npm run build
   ```
2. Sync the assets to the iOS project:
   ```bash
   npx cap sync ios
   ```

## 4. Open in Xcode
Open the iOS project in Xcode:
```bash
npx cap open ios
```

## 5. App Store Submission
In Xcode:
1. Select the **App** target.
2. Under **Signing & Capabilities**, ensure the correct Apple Developer Team is selected.
3. Set the **Bundle Identifier** (currently `com.dailysaju.premium`).
4. Select **Any iOS Device (arm64)** as the build destination.
5. Go to **Product** -> **Archive**.
6. Follow the prompts in the Organizer to **Distribute App** to the App Store.

## Notes
- The **Advertising ID (AD_ID)** permission has already been added to the `Info.plist` and `AndroidManifest.xml` equivalent.
- Background music logic handles interruptions during ads.
- If you need any specific certificates or keys from your father, please ask him for the `.p12` or `.mobileprovision` files if they aren't already in the Keychain.

Good luck!
