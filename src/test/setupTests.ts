import type { ReactNode } from "react";

type MockComponentProps = Record<string, unknown> & {
  children?: ReactNode;
  testID?: string;
};

const onlineState = {
  details: null,
  isConnected: true,
  isInternetReachable: true,
  type: "wifi",
};

jest.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY",
  deleteItemAsync: jest.fn(async () => undefined),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-camera", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");

  const CameraView = React.forwardRef<{ takePictureAsync: jest.Mock }, MockComponentProps>((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      takePictureAsync: jest.fn(async () => ({ uri: "file:///selfie.jpg" })),
    }));

    return React.createElement(
      View,
      { testID: typeof props.testID === "string" ? props.testID : "camera-view" },
      props.children as ReactNode,
    );
  });

  return {
    CameraView,
    useCameraPermissions: jest.fn(() => [
      {
        canAskAgain: true,
        expires: "never",
        granted: true,
        status: "granted",
      },
      jest.fn(async () => ({
        canAskAgain: true,
        expires: "never",
        granted: true,
        status: "granted",
      })),
    ]),
  };
});

jest.mock("expo-location", () => ({
  Accuracy: {
    Balanced: 3,
    High: 4,
  },
  PermissionStatus: {
    DENIED: "denied",
    GRANTED: "granted",
    UNDETERMINED: "undetermined",
  },
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: {
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude: 0,
      longitude: 0,
      speed: null,
    },
    timestamp: Date.now(),
  })),
  getForegroundPermissionsAsync: jest.fn(async () => ({
    canAskAgain: true,
    expires: "never",
    granted: true,
    status: "granted",
  })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    canAskAgain: true,
    expires: "never",
    granted: true,
    status: "granted",
  })),
}));

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///test-cache/",
  copyAsync: jest.fn(async () => undefined),
  downloadAsync: jest.fn(async (_url: string, fileUri: string) => ({
    headers: {},
    mimeType: "application/pdf",
    status: 200,
    uri: fileUri,
  })),
  getInfoAsync: jest.fn(async (uri: string) => ({
    exists: true,
    isDirectory: false,
    size: 1,
    uri,
  })),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock("@react-native-community/netinfo", () => {
  const netInfo = {
    addEventListener: jest.fn((listener: (state: typeof onlineState) => void) => {
      listener(onlineState);
      return jest.fn();
    }),
    fetch: jest.fn(async () => onlineState),
  };

  return {
    __esModule: true,
    default: netInfo,
    ...netInfo,
  };
});

jest.mock("@expo-google-fonts/inter", () => ({
  Inter_400Regular: "Inter_400Regular",
  Inter_500Medium: "Inter_500Medium",
  Inter_600SemiBold: "Inter_600SemiBold",
  Inter_700Bold: "Inter_700Bold",
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));
