// @ts-nocheck
import { Button, Text } from "@ui-kitten/components";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import * as theme from "../../theme.json";

export interface FilterOption<T> {
  label: string;
  value: T;
}

interface FilterSheetProps<T> {
  visible: boolean;
  title: string;
  options: FilterOption<T>[];
  value: T | null;
  onSelect: (next: T | null) => void;
  onClose: () => void;
}

// Uses the native React Native <Modal> rather than UI Kitten's ModalService-
// backed variant. UI Kitten's Modal measures the child after mount to center
// it absolutely; on slower devices this causes a visible reposition jump on
// open (looks like the sheet "shakes"). The native Modal + flex-centered
// overlay mounts in its final position, so the open is stable.
export function FilterSheet<T>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: FilterSheetProps<T>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable stops taps inside the sheet from dismissing it. */}
        <Pressable onPress={() => {}} style={styles.container}>
          <Text category="h6" style={styles.title}>
            {title}
          </Text>
          <View style={styles.optionsList}>
            {options.map((opt, idx) => {
              const selected = opt.value === value;
              return (
                <Pressable
                  key={idx}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selected ? <View style={styles.checkDot} /> : null}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.buttonsRow}>
            <Button
              appearance="ghost"
              status="basic"
              onPress={() => {
                onSelect(null);
                onClose();
              }}
            >
              {() => <Text style={styles.clearText}>مسح</Text>}
            </Button>
            <Button appearance="outline" status="basic" onPress={onClose}>
              {() => <Text style={styles.closeText}>إلغاء</Text>}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    padding: 16,
    backgroundColor: theme["color-basic-100"],
    borderRadius: 16,
    gap: 12,
  },
  title: {
    color: theme["text-heading-color"],
    textAlign: "center",
  },
  optionsList: {
    gap: 6,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme["color-primary-25"],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionSelected: {
    borderColor: theme["color-primary-500"],
    backgroundColor: theme["color-primary-25"],
  },
  optionText: {
    color: theme["text-heading-color"],
  },
  optionTextSelected: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalBold",
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme["color-primary-500"],
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  clearText: {
    color: theme["text-body-color"],
  },
  closeText: {
    color: theme["text-heading-color"],
  },
});
