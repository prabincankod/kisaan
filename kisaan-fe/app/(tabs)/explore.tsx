import { View, Text, StyleSheet } from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🛒</Text>
        <Text style={styles.title}>Browse Products</Text>
        <Text style={styles.subtitle}>
          Discover fresh produce from local farmers
        </Text>
      </View>

      <View style={styles.categories}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          <View style={styles.categoryItem}>
            <Text style={styles.categoryEmoji}>🥬</Text>
            <Text style={styles.categoryText}>Vegetables</Text>
          </View>
          <View style={styles.categoryItem}>
            <Text style={styles.categoryEmoji}>🍎</Text>
            <Text style={styles.categoryText}>Fruits</Text>
          </View>
          <View style={styles.categoryItem}>
            <Text style={styles.categoryEmoji}>🌾</Text>
            <Text style={styles.categoryText}>Grains</Text>
          </View>
          <View style={styles.categoryItem}>
            <Text style={styles.categoryEmoji}>🥛</Text>
            <Text style={styles.categoryText}>Dairy</Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Login or create an account to start browsing and purchasing fresh produce directly from farmers.
        </Text>
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
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  categories: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  categoryItem: {
    width: "45%",
    backgroundColor: "#f5f5f5",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  info: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
  },
});
