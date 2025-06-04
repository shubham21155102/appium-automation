adb shell pm list packages | grep -i whereismytrain
adb shell pm list packages > packages.txt
adb shell dumpsys window | grep -E 'mCurrentFocus|mFocusedApp' # Get the current focused app
adb shell am start -n com.whereismytrain.android/com.whereismytrain.view.activities.HomeActivity # Start the Where is My Train app