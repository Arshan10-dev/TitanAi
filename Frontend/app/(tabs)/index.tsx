import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

export default function Index() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { id: "1", text: "Hello 👋", isUser: false },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setChat([
      ...chat,
      { id: Date.now().toString(), text: message, isUser: true },
    ]);

    setMessage("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>TITAN AI 🚀</Text>

      <FlatList
        data={chat}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputArea}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type message..."
          placeholderTextColor="#999"
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.text}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d2e30",
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  header: {
    color: "#f5fafc",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 15,
  },
  bubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 14,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#1e293b",
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
  },
  inputArea: {
    flexDirection: "row",
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  sendBtn: {
    backgroundColor: "#d9dde5",
    marginLeft: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 10,
  },
});
