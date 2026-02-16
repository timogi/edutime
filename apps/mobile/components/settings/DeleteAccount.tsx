import React, { useState } from 'react';
import { StyleSheet, Keyboard, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import {
  Button,
  ButtonText,
  Card,
  VStack,
  Text,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Icon,
  CloseIcon,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  EyeIcon,
  EyeOffIcon
} from '@gluestack-ui/themed';

interface DeleteAccountProps {
  onDeleteAccount: (password: string) => Promise<void>;
}

export const DeleteAccount = ({ onDeleteAccount }: DeleteAccountProps) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const screenWidth = Dimensions.get('window').width;

  const cardStyle = {
    ...styles.card,
    backgroundColor: isDark ? '#1A1B1E' : 'white'
  };

  const modalContentStyle = {
    backgroundColor: isDark ? '#1A1B1E' : 'white'
  };

  const textStyle = {
    color: isDark ? 'white' : 'black'
  };

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  const handleDelete = async () => {
    if (!user?.user_id) {
      setError('User not found');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await onDeleteAccount(password);
      // If successful, close modal and clear password
      // The logout will be handled by the parent component
      setShowModal(false);
      setPassword('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Deletion error:', error);
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPassword('');
    setError('');
  };

  return (
    <>
      <Card style={cardStyle} variant="outline">
        <VStack space="md" style={styles.container}>
          <Text size="xl" style={textStyle}>{t('Settings.deleteAccount')}</Text>
          <Text size="sm" style={[textStyle, { opacity: 0.7 }]}>{t('Settings.deleteAccountInfo')}</Text>
          <Button
            action="negative"
            variant="solid"
            onPress={() => setShowModal(true)}
            size="md"
          >
            <ButtonText>{t('Settings.deleteAccount')}</ButtonText>
          </Button>
        </VStack>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        size="md"
      >
        <ModalBackdrop />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.keyboardAvoidingView, { width: screenWidth * 0.9 }]}
        >
          <ModalContent style={[{ width: '100%' }, modalContentStyle]}>
            <ModalHeader>
              <Heading size="md" style={textStyle}>
                {t('Settings.deleteAccount')}
              </Heading>
              <ModalCloseButton>
                <Icon as={CloseIcon} size="md" color={isDark ? 'white' : 'black'} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="md">
                <Text size="sm" style={textStyle}>
                  {t('Settings.deleteAccountInfo')}
                </Text>
                <Input 
                  variant="outline" 
                  size="md"
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? theme.gray[8] : 'white',
                      borderColor: isPasswordFocused 
                        ? theme.primary[6]
                        : isDark
                        ? theme.gray[6]
                        : '#ddd',
                      borderWidth: isPasswordFocused ? 2 : 1,
                    }
                  ]}
                >
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder={t('Settings.passwordPlaceholder')}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    color={isDark ? 'white' : 'black'}
                    placeholderTextColor={isDark ? theme.gray[6] : '#999'}
                  />
                  <InputSlot 
                    onPress={handleState}
                    width={48}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <InputIcon 
                      as={showPassword ? EyeIcon : EyeOffIcon}
                      color={isDark ? theme.gray[6] : '$black'}
                    />
                  </InputSlot>
                </Input>
                {error && (
                  <Text size="sm" color="$red500">
                    {error}
                  </Text>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter style={styles.modalFooter}>
              <Button
                style={styles.deleteButton}
                action="negative"
                variant="solid"
                onPress={handleDelete}
              >
                <ButtonText>{t('Settings.deleteAccount')}</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    padding: 12,
    width: '100%'
  },
  container: {
    width: '100%',
  },
  modalFooter: {
    justifyContent: 'center',
  },
  input: {
    borderRadius: 6,
    padding: 12,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    marginHorizontal: 16,
  }
});
