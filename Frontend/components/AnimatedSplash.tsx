import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Text,
} from "react-native";

export default function AnimatedSplash({
  onFinish,
}: {
  onFinish: () => void;
}) {

  // Logo animation
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Progress animation
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.parallel([

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      // Zoom animation
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 1500,
        useNativeDriver: true,
      }),

      // Progress bar animation
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }),

    ]).start(() => {
      onFinish();
    });

  }, []);

  // Progress width
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          alignItems: "center",
        }}
      >

        {/* App Icon */}
        <View style={styles.logoBox}>
          <Text style={styles.star}>✦</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Titan Ai
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Intelligent. Fast. Limitless.
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Loading Text */}
        <Text style={styles.loading}>
          LOADING...
        </Text>

      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },

  logoBox: {
  width: 90,
  height: 90,
  borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#f5d27a",
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 20,
  },

  star: {
    color: "#fff",
    fontSize: 60,
    fontWeight: "700",
  },

  title: {
    marginTop: 20,
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    letterSpacing: 1,
  },

  progressBg: {
    width: 200,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 34,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#f5d27a",
    borderRadius: 10,
  },

  loading: {
    marginTop: 18,
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    letterSpacing: 5,
  },

});