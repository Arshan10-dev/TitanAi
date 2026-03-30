import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  createContext,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Switch,
  ViewStyle,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface SettingsState {
  darkMode: boolean;
  streamingEnabled: boolean;
  soundEnabled: boolean;
  fontSize: "sm" | "md" | "lg";
}

// ─── Theme Definition ─────────────────────────────────────────────────────────

interface Theme {
  bg: string;
  sidebar: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  inputBg: string;
  border: string;
  borderLight: string;
  accent: string;
  accentDark: string;
  accentGlow: string;
  userBubble: string;
  userBubbleBorder: string;
  aiBubble: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  white: string;
  statusBar: "light-content" | "dark-content";
}

const DARK: Theme = {
  bg: "#212121",
  sidebar: "#171717",
  surface: "#2a2a2a",
  surfaceHover: "#303030",
  surfaceActive: "#383838",
  inputBg: "#2f2f2f",
  border: "#3a3a3a",
  borderLight: "#454545",
  accent: "#2f2f2f",
  accentDark: "#505050",
  accentGlow: "rgba(16,163,127,0.12)",
  userBubble: "#2f2f2f",
  userBubbleBorder: "#484848",
  aiBubble: "transparent",
  textPrimary: "#ececec",
  textSecondary: "#9a9a9a",
  textMuted: "#555555",
  white: "#ffffff",
  statusBar: "light-content",
};

const LIGHT: Theme = {
  bg: "#ffffff",
  sidebar: "#f9f9f9",
  surface: "#f0f0f0",
  surfaceHover: "#e9e9e9",
  surfaceActive: "#e2e2e2",
  inputBg: "#f4f4f4",
  border: "#e5e5e5",
  borderLight: "#d8d8d8",
  accent: "#2f2f2f",
  accentDark: "#505050",
  accentGlow: "rgba(16,163,127,0.10)",
  userBubble: "#efefef",
  userBubbleBorder: "#e0e0e0",
  aiBubble: "transparent",
  textPrimary: "#1a1a1a",
  textSecondary: "#555555",
  textMuted: "#aaaaaa",
  white: "#ffffff",
  statusBar: "dark-content",
};

// ─── Theme Context ─────────────────────────────────────────────────────────────

