import { StyleSheet, View, TouchableOpacity, Modal, Platform } from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import { Spinner } from '@gluestack-ui/themed';
import { HapticFeedback } from '@/lib/haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@gluestack-ui/themed';

interface CreateTimerRecordButtonProps {
  onCreateAndRestart: () => Promise<void>;
  onSaveAndContinue: () => Promise<void>;
  onPress: () => void;
  children: React.ReactNode;
}

export const CreateTimerRecordButton = ({
  onCreateAndRestart,
  onSaveAndContinue,
  onPress,
  children,
}: CreateTimerRecordButtonProps) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuSelect = async (key: string) => {
    try {
      HapticFeedback.light();
      setLoading(key);
      setShowMenu(false);
      
      if (key === "createAndRestart") {
        await onCreateAndRestart();
      } else if (key === "saveAndContinue") {
        await onSaveAndContinue();
      }
    } catch (error) {
      console.error('Error in handleMenuSelect:', error);
    } finally {
      setLoading(null);
    }
  };

  const toggleMenu = () => {
    HapticFeedback.light();
    setShowMenu(!showMenu);
  };

  return (
    <View style={styles.container}>
      <Button
        size="md"
        variant="solid"
        onPress={() => {
          HapticFeedback.light();
          onPress();
        }}
        style={styles.mainButton}
        android_ripple={{
          color: Colors[colorScheme ?? "light"].primary[8],
        }}
        pressRetentionOffset={{ top: 50, left: 50, right: 50, bottom: 50 }}
      >
        <ButtonText color="white">{children}</ButtonText>
      </Button>

      <Button
        size="md"
        variant="solid"
        style={styles.secondaryButton}
        android_ripple={{
          color: Colors[colorScheme ?? "light"].primary[1],
        }}
        onPress={toggleMenu}
        pressRetentionOffset={{ top: 50, left: 50, right: 50, bottom: 50 }}
      >
        <IconSymbol name="chevron.up" size={20} color="white" />
      </Button>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[
            styles.menuContainer,
            {
              backgroundColor: colorScheme === "dark" ? "black" : "white",
              borderColor: colorScheme === "dark" ? Colors.dark.gray[6] : "#ddd",
            }
          ]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuSelect("createAndRestart")}
              disabled={loading === "createAndRestart"}
            >
              <View style={styles.menuItemContent}>
                {loading === "createAndRestart" ? (
                  <Spinner size="small" color={Colors[colorScheme ?? "light"].primary[8]} />
                ) : (
                  <IconSymbol
                    name="repeat"
                    size={18}
                    color={colorScheme === "dark" ? Colors.dark.primary[6] : Colors.light.primary[8]}
                  />
                )}
                <Text
                  size="sm"
                  color={colorScheme === "dark" ? "white" : "black"}
                  style={styles.menuItemText}
                >
                  {t("Index.createAndRestart")}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[
              styles.menuSeparator,
              { backgroundColor: colorScheme === "dark" ? Colors.dark.gray[6] : "#ddd" }
            ]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuSelect("saveAndContinue")}
              disabled={loading === "saveAndContinue"}
            >
              <View style={styles.menuItemContent}>
                {loading === "saveAndContinue" ? (
                  <Spinner size="small" color={Colors[colorScheme ?? "light"].primary[8]} />
                ) : (
                  <IconSymbol
                    name="square.and.arrow.down"
                    size={18}
                    color={colorScheme === "dark" ? Colors.dark.primary[6] : Colors.light.primary[8]}
                  />
                )}
                <Text
                  size="sm"
                  color={colorScheme === "dark" ? "white" : "black"}
                  style={styles.menuItemText}
                >
                  {t("Index.saveAndContinue")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  secondaryButton: {
    width: Platform.OS === 'android' ? 60 : 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 100,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuSeparator: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 16,
  },
});