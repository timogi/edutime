import React from 'react';
import { View } from 'react-native';
import { Text } from "@gluestack-ui/themed";
import { TextStyles, Spacing } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import { CategorySelector } from "@/components/CategorySelector";
import { CategoryResult } from "@/lib/database/categories";

import { ColorTheme } from "@/lib/types";

interface CategoryInputProps {
  selectedCategory: CategoryResult | null | undefined;
  onCategorySelect: (selectedCategory: CategoryResult | null) => void;
  colorScheme: string | null | undefined;
  theme: ColorTheme;
}

export function CategoryInput({
  selectedCategory,
  onCategorySelect,
  colorScheme,
  theme,
}: CategoryInputProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={[styles.label, colorScheme === "dark" && { color: "white" }]}>
        {t("Index.category")}
      </Text>
      
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
    </View>
  );
}

const styles = {
  label: {
    ...TextStyles.label,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
};
