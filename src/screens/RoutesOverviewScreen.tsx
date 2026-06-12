import { StyleSheet, Text, View } from "react-native";

export function RoutesOverviewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waste routes</Text>
      <Text style={styles.subtitle}>Data preparation and map visualization will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F8FA",
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#4B5563",
    fontSize: 15,
    textAlign: "center",
  },
});
