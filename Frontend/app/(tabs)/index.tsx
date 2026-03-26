import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function Index() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      id: "1",
      text: "Hello 👋 I’m TITAN AI. Ask me anything.",
      isUser: false,
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };

    setChat((prev) => [...prev, newMessage]);
    setMessage("");

    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          text: "Thinking... 🤖",
          isUser: false,
        },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.bubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.bubbleText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.main}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TITAN AI ✨</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={chat}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatArea}
      />

      <View style={styles.inputWrapper}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message TITAN..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0b1120",
  },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  headerTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
  },

  chatArea: {
    padding: 12,
    paddingBottom: 20,
  },

  bubble: {
    maxWidth: "80%",
    padding: 13,
    borderRadius: 18,
    marginVertical: 6,
  },

  userBubble: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },

  aiBubble: {
    backgroundColor: "#1e293b",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },

  bubbleText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 21,
  },

  inputWrapper: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0f172a",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 46,
    fontSize: 15,
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
