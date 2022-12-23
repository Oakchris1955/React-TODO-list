# React Native Lists

A mobile app coded in [React Native](https://github.com/facebook/react-native) that is basically a list manager

## Installation

1) Clone the repository using Git or by clicking the green button saying code (don't forget unzipping)
2) Install Node.js from <https://nodejs.org/en/download/>
3) Open a command prompt or a shell and `cd` to the directory you have saved the repository
4) Type `npm install` to install dependencies and wait
5) Create an Expo account at <https://expo.dev/signup> or login through <https://expo.dev/login> if you already have an account
6) On the terminal, type `npx expo login` and enter the credentials you used when signing up
7) ALSO, type `npx expo prebuild` in the terminal. You will be prompted to enter an Android package name. This can be anything as long as it begins with `com.YOURUSERNAMEGOES HERE.`, where `YOURUSERNAMEGOESHERE` is your Expo account username
8) You should be in the dashboard now. Click on `Projects` button, then `+ New Project`
9) Enter the name you inputted before and any slug you want (you can't change the slug tho, so choose something you are sure you won't change later)
10) You should be on the overview screen of your project now. Copy the last command in the section "Link an existing Expo codebase", paste it on the terminal and run it
11) That's it. You should be done. You can compile the app if you want using the scripts supplied in `package.json` (for more info check the `Scripts` section below)

## Debugging

While we linked the project with out Expo account, we can't do much without debugging it. To begin with:

1) Download `Expo Go` on your mobile phone from the [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www) or the [App Store](https://itunes.apple.com/app/apple-store/id982107779)
2) Login there using your credentials
3) On the terminal of you computer, type `npm start`. You will see a QR code. Scan it using the Expo Go (Android) or the Camera app (iOS). From there, you can change on your code and see it refreshing on your phone almost immediately
4) To close the Expo server on your computer, press `Control+C` while on the terminal

## Scripts

Yeah, but what about building. Well, some scripts got you covered up for that case. Let's see some of them:

- `npm start` starts the Expo development server
- `npm build-android` builds a standalone `.apk` for your Android device
- `npm web` opens the default browser and run the Expo client there (not recommended, DO NOT USE UNLESS YOU DON'T HAVE A PHONE)
