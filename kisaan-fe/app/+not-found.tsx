import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.text}>Page not found</Text>
      <Link href="/" style={styles.link}>
        Go home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#22c55e",
  },
  text: {
    fontSize: 18,
    color: "#666",
    marginTop: 8,
  },
  link: {
    marginTop: 24,
    color: "#3b82f6",
    fontSize: 16,
  },
});
