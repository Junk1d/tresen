import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GluestackUIProvider, Text, Box } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { useColorScheme } from "@/components/useColorScheme";
import { Slot, Stack, Tabs } from "expo-router";
import { SQLiteDatabase } from "expo-sqlite";
import { SQLiteProvider } from "expo-sqlite/next";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "gluestack",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const [isLoadingdb, setIsLoadingdb] = useState(true);
    const colorScheme = useColorScheme();
    return (
        <GluestackUIProvider config={config}>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                {/* <Slot /> */}
                {/* <Tabs>
                    <Tabs.Screen
                        name="index"
                        options={{ headerShown: false }}
                    />
                    <Tabs.Screen name="more" options={{ headerShown: false }} />
                </Tabs> */}
                <SQLiteProvider
                    databaseName="tresen.db"
                    onInit={(db) => {
                        migrateDbIfNeeded(db);
                        // setIsLoadingdb(false);
                    }}
                    onError={(e) => {
                        console.log(e);
                    }}
                >
                    <Stack>
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                </SQLiteProvider>
            </ThemeProvider>
        </GluestackUIProvider>
    );
}

async function migrateDbIfNeeded(db) {
    try {
        // await db.runAsync("Drop Table zettel");
        await db.runAsync(`CREATE TABLE IF NOT EXISTS \`zettel\` (
        \`id\` INTEGER NOT NULL PRIMARY
        KEY AUTOINCREMENT,
        \`vorname\` VARCHAR(50) NOT NULL,
        \`nachname\` VARCHAR(50) NOT NULL,
        \`bild\` BLOB DEFAULT NULL,
        \`datum\` TIMESTAMP DEFAULT current_timestamp,
        \`gezahlt\` TIMESTAMP DEFAULT NULL,
        \`kartenzahlung\` INTEGER DEFAULT NULL
        )`);
        await db.runAsync(`CREATE TABLE IF NOT EXISTS \`zutat\` (
        \`id\` INTEGER NOT NULL PRIMARY
        KEY AUTOINCREMENT,
        \`name\` VARCHAR(50)  NOT NULL,
        \`preis\` DECIMAL(4,2) NOT NULL,
        \`bild\` BLOB DEFAULT NULL,
        \`bestand\` INTEGER DEFAULT NULL
        )`);
        await db.runAsync(`CREATE TABLE IF NOT EXISTS \`bestellung\` (
        \`id\` INTEGER NOT NULL PRIMARY
        KEY AUTOINCREMENT,
        \`zettelid\` INTEGER NOT NULL ,
        \`zutatid\` INTEGER NOT NULL ,
        \`anzahl\` INTEGER NOT NULL,
        \`preisProAnzahl\` DECIMAL(4,2) NOT NULL,
        \`datum\` TIMESTAMP DEFAULT current_timestamp
        )`);
    } catch (error) {
        console.log(error);
    }
}
