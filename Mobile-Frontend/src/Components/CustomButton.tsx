import React from "react";
import { ActivityIndicator, Button } from "react-native-paper";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface CustomButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  labelColor?: string;
  onPress?: () => void;
  mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
  disabled?: boolean;
  loading?: boolean;
}

const CustomButton = ({
  children,
  style,
  backgroundColor,
  labelColor,
  onPress,
  mode = "contained",
  loading,
  disabled = false,
}: CustomButtonProps) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;

  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: backgroundColor || primaryColor },
        style,
      ]}
      labelStyle={[styles.label, { color: labelColor || "white" }]}
    >
      {children} {"\t "}
      {loading && <ActivityIndicator size={18} color="#ffcd47" />}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default CustomButton;
