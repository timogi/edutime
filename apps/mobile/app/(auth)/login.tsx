import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Linking,
} from "react-native";
import { VStack } from "@gluestack-ui/themed";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { Input, InputField, InputIcon, InputSlot } from "@gluestack-ui/themed";
import { Heading } from "@gluestack-ui/themed";
import { EyeIcon, EyeOffIcon } from "@gluestack-ui/themed";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Text } from "@gluestack-ui/themed";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { showErrorToast } from "@/components/ui/Toast";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { Spacing, LayoutStyles, TextStyles } from "@/constants/Styles";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useUser();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const router = useRouter();
  const version = Constants.expoConfig?.version;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isKeyboardVisible ? 0 : 1, { damping: 15 }),
      transform: [
        {
          translateY: withSpring(isKeyboardVisible ? -100 : 0, { damping: 15 }),
        },
      ],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isKeyboardVisible ? 1.5 : 1),
        },
      ],
    };
  });

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = t("Index.plaseTryAgain");

      // Handle specific auth error codes
      if (error?.message) {
        switch (error.code) {
          case "invalid_credentials":
            errorMessage = t("Index.invalidCredentials");
            break;
          case "email_not_confirmed":
            errorMessage = t("Index.emailNotConfirmed");
            break;
          case "user_not_found":
            errorMessage = t("Index.userNotFound");
            break;
          case "over_request_rate_limit":
            errorMessage = t("Index.tooManyRequests");
            break;
          case "user_banned":
            errorMessage = t("Index.userBanned");
            break;
          default:
            errorMessage = error.message;
        }
      }

      showErrorToast(t("Index.loginError"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user]);

  return (
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? [theme.red[9], theme.primary[9]]
          : [theme.red[5], theme.primary[5]]
      }
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <VStack
            space="xl"
            width="100%"
            alignItems="center"
            marginBottom={40}
          >
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <Image
                source={require("@/assets/images/logo-white.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.View style={titleAnimatedStyle}>
              <Heading size="2xl" color="$white">
                edutime.ch
              </Heading>
            </Animated.View>
          </VStack>
          <VStack space="xl" width="100%">
            <FormControl isInvalid={!!errors?.email}>
              <FormControlLabel>
                <FormControlLabelText color="white" marginBottom={5}>
                  {t("Index.email")}
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="email"
                control={control}
                rules={{
                  required: t("Index.emailRequired"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("Index.emailInvalid"),
                  },
                }}
                render={({
                  field: { onChange, value },
                }: {
                  field: { onChange: (text: string) => void; value: string };
                }) => (
                  <Input size="xl" bg="$white">
                    <InputField
                      placeholder={t("Index.email-placeholder")}
                      value={value}
                      keyboardType="email-address"
                      onChangeText={onChange}
                      autoCapitalize="none"
                      color="$black"
                      size="md"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText color="$white">
                  {errors?.email?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <VStack space="xs">
              <FormControl isInvalid={!!errors?.password}>
                <FormControlLabel>
                  <FormControlLabelText color="white" marginBottom={5}>
                    {t("Index.password")}
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  defaultValue=""
                  name="password"
                  control={control}
                  rules={{
                    required: t("Index.passwordRequired"),
                  }}
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <Input size="xl" bg="$white">
                      <InputField
                        type={showPassword ? "text" : "password"}
                        placeholder={t("Index.password-placeholder")}
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        color="$black"
                        size="md"
                      />
                      <InputSlot 
                        onPress={handleState}
                        width={48}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <InputIcon 
                          as={showPassword ? EyeIcon : EyeOffIcon} 
                          color="$black"
                        />
                      </InputSlot>
                    </Input>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText color="$white">
                    {errors?.password?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Forgot password link under password field */}
              <Button
                variant="link"
                onPress={() => Linking.openURL('https://edutime.ch/recover')}
                size="sm"
                alignSelf="flex-end"
              >
                <ButtonText color="$white">
                  {t("Index.forgotPassword")}
                </ButtonText>
              </Button>
            </VStack>

            <VStack space="md" marginBottom={20}>
              <Button
                isDisabled={loading}
                onPress={handleSubmit(onSubmit)}
                variant="outline"
                action="primary"
                size="lg"
                borderColor="$white"
              >
                <ButtonText color="$white">
                  {t("Index.login")}
                </ButtonText>
              </Button>
              <Button
                variant="link"
                onPress={() => Linking.openURL('https://edutime.ch/no-account')}
                size="md"
              >
                <ButtonText color="$white">
                  {t("Index.noAccount")}
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v{version}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.container,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "70%",
    height: 100,
    alignSelf: "center",
    marginBottom: 0,
  },
  versionContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionText: {
    ...TextStyles.small,
    color: "white",
    opacity: 0.8,
  },
});
