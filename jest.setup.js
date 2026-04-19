// Jest setup for the Shannah customer app.
// Runs before every test file. Keep mocks minimal — only mock what a real
// test file would otherwise need to wire up.

// expo-secure-store — tests should never touch the native keychain
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// AsyncStorage is already mocked by jest-expo preset, but make it explicit
// in case we swap presets later.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// expo-router — provide no-op router so components that import it don't crash
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (fn) => fn(),
  Stack: Object.assign(() => null, { Screen: () => null, Protected: ({ children }) => children }),
  SplashScreen: {
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn(),
  },
}));

// expo-notifications — silence the setup call in root layout
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "ExponentPushToken[fake]" }),
  AndroidImportance: { MAX: 5 },
}));

// Silence console.warn spam from libs during tests; keep errors visible.
const originalWarn = console.warn;
console.warn = (...args) => {
  const first = String(args[0] ?? "");
  if (first.includes("[realtime]") || first.includes("[breadcrumb]")) return;
  originalWarn(...args);
};
