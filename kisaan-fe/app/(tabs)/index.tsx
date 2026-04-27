import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/auth.store";
import { useEffect } from "react";

export default function HomeScreen() {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (user && token) {
      if (user.role === "farmer") {
        router.replace("/farmer" as any);
      } else {
        router.replace("/buyer" as any);
      }
    }
  }, [user, token]);

  if (user && token) {
    return null;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌾</Text>
        <Text style={styles.title}>Kisaan</Text>
        <Text style={styles.subtitle}>Farm fresh, direct to you</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Connect with local farmers</Text>
        <Text style={styles.heroText}>
          Buy fresh produce directly from farmers or sell your harvest to buyers in your area.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🛒</Text>
          <Text style={styles.featureTitle}>Direct Purchase</Text>
          <Text style={styles.featureText}>Buy directly from farmers</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💰</Text>
          <Text style={styles.featureTitle}>Negotiate</Text>
          <Text style={styles.featureText}>Get the best prices</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🚚</Text>
          <Text style={styles.featureTitle}>Fresh Delivery</Text>
          <Text style={styles.featureText}>Farm fresh to your door</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  hero: {
    alignItems: "center",
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  heroText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    gap: 16,
    marginBottom: 48,
  },
  loginButton: {
    backgroundColor: "#22c55e",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  registerButtonText: {
    color: "#22c55e",
    fontSize: 18,
    fontWeight: "600",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
