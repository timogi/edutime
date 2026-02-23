import { Image, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import {
  HStack,
  Text
} from "@gluestack-ui/themed";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function SettingsHeader() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const version = Constants.expoConfig?.version || "1.0.0";

  const textStyle = {
    color: theme.text,
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, textStyle]}>edutime.ch</Text>
          <HStack space="sm" style={styles.versionContainer}>
            <Text style={[styles.version, textStyle]}>{t('Settings.version')} {version}</Text>
            {/* <Badge size="sm" variant="solid" action="info">
              <BadgeText>Beta</BadgeText>
            </Badge> */}
          </HStack>
        </View>
        <View style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.appIcon}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
  },
  versionContainer: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.gray[2],
    overflow: "hidden",
  },
  appIcon: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    lineHeight: 32,
  },
  version: {
    fontSize: 16,
    color: Colors.light.gray[6],
  },
});
