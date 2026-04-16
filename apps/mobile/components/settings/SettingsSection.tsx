import React from "react";
import { StyleSheet } from "react-native";
import { Box, Text, VStack } from "@gluestack-ui/themed";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";
import { Spacing, TextStyles, BorderRadius } from "@/constants/Styles";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * iOS-style grouped section: uppercase footer-style title + rounded group container.
 */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const isDark = colorScheme === "dark";

  return (
    <VStack space="xs" style={styles.wrapper}>
      <Text
        style={[
          TextStyles.caption,
          styles.sectionTitle,
          { color: theme.gray[6] },
        ]}
      >
        {title}
      </Text>
      <Box
        style={[
          styles.group,
          {
            backgroundColor: isDark ? theme.gray[9] : theme.gray[0],
            borderColor: isDark ? theme.gray[7] : theme.gray[3],
          },
        ]}
      >
        {children}
      </Box>
    </VStack>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  group: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
