import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="zettel"
                options={{
                    title: "zettel",
                }}
            />
            <Tabs.Screen
                name="menü"
                options={{
                    title: "menü",
                }}
            />
        </Tabs>
    );
}