const ThemeCtx = createContext<Theme>(DARK);
const useTheme = () => useContext(ThemeCtx);

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get("window");
const SIDEBAR_W = 272;
const FONT = {
  mono: Platform.OS === "ios" ? "Menlo" : "monospace",
  sans: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const AI_RESPONSES = [
  "That's a great question. Based on what you've shared, there are several angles worth exploring. The key insight here is that nuance matters — rarely does a single solution fit all contexts.",
  "Here's what I'd suggest:\n\n1. Start small — break the problem into manageable chunks.\n2. Iterate quickly — test your assumptions early.\n3. Measure outcomes — define success before you begin.\n\nWould you like me to dive deeper into any of these?",
  "The short answer is yes — but with important caveats. The longer answer involves understanding the tradeoffs between performance, maintainability, and scalability.",
  "Here's a concise breakdown:\n\nPros: Faster iteration, lower upfront cost, flexible architecture.\nCons: Technical debt risk, harder to scale without planning.\n\nStart with a clear design document before writing any code.",
  "That's one of the most common challenges in this space. The solution that works best is a layered approach — handling simple cases first, then adding complexity only where needed.",
];

const SEED_CHATS: Chat[] = [
  {
    id: "1",
    title: "React Native architecture",
    createdAt: new Date(Date.now() - 86400000),
    messages: [
      { id: "m1", role: "user", content: "What's the best architecture for a large React Native app?", timestamp: new Date(Date.now() - 86400000) },
      { id: "m2", role: "assistant", content: AI_RESPONSES[1], timestamp: new Date(Date.now() - 86300000) },
    ],
  },
  {
    id: "2",
    title: "TypeScript generics explained",
    createdAt: new Date(Date.now() - 172800000),
    messages: [
      { id: "m3", role: "user", content: "Can you explain TypeScript generics with examples?", timestamp: new Date(Date.now() - 172800000) },
      { id: "m4", role: "assistant", content: AI_RESPONSES[0], timestamp: new Date(Date.now() - 172700000) },
    ],
  },
  { id: "3", title: "Tailwind vs StyleSheet", createdAt: new Date(Date.now() - 259200000), messages: [] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

// ─── TypingDots ───────────────────────────────────────────────────────────────

function TypingDots() {
  const t = useTheme();
  const d0 = useRef(new Animated.Value(0)).current;
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(580 - delay),
        ])
      );
    const a0 = anim(d0, 0);
    const a1 = anim(d1, 150);
    const a2 = anim(d2, 300);
    a0.start(); a1.start(); a2.start();
    return () => { a0.stop(); a1.stop(); a2.stop(); };
  }, []);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <View style={[st.aiAvatar, { backgroundColor: t.accent }]}>
          <Text style={st.avatarTxt}>✦</Text>
        </View>
        <View style={[st.bubble, { backgroundColor: t.surface, borderColor: t.border, paddingVertical: 14, paddingHorizontal: 16 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {[d0, d1, d2].map((dot, i) => (
              <Animated.View
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent,
                  opacity: dot,
                  transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const t = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  const isUser = message.role === "user";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 250, delay: 20, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 250, delay: 20, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        st.msgRow,
        isUser ? st.userRow : st.aiRow,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      {!isUser && (
        <View style={[st.aiAvatar, { backgroundColor: t.accent }]}>
          <Text style={st.avatarTxt}>✦</Text>
        </View>
      )}
      <View
        style={[
          st.bubble,
          isUser
            ? { backgroundColor: t.userBubble, borderColor: t.userBubbleBorder, borderBottomRightRadius: 4 }
            : { backgroundColor: t.aiBubble, borderColor: "transparent", borderBottomLeftRadius: 4 },
        ]}
      >
        <Text style={[st.bubbleTxt, { color: t.textPrimary }]}>{message.content}</Text>
        <Text style={[st.ts, { color: t.textMuted }]}>{fmtTime(message.timestamp)}</Text>
      </View>
      {isUser && (
        <View style={[st.userAvatar, { backgroundColor: t.accentDark }]}>
          <Text style={st.avatarTxt}>Y</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({
  visible, settings, onClose, onUpdate,
}: {
  visible: boolean;
  settings: SettingsState;
  onClose: () => void;
  onUpdate: (s: SettingsState) => void;
}) {
  const t = useTheme();
  const slide = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 0 : 400, duration: 290, useNativeDriver: true }).start();
  }, [visible]);

  const toggle = (key: keyof SettingsState) =>
    onUpdate({ ...settings, [key]: !(settings[key] as boolean) });

  const rows: { label: string; sub: string; key: keyof SettingsState }[] = [
    { label: "Dark Mode", sub: "Switch between light and dark theme", key: "darkMode" },
    { label: "Response Streaming", sub: "Stream AI replies as they generate", key: "streamingEnabled" },
    { label: "Sound Effects", sub: "Play sounds on new messages", key: "soundEnabled" },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        style={[st.backdrop, { backgroundColor: settings.darkMode ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.22)" }]}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[st.settingsPanel, { backgroundColor: t.sidebar, borderLeftColor: t.border, transform: [{ translateX: slide }] }]}
      >
        <View style={[st.settingsHead, { borderBottomColor: t.border }]}>
          <Text style={[st.settingsTitle, { color: t.textPrimary }]}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Text style={{ color: t.textSecondary, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={st.settingsBody} showsVerticalScrollIndicator={false}>
          {/* Toggles */}
          <Text style={[st.sectionLabel, { color: t.textMuted }]}>PREFERENCES</Text>
          {rows.map((row) => (
            <View key={row.key} style={[st.settingRow, { borderBottomColor: t.border }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[st.settingLabel, { color: t.textPrimary }]}>{row.label}</Text>
                <Text style={[st.settingSub, { color: t.textMuted }]}>{row.sub}</Text>
              </View>
              <Switch
                value={settings[row.key] as boolean}
                onValueChange={() => toggle(row.key)}
                thumbColor={(settings[row.key] as boolean) ? t.accent : t.textMuted}
                trackColor={{ false: t.border, true: t.accentDark }}
                ios_backgroundColor={t.border}
              />
            </View>
          ))}

          {/* Font size */}
          <Text style={[st.sectionLabel, { color: t.textMuted, marginTop: 26 }]}>FONT SIZE</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {(["sm", "md", "lg"] as const).map((sz) => {
              const on = settings.fontSize === sz;
              return (
                <TouchableOpacity
                  key={sz}
                  style={[
                    st.fszBtn,
                    { backgroundColor: on ? t.accentGlow : t.surface, borderColor: on ? t.accent : t.border },
                  ]}
                  onPress={() => onUpdate({ ...settings, fontSize: sz })}
                >
                  <Text style={[st.fszTxt, { color: on ? t.accent : t.textSecondary }]}>{sz.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* About */}
          <Text style={[st.sectionLabel, { color: t.textMuted, marginTop: 26 }]}>ABOUT</Text>
          <View style={[st.aboutCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[{ fontSize: 14, fontWeight: "700", marginBottom: 3, fontFamily: FONT.sans }, { color: t.textPrimary }]}>
              Titan AI
            </Text>
            <Text style={[{ fontSize: 12, fontFamily: FONT.mono }, { color: t.textMuted }]}>
              Version 1.0.0 · Built with React Native
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  chats, activeChatId, visible, searchQuery,
  onSelectChat, onNewChat, onSearchChange, onOpenSettings, onClose,
}: {
  chats: Chat[];
  activeChatId: string;
  visible: boolean;
  searchQuery: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const slide = useRef(new Animated.Value(-SIDEBAR_W)).current;

  useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 0 : -SIDEBAR_W, duration: 260, useNativeDriver: true }).start();
  }, [visible]);

  const filtered = chats.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const now = Date.now();
  const grouped = {
    Today: filtered.filter((c) => new Date().toDateString() === c.createdAt.toDateString()),
    "This Week": filtered.filter((c) => { const d = now - c.createdAt.getTime(); return d > 86400000 && d < 604800000; }),
    Older: filtered.filter((c) => now - c.createdAt.getTime() >= 604800000),
  };

  return (
    <>
      {visible && SW < 768 && (
        <TouchableOpacity
          style={[st.backdrop, { backgroundColor: "rgba(0,0,0,0.42)" }]}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[st.sidebar, { backgroundColor: t.sidebar, borderRightColor: t.border, transform: [{ translateX: slide }] }]}
      >
        {/* Logo */}
        <View style={st.logoRow}>
          <View style={[st.logoMark, { backgroundColor: t.accent }]}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>✦</Text>
          </View>
          <Text style={[st.logoTxt, { color: t.textPrimary }]}>Titan</Text>
        </View>

        {/* New chat */}
        <TouchableOpacity
          style={[
            st.newBtn,
            {
              backgroundColor: t.surface,
              borderColor: t.border,
            },
          ]}
          onPress={onNewChat}
          activeOpacity={0.75}
        >
          <Text
            style={{
              fontSize: 18,
              marginRight: 8,
              lineHeight: 20,
              color: t.textSecondary,
            }}
          >
            ＋
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              fontFamily: FONT.sans,
              color: t.textPrimary,
            }}
          >
            New conversation
          </Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={[st.searchBar, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[{ fontSize: 16, marginRight: 8 }, { color: t.textMuted }]}>⌕</Text>
          <TextInput
            style={[{ flex: 1, fontSize: 13, padding: 0, fontFamily: FONT.sans }, { color: t.textPrimary }]}
            placeholder="Search chats..."
            placeholderTextColor={t.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Chat list */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {(Object.keys(grouped) as (keyof typeof grouped)[]).map((group) =>
            grouped[group].length > 0 ? (
              <View key={group}>
                <Text style={[st.groupLabel, { color: t.textMuted }]}>{group}</Text>
                {grouped[group].map((chat) => {
                  const active = activeChatId === chat.id;
                  return (
                    <TouchableOpacity
                      key={chat.id}
                      style={[st.chatRow, active && { backgroundColor: t.surfaceActive }]}
                      onPress={() => { onSelectChat(chat.id); onClose(); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[{ fontSize: 12, marginRight: 8, opacity: 0.55 }, { color: t.textSecondary }]}>💬</Text>
                      <Text
                        style={[st.chatRowTxt, { color: active ? t.textPrimary : t.textSecondary }, active && { fontWeight: "500" as const }]}
                        numberOfLines={1}
                      >
                        {trunc(chat.title, 28)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null
          )}
        </ScrollView>

        {/* Bottom */}
        <View style={[st.sidebarFoot, { borderTopColor: t.border }]}>
          <TouchableOpacity style={st.footBtn} onPress={onOpenSettings} activeOpacity={0.7}>
            <Text style={[{ fontSize: 15, marginRight: 10 }, { color: t.textSecondary }]}>⚙</Text>
            <Text style={[{ fontSize: 14, fontFamily: FONT.sans }, { color: t.textSecondary }]}>Settings</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}>
            <View style={[st.profAvatar, { backgroundColor: t.accentDark }]}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Y</Text>
            </View>
            <View>
              <Text style={[{ fontSize: 13.5, fontWeight: "600", fontFamily: FONT.sans }, { color: t.textPrimary }]}>You</Text>
              <Text style={[{ fontSize: 11, fontFamily: FONT.sans }, { color: t.textMuted }]}>Free plan</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────

function ChatWindow({
  chat, isTyping, inputText, fontSize, onSendMessage, onInputChange, onMenuPress,
}: {
  chat: Chat | null;
  isTyping: boolean;
  inputText: string;
  fontSize: "sm" | "md" | "lg";
  onSendMessage: (t: string) => void;
  onInputChange: (t: string) => void;
  onMenuPress: () => void;
}) {
  const t = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const fs = fontSize === "sm" ? 13 : fontSize === "lg" ? 16 : 14.5;
  const canSend = inputText.trim().length > 0;

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [chat?.messages.length, isTyping]);

  return (
    <View style={[st.chatWin, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={[st.chatHead, { backgroundColor: t.bg, borderBottomColor: t.border }]}>
        <TouchableOpacity style={{ padding: 6, marginRight: 12 }} onPress={onMenuPress} activeOpacity={0.7}>
          <Text style={[{ fontSize: 18 }, { color: t.textSecondary }]}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View style={[st.headLogo, { backgroundColor: t.accent }]}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>✦</Text>
          </View>
          <Text style={[{ fontSize: 16, fontWeight: "700", fontFamily: FONT.sans }, { color: t.textPrimary }]}>Titan AI</Text>
        </View>
        <View style={[st.badge, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[{ fontSize: 11, fontWeight: "600", fontFamily: FONT.mono }, { color: t.textSecondary }]}>GPT-4</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={st.msgList} showsVerticalScrollIndicator={false}>
        {!chat || chat.messages.length === 0 ? (
          <View style={st.empty}>
            <View style={[st.emptyIcon, { backgroundColor: t.accentGlow, borderColor: t.accentDark }]}>
              <Text style={[{ fontSize: 26 }, { color: t.accent }]}>✦</Text>
            </View>
            <Text style={[st.emptyH, { color: t.textPrimary }]}>How can I help you today?</Text>
            <Text style={[st.emptySub, { color: t.textSecondary }]}>Ask me anything — I'm here to assist.</Text>
            <View style={st.chips}>
              {["Explain quantum entanglement", "Write a Python script", "Plan a trip to Japan", "Summarize a concept"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[st.chip, { backgroundColor: t.surface, borderColor: t.borderLight }]}
                  onPress={() => onSendMessage(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[{ fontSize: 13, fontFamily: FONT.sans }, { color: t.textSecondary }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          chat.messages.map((m, i) => <MessageBubble key={m.id} message={m} />)
        )}
        {isTyping && <TypingDots />}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[st.inputArea, { backgroundColor: t.bg, borderTopColor: t.border }]}>
          <View style={[st.inputRow, { backgroundColor: t.inputBg, borderColor: t.border }]}>
            <TextInput
              style={[st.input, { color: t.textPrimary, fontSize: fs }]}
              placeholder="Message Titan..."
              placeholderTextColor={t.textMuted}
              value={inputText}
              onChangeText={onInputChange}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[st.sendBtn, { backgroundColor: canSend ? t.accent : t.border }]}
              onPress={() => { const tx = inputText.trim(); if (tx) onSendMessage(tx); }}
              disabled={!canSend}
              activeOpacity={0.75}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", lineHeight: 20 }}>↑</Text>
            </TouchableOpacity>
          </View>
          <Text style={[st.hint, { color: t.textMuted }]}>Titan can make mistakes. Consider checking important info.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [chats, setChats] = useState<Chat[]>(SEED_CHATS);
  const [activeChatId, setActiveChatId] = useState(SEED_CHATS[0].id);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(SW >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: true,
    streamingEnabled: true,
    soundEnabled: false,
    fontSize: "md",
  });

  // ← One line: dark mode toggle instantly swaps the entire theme object
  const theme = useMemo<Theme>(() => (settings.darkMode ? DARK : LIGHT), [settings.darkMode]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const handleNewChat = useCallback(() => {
    const id = uid();
    setChats((p) => [{ id, title: "New conversation", messages: [], createdAt: new Date() }, ...p]);
    setActiveChatId(id);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const msg: Message = { id: uid(), role: "user", content: text, timestamp: new Date() };
      setChats((p) =>
        p.map((c) =>
          c.id === activeChatId
            ? { ...c, title: c.messages.length === 0 ? trunc(text, 32) : c.title, messages: [...c.messages, msg] }
            : c
        )
      );
      setInputText("");
      setIsTyping(true);
      setTimeout(() => {
        const ai: Message = { id: uid(), role: "assistant", content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)], timestamp: new Date() };
        setChats((p) => p.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, ai] } : c)));
        setIsTyping(false);
      }, 1200 + Math.random() * 1000);
    },
    [activeChatId]
  );

  return (
    <ThemeCtx.Provider value={theme}>
      <SafeAreaView style={[st.root, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.sidebar} />
        <View style={st.layout}>
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            visible={sidebarOpen}
            searchQuery={searchQuery}
            onSelectChat={setActiveChatId}
            onNewChat={handleNewChat}
            onSearchChange={setSearchQuery}
            onOpenSettings={() => setSettingsOpen(true)}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatWindow
            chat={activeChat}
            isTyping={isTyping}
            inputText={inputText}
            fontSize={settings.fontSize}
            onSendMessage={handleSend}
            onInputChange={setInputText}
            onMenuPress={() => setSidebarOpen((v) => !v)}
          />
        </View>
        <SettingsPanel
          visible={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onUpdate={setSettings}
        />
      </SafeAreaView>
    </ThemeCtx.Provider>
  );
}

// ─── Styles (layout / shape only — zero hardcoded colors) ────────────────────

const st = StyleSheet.create({
  root: { flex: 1 },
  layout: { flex: 1, flexDirection: "row", overflow: "hidden" },

  sidebar: {
    width: SIDEBAR_W,
    borderRightWidth: 1,
    position: (SW < 768 ? "absolute" : "relative") as ViewStyle["position"],
    top: 0, bottom: 0, left: 0,
    zIndex: 100,
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingHorizontal: 4 },
  logoMark: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 10 },
  logoTxt: { fontSize: 18, fontWeight: "700", letterSpacing: 0.4, fontFamily: FONT.sans },
  newBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 14, borderWidth: 1 },
  groupLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, marginTop: 14, marginBottom: 5, paddingHorizontal: 4, fontFamily: FONT.sans },
  chatRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2 },
  chatRowTxt: { flex: 1, fontSize: 13.5, fontFamily: FONT.sans },
  sidebarFoot: { paddingTop: 12, borderTopWidth: 1 },
  footBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 10 },
  profAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 10 },

  chatWin: { flex: 1 },
  chatHead: { height: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1 },
  headLogo: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center", marginRight: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },

  msgList: { paddingVertical: 20, paddingHorizontal: 16, flexGrow: 1 },
  msgRow: { marginBottom: 16, flexDirection: "row", alignItems: "flex-end" },
  userRow: { justifyContent: "flex-end" },
  aiRow: { justifyContent: "flex-start" },
  bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  bubbleTxt: { fontSize: 14.5, lineHeight: 22, fontFamily: FONT.sans },
  ts: { fontSize: 10, marginTop: 5, alignSelf: "flex-end", fontFamily: FONT.mono },
  aiAvatar: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 8, marginBottom: 2 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 8, marginBottom: 2 },
  avatarTxt: { color: "#fff", fontSize: 11, fontWeight: "800" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 20 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyH: { fontSize: 22, fontWeight: "700", marginBottom: 8, textAlign: "center", fontFamily: FONT.sans },
  emptySub: { fontSize: 14, textAlign: "center", marginBottom: 28, fontFamily: FONT.sans },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, margin: 4 },

  inputArea: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, borderTopWidth: 1 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  input: { flex: 1, maxHeight: 120, lineHeight: 22, padding: 0, fontFamily: FONT.sans },
  sendBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  hint: { fontSize: 10.5, textAlign: "center", marginTop: 8, fontFamily: FONT.sans },

  settingsPanel: {
    position: "absolute", top: 0, right: 0, bottom: 0,
    width: Math.min(SW * 0.85, 340),
    borderLeftWidth: 1, zIndex: 200,
  },
  settingsHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  settingsTitle: { fontSize: 18, fontWeight: "700", fontFamily: FONT.sans },
  settingsBody: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginBottom: 12, fontFamily: FONT.sans },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1 },
  settingLabel: { fontSize: 14, fontWeight: "500", marginBottom: 2, fontFamily: FONT.sans },
  settingSub: { fontSize: 12, fontFamily: FONT.sans },
  fszBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  fszTxt: { fontSize: 12, fontWeight: "700", fontFamily: FONT.mono },
  aboutCard: { borderRadius: 10, padding: 14, borderWidth: 1 },
});
