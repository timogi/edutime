import React from "react";
import { Platform, StyleSheet } from "react-native";
import { HStack, Pressable, Text } from "@gluestack-ui/themed";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { themeForScheme } from "@/constants/Colors";
import { Spacing, TextStyles } from "@/constants/Styles";
import { HapticFeedback } from "@/lib/haptics";

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  /** SF Symbol name for leading icon (optional) */
  icon?: React.ComponentProps<typeof IconSymbol>["name"];
  showChevron?: boolean;
  destructive?: boolean;
  isFirst?: boolean;
  onPress?: () => void;
}

export function SettingsRow({
  title,
  subtitle,
  icon,
  showChevron = true,
  destructive = false,
  isFirst = false,
  onPress,
}: SettingsRowProps) {
  const colorScheme = useColorScheme();
  const theme = themeForScheme(colorScheme);
  const isDark = colorScheme === "dark";
  const titleColor = destructive ? theme.red[6] : theme.text;
  const subtitleColor = theme.gray[6];
  const iconColor = destructive ? theme.red[6] : theme.gray[6];
  const chevronColor = theme.gray[5];

  const handlePress = () => {
    if (!onPress) return;
    HapticFeedback.light();
    onPress();
  };

  const content = (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      space="md"
      style={[
        styles.row,
        !isFirst && {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: isDark ? theme.gray[7] : theme.gray[3],
        },
      ]}
    >
      <HStack alignItems="center" space="sm" flex={1}>
        {icon ? (
          <IconSymbol name={icon} size={22} color={iconColor} />
        ) : null}
        <Text style={[TextStyles.body, { color: titleColor, flex: 1 }]} numberOfLines={subtitle ? 1 : 2}>
          {title}
        </Text>
      </HStack>
      <HStack alignItems="center" space="xs">
        {subtitle ? (
          <Text
            style={[TextStyles.caption, { color: subtitleColor, maxWidth: "50%" }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
        {showChevron && onPress ? (
          <IconSymbol name="chevron.right" size={18} color={chevronColor} />
        ) : null}
      </HStack>
    </HStack>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      android_ripple={
        Platform.OS === "android"
          ? { color: theme.gray[3], foreground: true }
          : undefined
      }
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
});
