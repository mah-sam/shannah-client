// @ts-nocheck
import { Button, Modal, Text } from "@ui-kitten/components";
import { Pressable, StyleSheet, View } from "react-native";
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
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}
      animationType="fade"
    >
      <View style={styles.container}>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    width: 300,
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
