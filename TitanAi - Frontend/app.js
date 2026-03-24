import { ThemeProvider } from "./components/ThemeContext";
import ChatScreen from "./screens/ChatScreen";

export default function App() {
  console.log("NEW UI LOADED");
  return (
    <ThemeProvider>
      <ChatScreen />
    </ThemeProvider>
  );
}
