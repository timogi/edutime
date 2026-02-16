import React from 'react';
import { Button, ButtonText, ButtonIcon, Spinner } from '@gluestack-ui/themed';
import { IconSymbol } from './IconSymbol';
import { SymbolViewProps } from 'expo-symbols';

interface ButtonWithLoadingProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  iconName?: SymbolViewProps['name'];
  iconSize?: number;
  iconColor?: string;
  children: React.ReactNode;
  flex?: number;
  flexDirection?: 'row' | 'column';
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  android_ripple?: any;
  style?: any;
}

export const ButtonWithLoading: React.FC<ButtonWithLoadingProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'solid',
  size = 'md',
  iconName,
  iconSize = 20,
  iconColor = 'white',
  children,
  flex,
  flexDirection = 'row',
  alignItems = 'center',
  justifyContent = 'center',
  gap = 8,
  android_ripple,
  style,
}) => {
  // Only disable if explicitly disabled, not for loading state
  const isDisabled = disabled;

  return (
    <Button
      variant={variant}
      size={size}
      onPress={onPress}
      disabled={isDisabled}
      flex={flex}
      flexDirection={flexDirection}
      alignItems={alignItems}
      justifyContent={justifyContent}
      gap={gap}
      android_ripple={android_ripple}
      style={style}
    >
      {isLoading ? (
        <Spinner size="small" color={iconColor} />
      ) : (
        iconName && (
          <ButtonIcon>
            <IconSymbol name={iconName} size={iconSize} color={iconColor} />
          </ButtonIcon>
        )
      )}
      <ButtonText>{children}</ButtonText>
    </Button>
  );
};
