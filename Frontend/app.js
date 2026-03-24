import { ThemeProvider } from "./components/ThemeContext";
import ChatBubbles from "./components/ChatBubbles";
import ChatScreen from "./screens/ChatScreen";

export default function App() {
  console.log("NEW UI LOADED");
  return (
    <ThemeProvider>
      <ChatScreen />
    </ThemeProvider>
  );
}
