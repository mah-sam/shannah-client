import { Stack } from "expo-router";
import { useGlobal } from "../context/GlobalContext";

export default function StackNavigator() {
  const { signedIn } = useGlobal();
  return (
    <Stack>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in-mobile" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in-email" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="store/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="product" options={{ headerShown: false }} />
      <Stack.Screen
        name="cart-products"
        options={{
          title: "سلة التسوق",
          headerTitleStyle: { fontFamily: "TajawalBold" },
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: "سلة التسوق",
          headerTitleStyle: { fontFamily: "TajawalBold" },
        }}
      />
      <Stack.Screen name="order-confirmed" options={{ headerShown: false }} />
      <Stack.Protected guard={signedIn}>
        <Stack.Screen
          name="profile-update"
          options={{
            title: "تعديل الملف الشخصي",
            headerTitleStyle: { fontFamily: "TajawalBold" },
          }}
        />
        <Stack.Screen
          name="orders"
          options={{
            title: "طلباتي",
            headerTitleStyle: { fontFamily: "TajawalBold" },
          }}
        />
        <Stack.Screen
          name="addresses/form"
          options={{
            title: "إضافة عنوان جديد",
            headerTitleStyle: { fontFamily: "TajawalBold" },
          }}
        />
        <Stack.Screen
          name="addresses/index"
          options={{
            title: "عنوان التسليم",
            headerTitleStyle: { fontFamily: "TajawalBold" },
          }}
        />
        <Stack.Screen
          name="addresses/select"
          options={{
            title: "عنوان التسليم",
            headerTitleStyle: { fontFamily: "TajawalBold" },
          }}
        />
        <Stack.Screen
          name="favorite"
          options={{
            title: "المفضلة",
            headerTitleStyle: { fontFamily: "TajawalBold" },
          }}
        />
        <Stack.Screen
          name="profile-complete"
          options={{ headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  );
}
