import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { OneDollarStatsProvider } from "../lib/analytics";
import { C } from "../lib/theme";
import appJson from "../app.json";

const queryClient = new QueryClient();

const applicationId = appJson.expo.extra.applicationId ?? "";
const hostname = applicationId ? `${applicationId}-mobile` : "localhost";

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => <Ionicons name={name} color={color} size={size} />;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      {/* Runable analytics provider — do not remove, required for analytics tracking */}
      <OneDollarStatsProvider config={{ hostname, collectorUrl: "https://r.lilstts.com/events", devmode: true }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <Tabs
              screenOptions={{
                headerStyle: { backgroundColor: C.navy },
                headerTintColor: "#fff",
                headerTitleStyle: { fontWeight: "800" },
                tabBarActiveTintColor: C.navy,
                tabBarInactiveTintColor: C.muted,
                tabBarStyle: { backgroundColor: "#fff", borderTopColor: C.border, height: 60, paddingBottom: 8, paddingTop: 6 },
                tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
              }}
            >
              <Tabs.Screen name="index" options={{ title: "Dashboard", headerTitle: "TruckWithEase", tabBarIcon: tabIcon("speedometer-outline") }} />
              <Tabs.Screen name="hos" options={{ title: "HOS", headerTitle: "Hours of Service", tabBarIcon: tabIcon("time-outline") }} />
              <Tabs.Screen name="dvir" options={{ title: "DVIR", headerTitle: "Inspection", tabBarIcon: tabIcon("clipboard-outline") }} />
              <Tabs.Screen name="map" options={{ title: "Map", headerTitle: "Live Map", tabBarIcon: tabIcon("map-outline") }} />
              <Tabs.Screen name="fuel" options={{ title: "Fuel", headerTitle: "Fuel Finder", tabBarIcon: tabIcon("flame-outline") }} />
              <Tabs.Screen name="chief" options={{ title: "Fleet Chief", headerTitle: "Fleet Chief AI", tabBarIcon: tabIcon("construct-outline") }} />
              <Tabs.Screen name="more" options={{ title: "More", headerTitle: "More", tabBarIcon: tabIcon("grid-outline") }} />
            </Tabs>
          </QueryClientProvider>
        </SafeAreaProvider>
      </OneDollarStatsProvider>
    </ErrorBoundary>
  );
}
