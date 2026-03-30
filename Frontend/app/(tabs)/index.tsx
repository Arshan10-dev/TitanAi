import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Switch,
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

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;

const COLORS = {
  bg: "#0d0d0f",
  sidebar: "#0a0a0c",
  surface: "#141416",
  surfaceHover: "#1c1c1f",
  border: "#242428",
  borderLight: "#2e2e34",
  accent: "#7c6af7",
  accentDim: "#4f46a8",
  accentGlow: "rgba(124,106,247,0.15)",
  userBubble: "#1e1b4b",
  aiBubble: "#141416",
  textPrimary: "#f0eff6",
  textSecondary: "#8884a0",
  textMuted: "#4a4860",
  inputBg: "#18181c",
  danger: "#e05c5c",
  success: "#4caf8a",
  white: "#ffffff",
};

const FONT = {
  mono: Platform.OS === "ios" ? "Menlo" : "monospace",
  sans: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
};

// ─── Mock AI Responses ────────────────────────────────────────────────────────

const AI_RESPONSES = [
  "That's an interesting question. Let me think through this carefully...\n\nBased on what you've shared, there are several angles worth exploring. The key insight here is that nuance matters — rarely does a single solution fit all contexts.",
  "Great point! Here's what I'd suggest:\n\n1. **Start small** — break the problem into manageable chunks.\n2. **Iterate quickly** — test your assumptions early.\n3. **Measure outcomes** — define what success looks like before you begin.\n\nWould you like me to dive deeper into any of these?",
  "I understand what you're looking for. The short answer is yes — but with some important caveats.\n\nThe longer answer involves understanding the tradeoffs between performance, maintainability, and scalability. Each of those deserves its own discussion.",
  "Here's a concise breakdown:\n\n• **Pros:** Faster iteration, lower upfront cost, flexible architecture.\n• **Cons:** Potential technical debt, harder to scale without planning.\n\nMy recommendation would be to start with a clear design document before writing any code.",
  "Absolutely! That's one of the most common challenges in this space. The solution that tends to work best is a layered approach — handling the simple cases first, then progressively adding complexity only where needed.",
];

