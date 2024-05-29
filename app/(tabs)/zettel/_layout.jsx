import { Text } from "@gluestack-ui/themed";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            ></Stack.Screen>
        </Stack>
    );
}
