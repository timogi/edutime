import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

interface KeyboardHandlerProps {
  children: React.ReactNode;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
}

export const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({ 
  children, 
  onKeyboardShow, 
  onKeyboardHide 
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
        onKeyboardShow?.();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        onKeyboardHide?.();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [onKeyboardShow, onKeyboardHide]);

  return <>{children}</>;
};
