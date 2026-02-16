import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, VStack, HStack, Pressable } from "@gluestack-ui/themed";
import { CategoryResult } from "@/lib/database/categories";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface CategorySelectorProps {
  selectedCategory?: CategoryResult | null | undefined;
  onCategorySelect: (selectedCategory: CategoryResult | null) => void;
}

export const CategorySelector = ({
  selectedCategory,
  onCategorySelect,
}: CategorySelectorProps) => {
  const { categories } = useUser();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  // Sort categories by order field from categories table, with user categories at the end
  const sortedCategories = [...categories].sort((a, b) => {
    // User categories (further employment) go to the end
    if (a.is_further_employment && !b.is_further_employment) return 1;
    if (!a.is_further_employment && b.is_further_employment) return -1;
    
    // If both are user categories, maintain their original order
    if (a.is_further_employment && b.is_further_employment) return 0;
    
    // For regular categories, sort by order field
    if (a.order === null && b.order === null) return 0;
    if (a.order === null) return 1;
    if (b.order === null) return -1;
    return a.order - b.order;
  });

  const handleCategoryPress = (category: CategoryResult | null) => {
    onCategorySelect(category);
  };

  const modifyColor = (color: string | null, amount: number = 0.3) => {
    if (!color) return isDark ? theme.gray[8] : "#f0f0f0";

    // Parse RGB values from rgb(r,g,b) format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return color;

    const [_, r, g, b] = rgbMatch.map(Number);

    if (isDark) {
      // Darken by mixing with black
      const modifiedR = Math.round(r * (1 - amount));
      const modifiedG = Math.round(g * (1 - amount));
      const modifiedB = Math.round(b * (1 - amount));
      return `rgb(${modifiedR}, ${modifiedG}, ${modifiedB})`;
    } else {
      // Lighten by mixing with white
      const modifiedR = Math.round(r + (255 - r) * amount);
      const modifiedG = Math.round(g + (255 - g) * amount);
      const modifiedB = Math.round(b + (255 - b) * amount);
      return `rgb(${modifiedR}, ${modifiedG}, ${modifiedB})`;
    }
  };

  // Create array with "No Category" option and all categories
  const allCategories = [
    { 
      id: null, 
      title: t("Index.noCategory"), 
      subtitle: "", 
      color: null, 
      is_further_employment: false,
      category_set_title: ""
    },
    ...sortedCategories
  ];

  // Split into two columns
  const leftColumn = allCategories.filter((_, index) => index % 2 === 0);
  const rightColumn = allCategories.filter((_, index) => index % 2 === 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.columnsContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {leftColumn.map((category) => {
            const isSelected = category.id === null 
              ? selectedCategory === null 
              : selectedCategory?.id === category.id;

            return (
              <Pressable
                key={category.id || 'no-category'}
                style={[
                  styles.categoryCard,
                  {
                    borderColor:
                      category.color ??
                      (isDark ? theme.gray[6] : "#ddd"),
                    backgroundColor: isSelected
                      ? modifyColor(category.color, 0.6)
                      : isDark
                      ? theme.gray[9]
                      : "white",
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleCategoryPress(category.id ? category : null)}
              >
                <VStack space="xs" flex={1}>
                  <Text
                    size="sm"
                    fontWeight="semibold"
                    color={isDark ? "white" : "black"}
                  >
                    {category.id === null
                      ? category.title
                      : category.is_further_employment
                      ? category.title
                      : t("Categories." + category.title)}
                  </Text>
                  {category.id !== null && (() => {
                    const titleText = category.is_further_employment
                      ? category.title
                      : t("Categories." + category.title);
                    const subtitleText = category.is_further_employment
                      ? category.subtitle
                      : t("Categories." + category.category_set_title);
                    
                    // Only show subtitle if it's different from title and not empty
                    if (subtitleText && subtitleText !== titleText) {
                      return (
                        <Text
                          size="xs"
                          color={isDark ? theme.gray[5] : theme.gray[7]}
                        >
                          {subtitleText}
                        </Text>
                      );
                    }
                    return null;
                  })()}
                </VStack>
              </Pressable>
            );
          })}
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {rightColumn.map((category) => {
            const isSelected = category.id === null 
              ? selectedCategory === null 
              : selectedCategory?.id === category.id;

            return (
              <Pressable
                key={category.id || 'no-category'}
                style={[
                  styles.categoryCard,
                  {
                    borderColor:
                      category.color ??
                      (isDark ? theme.gray[6] : "#ddd"),
                    backgroundColor: isSelected
                      ? modifyColor(category.color, 0.6)
                      : isDark
                      ? theme.gray[9]
                      : "white",
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleCategoryPress(category.id ? category : null)}
              >
                <VStack space="xs" flex={1}>
                  <Text
                    size="sm"
                    fontWeight="semibold"
                    color={isDark ? "white" : "black"}
                  >
                    {category.id === null
                      ? category.title
                      : category.is_further_employment
                      ? category.title
                      : t("Categories." + category.title)}
                  </Text>
                  {category.id !== null && (() => {
                    const titleText = category.is_further_employment
                      ? category.title
                      : t("Categories." + category.title);
                    const subtitleText = category.is_further_employment
                      ? category.subtitle
                      : t("Categories." + category.category_set_title);
                    
                    // Only show subtitle if it's different from title and not empty
                    if (subtitleText && subtitleText !== titleText) {
                      return (
                        <Text
                          size="xs"
                          color={isDark ? theme.gray[5] : theme.gray[7]}
                        >
                          {subtitleText}
                        </Text>
                      );
                    }
                    return null;
                  })()}
                </VStack>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  categoryCard: {
    width: "100%",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
  },
});