const INITIAL_CHATS: Chat[] = [
  {
    id: "1",
    title: "React Native architecture",
    createdAt: new Date(Date.now() - 86400000),
    messages: [
      {
        id: "m1",
        role: "user",
        content: "What's the best architecture for a large React Native app?",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: "m2",
        role: "assistant",
        content: AI_RESPONSES[1],
        timestamp: new Date(Date.now() - 86300000),
      },
    ],
  },
  {
    id: "2",
    title: "TypeScript generics explained",
    createdAt: new Date(Date.now() - 172800000),
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Can you explain TypeScript generics with examples?",
        timestamp: new Date(Date.now() - 172800000),
      },
      {
        id: "m4",
        role: "assistant",
        content: AI_RESPONSES[0],
        timestamp: new Date(Date.now() - 172700000),
      },
    ],
  },
  {
    id: "3",
    title: "Tailwind vs StyleSheet",
    createdAt: new Date(Date.now() - 259200000),
    messages: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ─── TypingDots ───────────────────────────────────────────────────────────────

function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 160),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.aiBubbleWrap}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>✦</Text>
        </View>
        <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
          <View style={styles.dotsRow}>
            {dots.map((dot, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: dot,
                    transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  index: number;
}

function MessageBubble({ message, index }: MessageBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const isUser = message.role === "user";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, delay: 40, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, delay: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>✦</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{message.content}</Text>
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </View>
      {isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>Y</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

interface SettingsProps {
  visible: boolean;
  settings: SettingsState;
  onClose: () => void;
  onUpdate: (s: SettingsState) => void;
}

function SettingsPanel({ visible, settings, onClose, onUpdate }: SettingsProps) {
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 400,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const toggle = (key: keyof SettingsState) => {
    onUpdate({ ...settings, [key]: !settings[key as "darkMode"] });
  };

  const settingRows: { label: string; sub: string; key: keyof SettingsState }[] = [
    { label: "Dark Mode", sub: "Use dark color scheme", key: "darkMode" },
    { label: "Response Streaming", sub: "Stream AI responses live", key: "streamingEnabled" },
    { label: "Sound Effects", sub: "Play sounds on new messages", key: "soundEnabled" },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.settingsPanel, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.settingsSection}>PREFERENCES</Text>
          {settingRows.map((row) => (
            <View key={row.key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{row.label}</Text>
                <Text style={styles.settingSub}>{row.sub}</Text>
              </View>
              <Switch
                value={settings[row.key] as boolean}
                onValueChange={() => toggle(row.key)}
                thumbColor={settings[row.key] ? COLORS.accent : COLORS.textMuted}
                trackColor={{ false: COLORS.border, true: COLORS.accentDim }}
              />
            </View>
          ))}

          <Text style={[styles.settingsSection, { marginTop: 28 }]}>FONT SIZE</Text>
          <View style={styles.fontSizeRow}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.fontSizeBtn, settings.fontSize === size && styles.fontSizeBtnActive]}
                onPress={() => onUpdate({ ...settings, fontSize: size })}
              >
                <Text style={[styles.fontSizeBtnText, settings.fontSize === size && styles.fontSizeBtnTextActive]}>
                  {size.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.settingsSection, { marginTop: 28 }]}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Aether AI</Text>
            <Text style={styles.aboutSub}>Version 1.0.0 · Built with React Native</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  visible: boolean;
  searchQuery: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

function Sidebar({
  chats,
  activeChatId,
  visible,
  searchQuery,
  onSelectChat,
  onNewChat,
  onSearchChange,
  onOpenSettings,
  onClose,
}: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -SIDEBAR_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = {
    Today: filteredChats.filter((c) => new Date().toDateString() === c.createdAt.toDateString()),
    "This Week": filteredChats.filter((c) => {
      const diff = Date.now() - c.createdAt.getTime();
      return diff > 86400000 && diff < 604800000;
    }),
    Older: filteredChats.filter((c) => Date.now() - c.createdAt.getTime() >= 604800000),
  };

  return (
    <>
      {visible && SCREEN_WIDTH < 768 && (
        <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={onClose} />
      )}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        {/* Logo */}
        <View style={styles.sidebarLogo}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>✦</Text>
          </View>
          <Text style={styles.logoText}>Aether</Text>
        </View>

        {/* New Chat */}
        <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.75}>
          <Text style={styles.newChatIcon}>＋</Text>
          <Text style={styles.newChatText}>New conversation</Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Chat List */}
        <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
          {(Object.keys(grouped) as (keyof typeof grouped)[]).map((group) =>
            grouped[group].length > 0 ? (
              <View key={group}>
                <Text style={styles.chatGroupLabel}>{group}</Text>
                {grouped[group].map((chat) => (
                  <TouchableOpacity
                    key={chat.id}
                    style={[styles.chatItem, activeChatId === chat.id && styles.chatItemActive]}
                    onPress={() => { onSelectChat(chat.id); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chatItemIcon}>💬</Text>
                    <Text style={[styles.chatItemText, activeChatId === chat.id && styles.chatItemTextActive]} numberOfLines={1}>
                      {truncate(chat.title, 28)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          )}
        </ScrollView>

        {/* Bottom */}
        <View style={styles.sidebarBottom}>
          <TouchableOpacity style={styles.sidebarBottomBtn} onPress={onOpenSettings} activeOpacity={0.7}>
            <Text style={styles.sidebarBottomIcon}>⚙</Text>
            <Text style={styles.sidebarBottomText}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>Y</Text>
            </View>
            <View>
              <Text style={styles.profileName}>You</Text>
              <Text style={styles.profilePlan}>Free plan</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────

interface ChatWindowProps {
  chat: Chat | null;
  isTyping: boolean;
  inputText: string;
  fontSize: "sm" | "md" | "lg";
  onSendMessage: (text: string) => void;
  onInputChange: (t: string) => void;
  onMenuPress: () => void;
}

function ChatWindow({ chat, isTyping, inputText, fontSize, onSendMessage, onInputChange, onMenuPress }: ChatWindowProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [chat?.messages.length, isTyping]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
  };

  const bubbleFontSize = fontSize === "sm" ? 13 : fontSize === "lg" ? 16 : 14.5;

  return (
    <View style={styles.chatWindow}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress} activeOpacity={0.7}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoMark}>
            <Text style={styles.headerLogoText}>✦</Text>
          </View>
          <Text style={styles.headerTitle}>Aether AI</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>GPT-4</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {!chat || chat.messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>How can I help you today?</Text>
            <Text style={styles.emptySub}>Ask me anything — I'm here to assist.</Text>
            <View style={styles.suggestionsGrid}>
              {["Explain quantum entanglement", "Write a Python script", "Plan a trip to Japan", "Summarize a concept"].map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => onSendMessage(s)} activeOpacity={0.7}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          chat.messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} index={i} />
          ))
        )}
        {isTyping && <TypingDots />}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { fontSize: bubbleFontSize }]}
              placeholder="Message Aether..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={onInputChange}
              multiline
              maxLength={2000}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.75}
            >
              <Text style={styles.sendBtnIcon}>↑</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>Aether can make mistakes. Consider checking important info.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>(INITIAL_CHATS[0].id);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(SCREEN_WIDTH >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: true,
    streamingEnabled: true,
    soundEnabled: false,
    fontSize: "md",
  });

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const handleNewChat = useCallback(() => {
    const id = generateId();
    const newChat: Chat = {
      id,
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                title: c.messages.length === 0 ? truncate(text, 32) : c.title,
                messages: [...c.messages, userMsg],
              }
            : c
        )
      );
      setInputText("");
      setIsTyping(true);

      const delay = 1200 + Math.random() * 1200;
      setTimeout(() => {
        const aiMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
          timestamp: new Date(),
        };
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId ? { ...c, messages: [...c.messages, aiMsg] } : c
          )
        );
        setIsTyping(false);
      }, delay);
    },
    [activeChatId]
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.layout}>
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
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  layout: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },

  // Sidebar
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    position: SCREEN_WIDTH < 768 ? "absolute" : "relative",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: "flex-start",
  },
  sidebarBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 99,
  },
  sidebarLogo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoMarkText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: FONT.sans,
  },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accentDim,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  newChatIcon: {
    color: COLORS.accent,
    fontSize: 18,
    marginRight: 8,
    lineHeight: 20,
  },
  newChatText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: FONT.sans,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    padding: 0,
    fontFamily: FONT.sans,
  },
  chatList: {
    flex: 1,
  },
  chatGroupLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
    paddingHorizontal: 4,
    fontFamily: FONT.sans,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  chatItemActive: {
    backgroundColor: COLORS.surfaceHover,
  },
  chatItemIcon: {
    fontSize: 12,
    marginRight: 8,
    opacity: 0.6,
  },
  chatItemText: {
    color: COLORS.textSecondary,
    fontSize: 13.5,
    fontFamily: FONT.sans,
  },
  chatItemTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  sidebarBottom: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sidebarBottomBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  sidebarBottomIcon: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginRight: 10,
  },
  sidebarBottomText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONT.sans,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  profileAvatarText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  profileName: {
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: "600",
    fontFamily: FONT.sans,
  },
  profilePlan: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONT.sans,
  },

  // Chat Window
  chatWindow: {
    flex: 1,
    backgroundColor: COLORS.bg,
    flexDirection: "column",
  },
  chatHeader: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  menuBtn: {
    padding: 6,
    marginRight: 12,
  },
  menuBtnText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogoMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerLogoText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: FONT.sans,
  },
  headerBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: FONT.mono,
  },

  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  aiRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(124,106,247,0.3)",
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: {
    fontSize: 14.5,
    lineHeight: 22,
    fontFamily: FONT.sans,
  },
  userText: {
    color: "#e8e6f8",
  },
  aiText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
    alignSelf: "flex-end",
    fontFamily: FONT.mono,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  aiAvatarText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentDim,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginBottom: 2,
  },
  userAvatarText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // Typing
  typingContainer: {
    marginBottom: 18,
  },
  aiBubbleWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accentDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 26,
    color: COLORS.accent,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: FONT.sans,
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 28,
    fontFamily: FONT.sans,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
  },
  suggestionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONT.sans,
  },

  // Input
  inputArea: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    maxHeight: 120,
    lineHeight: 22,
    padding: 0,
    fontFamily: FONT.sans,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  sendBtnIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  inputHint: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 8,
    fontFamily: FONT.sans,
  },

  // Settings
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  settingsPanel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: Math.min(SCREEN_WIDTH * 0.85, 340),
    backgroundColor: COLORS.sidebar,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    zIndex: 200,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: FONT.sans,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  settingsBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingsSection: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
    fontFamily: FONT.sans,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
    fontFamily: FONT.sans,
  },
  settingSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONT.sans,
  },
  fontSizeRow: {
    flexDirection: "row",
    gap: 10,
  },
  fontSizeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  fontSizeBtnActive: {
    backgroundColor: COLORS.accentGlow,
    borderColor: COLORS.accentDim,
  },
  fontSizeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: FONT.mono,
  },
  fontSizeBtnTextActive: {
    color: COLORS.accent,
  },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    fontFamily: FONT.sans,
  },
  aboutSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONT.mono,
  },
});

