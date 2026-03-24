import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = "You: " + message;
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await fetch("http://192.168.0.106:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setChat((prev) => [...prev, "Titan AI: " + data.reply]);
    } catch (err) {
      setChat((prev) => [...prev, "Titan AI: Backend not reachable ❌"]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Titan AI</Text>

      <ScrollView style={styles.chat}>
        {chat.map((msg, index) => (
          <Text key={index} style={styles.msg}>{msg}</Text>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.button}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#0f172a" },
  title: { color: "#fff", fontSize: 22, textAlign: "center", marginBottom: 10 },
  chat: { flex: 1, marginVertical: 10 },
  msg: { color: "#e5e7eb", marginVertical: 4 },
  inputRow: { flexDirection: "row" },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginLeft: 6,
    borderRadius: 6,
  },
});
