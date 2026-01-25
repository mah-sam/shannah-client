import * as Updates from "expo-updates";
import { I18nManager } from "react-native";

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  Updates.reloadAsync();
}

import "expo-router/entry";
