import React from 'react';
import { Controller } from 'react-hook-form';
import { Text } from "@gluestack-ui/themed";
import { Input, InputField } from "@gluestack-ui/themed";
import { TextStyles, Spacing, BorderRadius } from "@/constants/Styles";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@gluestack-ui/themed";

interface DescriptionInputProps {
  control: any;
  isDescriptionFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  colorScheme: string | null | undefined;
  theme: any;
}

export function DescriptionInput({
  control,
  isDescriptionFocused,
  onFocus,
  onBlur,
  colorScheme,
  theme,
}: DescriptionInputProps) {
  const { t } = useTranslation();

  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText style={[styles.label, colorScheme === "dark" && { color: "white" }]}>
          {t("Index.description")}
        </FormControlLabelText>
      </FormControlLabel>
      <Controller
        name="description"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Input
            size="md"
            style={[
              styles.descriptionInput,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? theme.gray[8]
                    : undefined,
                borderColor: isDescriptionFocused
                  ? theme.primary[6]
                  : colorScheme === "dark"
                  ? theme.gray[6]
                  : "#ddd",
                borderWidth: isDescriptionFocused ? 2 : 1,
              },
            ]}
          >
            <InputField
              placeholder={t("Index.description")}
              value={value}
              onChangeText={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={colorScheme === "dark" ? { color: "white" } : undefined}
            />
          </Input>
        )}
      />
    </FormControl>
  );
}

const styles = {
  label: {
    ...TextStyles.label,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  descriptionInput: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingTop: Spacing.md,
  },
};
