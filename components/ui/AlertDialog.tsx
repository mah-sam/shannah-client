import { Modal, Text } from "@ui-kitten/components";
import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, View } from "react-native";

const AlertDialog = ({
  visible = true,
  title = "Alert",
  message = "",
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = "نعم",
  cancelText = "لا",
  isDangerous = false,
}) => {
  return (
    <Modal
      visible={visible}
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onBackdropPress={() => onCancel()}
      animationType="fade"
    >
      <View
        style={{
          width: 270,
          height: 144,
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 15,
          overflow: "hidden",
          backgroundColor: "rgba(179, 179, 179, 0.82)",
          paddingTop: 19,
          gap: 2,
        }}
      >
        <BlurView
          intensity={40}
          tint="regular"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 15,
            alignItems: "center",
          }}
        >
          <Text category="s1">{title}</Text>
          <Text category="s2" style={{ fontFamily: "Tajawal" }}>
            {message}
          </Text>
        </View>
        <View
          style={{
            height: 44,
            flexDirection: "row",
          }}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: 44,
              borderTopWidth: 0.33,
              borderTopColor: "rgba(60, 60, 67, 0.36)",
            }}
            onPress={() => onCancel()}
          >
            <Text style={{ fontSize: 16 }}>{cancelText}</Text>
          </Pressable>
          <View
            style={{
              width: 0.33,
              height: 44,
              backgroundColor: "rgba(60, 60, 67, 0.36)",
            }}
          ></View>
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: 44,
              borderTopWidth: 0.33,
              borderTopColor: "rgba(60, 60, 67, 0.36)",
            }}
            onPress={() => onConfirm()}
          >
            <Text
              style={{
                fontFamily: "TajawalMedium",
                fontSize: 16,
              }}
            >
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 300,
    height: 100,
    borderRadius: 15,
    overflow: "hidden",

    // Base fill (#B3B3B3 @ 82%)
    backgroundColor: "rgba(179, 179, 179, 0.82)",

    // Dark neutral wash (#383838 @ 100%)
    // This visually replaces color-dodge
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.25)",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    /* Frame */
    /* Auto layout */
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,

    /* Position */
    width: 270,
    height: 144,

    borderRadius: 15,

    /* Overlay with transparency */
    backgroundColor: "rgba(179, 179, 179, 0.82)",
  },
  alertContainer: {
    /* Frame */
    /* Auto layout */
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 19,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 2,

    /* Position */
    width: "100%",
    height: "100%",

    borderRadius: 15,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
    color: "#fff",
  },
  message: {
    textAlign: "center",
    color: "#e0e0e0",
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    width: "100%",
  },
  button: {
    flex: 1,
  },
});

export default AlertDialog;
