#!/bin/bash
# mobile-apk-shortcut.sh
# This script builds the Kerugoya Deliveries Android APK and copies it to your current directory for easy access.

echo "--- Building Kerugoya Deliveries Mobile App (APK) ---"

# Navigate to the mobile project directory
cd kerugoya_deliveries_mobile

# Build the APK in release mode
flutter build apk --release

# Check if build was successful
if [ $? -eq 0 ]; then
  # The APK is usually generated in:
  # build/app/outputs/flutter-apk/app-release.apk
  
  APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
  
  if [ -f "$APK_PATH" ]; then
    echo "--- Build Successful! ---"
    # Copy the APK to the root directory for easy access
    cp "$APK_PATH" ../Kerugoya_Deliveries_Mobile_Release.apk
    echo "The APK has been copied to the project root as: Kerugoya_Deliveries_Mobile_Release.apk"
    
    # Try copying to Desktop if it exists
    if [ -d "$HOME/Desktop" ]; then
      cp "$APK_PATH" "$HOME/Desktop/Kerugoya_Deliveries_Mobile_Release.apk"
      echo "The APK has also been copied to your Desktop: ~/Desktop/Kerugoya_Deliveries_Mobile_Release.apk"
    fi
    echo "You can now find it on your desktop or project folder."
  else
    echo "Error: APK file not found after build."
  fi
else
  echo "Error: Flutter build failed."
  exit 1
fi
