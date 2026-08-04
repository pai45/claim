import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import NetInfo from "@react-native-community/netinfo";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import {
  CLAIMS_HASH,
  CLOSE_CLAIMS_JS,
  HASH_BRIDGE_JS,
  SITE_URL,
  isInternalUrl,
  type BridgeMessage,
} from "./src/siteBridge";

// Matches the web app's themeColor so there is no colour flash on launch.
const BACKGROUND = "#F8FAF8";
const PINE_DARK = "#003434";
const INK_SECONDARY = "#667A74";

/** Safety net: never strand the user on the splash if the WebView goes quiet. */
const SPLASH_TIMEOUT_MS = 10_000;

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or the module is unavailable. Not worth surfacing.
});

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const hashRef = useRef("");
  const canGoBackRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const hideSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(hideSplash, SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [hideSplash]);

  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        setIsOffline(state.isConnected === false);
      }),
    [],
  );

  const reload = useCallback(() => {
    setLoadFailed(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as BridgeMessage;
      if (message.type === "hash") hashRef.current = message.hash;
    } catch {
      // The page may post messages the shell does not care about.
    }
  }, []);

  /**
   * The chat overlay is state inside a single page rather than a history entry,
   * so `goBack()` cannot close it. Ask the page to close it first, and only
   * then fall through to real history.
   */
  const handleAndroidBack = useCallback(() => {
    if (hashRef.current.toLowerCase() === CLAIMS_HASH) {
      webViewRef.current?.injectJavaScript(CLOSE_CLAIMS_JS);
      hashRef.current = "";
      return true;
    }
    if (canGoBackRef.current) {
      webViewRef.current?.goBack();
      return true;
    }
    return false; // Let Android close the app.
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleAndroidBack,
    );
    return () => subscription.remove();
  }, [handleAndroidBack]);

  const handleShouldStartLoad = useCallback(
    (request: { url: string }) => {
      if (isInternalUrl(request.url)) return true;
      // Anything else (mailto:, tel:, external https) belongs to the OS.
      Linking.openURL(request.url).catch(() => {});
      return false;
    },
    [],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        <WebView
          ref={webViewRef}
          source={{ uri: SITE_URL }}
          style={styles.webView}
          // Gate navigation in onShouldStartLoadWithRequest instead, so that
          // blob: previews are not blocked before reaching it.
          originWhitelist={["*"]}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          injectedJavaScript={HASH_BRIDGE_JS}
          onMessage={handleMessage}
          onNavigationStateChange={(navigation) => {
            canGoBackRef.current = navigation.canGoBack;
          }}
          onLoadEnd={() => {
            setIsLoading(false);
            hideSplash();
          }}
          onError={() => {
            setLoadFailed(true);
            setIsLoading(false);
            hideSplash();
          }}
          onHttpError={({ nativeEvent }) => {
            // Both platforms filter this to the main frame, so the embedded
            // iframe and failed assets never reach here. A 404 on a route is
            // left alone so the site can render its own 404 page; only a dead
            // entry point or a server fault warrants taking over the screen.
            if (nativeEvent.statusCode >= 500 || nativeEvent.url === SITE_URL) {
              setLoadFailed(true);
            }
          }}
          // A backgrounded WebView can be reaped, leaving a white screen.
          onRenderProcessGone={reload}
          onContentProcessDidTerminate={reload}
          javaScriptEnabled
          // Keeps localStorage (chat history) working on Android.
          domStorageEnabled
          // Camera and gallery pickers for bill and licence capture.
          allowFileAccess
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          // The site is already mobile-only; block double-tap zoom drift.
          scalesPageToFit={false}
          setBuiltInZoomControls={false}
          pullToRefreshEnabled
          applicationNameForUserAgent="BenefitsAssistantApp/1.0"
        />

        {isLoading && !loadFailed ? (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="large" color={PINE_DARK} />
          </View>
        ) : null}

        {loadFailed ? (
          <View style={styles.overlay}>
            <Text style={styles.title}>
              {isOffline ? "You are offline" : "Could not load"}
            </Text>
            <Text style={styles.body}>
              {isOffline
                ? "Benefits Assistant needs a connection to load. Reconnect and try again."
                : "Something went wrong reaching Benefits Assistant. Please try again."}
            </Text>
            <Pressable
              onPress={reload}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.buttonLabel}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  webView: { flex: 1, backgroundColor: BACKGROUND },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: BACKGROUND,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: PINE_DARK,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: INK_SECONDARY,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: PINE_DARK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pressed: { opacity: 0.8 },
  buttonLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
