import { View, Text, StyleSheet } from "react-native";

export default function ChatBubble({ text, isUser, theme }) {
  return (
    <View
      style={[
        styles.bubble,
        {
          backgroundColor: isUser ? theme.userBubble : theme.aiBubble,
          alignSelf: isUser ? "flex-end" : "flex-start",
        },
      ]}
    >
      <Text style={{ color: theme.text }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    marginVertical: 6,
    maxWidth: "80%",
    borderRadius: 14,
  },
});
