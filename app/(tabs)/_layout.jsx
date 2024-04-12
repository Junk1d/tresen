import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="zettel"
                options={{
                    title: "zettel",
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: "more",
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
