import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function Index() {
  const [dark, setDark] = useState(true);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      id: "1",
      text: "Hello 👋 I’m TITAN AI. Ask me anything.",
      isUser: false,
    },
  ]);

  const [history] = useState([
    "How are you?",
    "Tell me a joke",
    "What is AI?",
  ]);

  const flatListRef = useRef<FlatList>(null);

  const theme = dark
    ? {
        bg: "#212121",
        surface: "#2f2f2f",
        input: "#303030",
        user: "#2b6de9",
        ai: "#2a2a2a",
        text: "#ffffff",
        sub: "#9ca3af",
      }
    : {
        bg: "#f7f7f8",
        surface: "#ececf1",
        input: "#ffffff",
        user: "#2b6de9",
        ai: "#ffffff",
        text: "#111827",
        sub: "#6b7280",
      };

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };

    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          text: "This is AI response ✨",
          isUser: false,
        },
      ]);

      flatListRef.current?.scrollToEnd({ animated: true });
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>TITAN AI</Text>

        <TouchableOpacity onPress={() => setDark(!dark)}>
          <Text style={{ color: theme.text, fontSize: 18 }}>
            {dark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      <View style={styles.historyRow}>
        {history.map((item, index) => (
          <View
            key={index}
            style={[styles.historyTag, { backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.sub, fontSize: 12 }}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Chat */}
      <FlatList
        ref={flatListRef}
        data={chat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: item.isUser ? theme.user : theme.ai,
                alignSelf: item.isUser ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text
              style={{
                color: item.isUser ? "#fff" : theme.text,
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={[styles.inputWrap, { backgroundColor: theme.surface }]}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message TITAN..."
          placeholderTextColor={theme.sub}
          style={[
            styles.input,
            {
              backgroundColor: theme.input,
              color: theme.text,
            },
          ]}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  historyRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 8,
  },

  historyTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  bubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
    maxWidth: "80%",
  },

  inputWrap: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2b6de9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
