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
      text: "Hello 👋 I’m Titan Ai. Ask me anything.",
      isUser: false,
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

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
          text: "Thinking... 🤖",
          isUser: false,
        },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 700);
  };

  const theme = dark
    ? {
        bg: "#292929",
        surface: "#a2a2a4",
        user: "#6a6a6a",
        bot: "#6a6a6a",
        text: "#ffffff",
      }
    : {
        bg: "#f3f4f6",
        surface: "#ffffff",
        user: "#e94560",
        bot: "#dbeafe",
        text: "#111827",
      };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>
          TITAN AI ✨
        </Text>

        <TouchableOpacity onPress={() => setDark(!dark)}>
          <Text style={{ color: theme.text, fontSize: 18 }}>
            {dark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
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
                backgroundColor: item.isUser ? theme.user : theme.bot,
                alignSelf: item.isUser ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={{ color: "#fff" }}>{item.text}</Text>
          </View>
        )}
      />

      {/* Suggestions */}
      <View style={styles.suggestions}>
        <TouchableOpacity style={[styles.tag, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text }}>Tell me a joke</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tag, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text }}>Fun fact</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={[styles.inputArea, { backgroundColor: theme.surface }]}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type message..."
          placeholderTextColor="#888"
          style={[styles.input, { color: theme.text }]}
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
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "700",
  },

  bubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
    maxWidth: "80%",
  },

  suggestions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },

  inputArea: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    height: 44,
  },

  sendBtn: {
    backgroundColor: "#575454",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
