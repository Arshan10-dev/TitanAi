import { useState, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import ChatBubble from "../ChatBubbles";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function ChatScreen() {
  const { theme } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await fetch("https://titanai-backend-1hnb.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setChat((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch {
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "Backend not reachable ❌" },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: "red", fontSize: 40 }]}>
        TITAN TEST
      </Text>

      <FlatList
        data={chat}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <ChatBubble
            text={item.text}
            isUser={item.sender === "user"}
            theme={theme}
          />
        )}
      />

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: theme.userBubble }]}
          onPress={sendMessage}
        >
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#d0ea0b", paddingTop: 40 },
  header: {
    color: "#38bdf8",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 10,
  },
  bubble: {
    margin: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  user: { backgroundColor: "#38bdf8", alignSelf: "flex-end" },
  ai: { backgroundColor: "#1e293b", alignSelf: "flex-start" },
  text: { color: "#fff" },
  inputBox: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#1e293b",
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  sendBtn: {
    backgroundColor: "#38bdf8",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
});
