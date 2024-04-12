import {
    Box,
    Button,
    ButtonText,
    CloseIcon,
    HStack,
    Heading,
    Icon,
    Input,
    InputField,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ScrollView,
    SearchIcon,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import * as SQLite from "expo-sqlite/next";

import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    Platform,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import {
    DoorClosedIcon,
    PlusCircle,
    PlusIcon,
    XIcon,
} from "lucide-react-native";
import { FlatGrid } from "react-native-super-grid";

export default function Home() {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [zettel, setZettel] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [search, setSearch] = useState("");
    const [isError, setIsError] = useState(false);
    const db = SQLite.useSQLiteContext();
    async function loadZettel() {
        try {
            const result = await db.getAllAsync(
                `SELECT * FROM zettel WHERE vorname || ' ' || nachname LIKE ?`,
                ["%" + search + "%"]
            );

            // console.log(result);
            setZettel(result);
        } catch (error) {
            console.log(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        loadZettel();

        return () => {};
    }, [search]);

    if (isLoading) {
        return (
            <Box>
                <Text>loading ...</Text>
            </Box>
        );
    }
    return (
        <Box flex={1} backgroundColor={theme.colors.background}>
            <SafeAreaView
                style={{
                    flex: 1,
                    paddingTop: Platform.OS === "android" ? 35 : 0,
                }}
            >
                <HStack
                    alignItems="center"
                    space="none"
                    reversed={false}
                    gap={"$5"}
                    mx={"$10"}
                >
                    <Input
                        flexGrow={1}
                        variant="rounded"
                        size="lg"
                        isDisabled={false}
                        isInvalid={false}
                        isReadOnly={false}
                        alignItems="center"
                    >
                        <Icon
                            ml="$4"
                            color={theme.colors.text}
                            as={SearchIcon}
                        />
                        <InputField
                            color={theme.colors.text}
                            placeholder="Search"
                            onChangeText={(text) => setSearch(text)}
                            // onChange={async (e) => {}}
                        />
                    </Input>
                    <TouchableOpacity
                        onPress={(e) => {
                            setIsAdding(true);
                        }}
                    >
                        <PlusCircle size={40} color={theme.colors.text} />
                    </TouchableOpacity>
                </HStack>

                <Box px={"$8"}>
                    <FlatGrid
                        data={zettel}
                        itemDimension={300}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={(e) =>
                                    router.navigate(`./zettel/${item.id}`)
                                }
                            >
                                <Box
                                    borderRadius={"$3xl"}
                                    backgroundColor={theme.colors.border}
                                    p={"$11"}
                                >
                                    <Text
                                        color={theme.colors.text}
                                        numberOfLines={1}
                                    >
                                        {`${item.vorname} ${item.nachname}`}
                                    </Text>
                                </Box>
                            </TouchableOpacity>
                        )}
                    />
                </Box>

                <AddZettelModal
                    loadZettel={loadZettel}
                    isOpen={isAdding}
                    setIsAdding={setIsAdding}
                ></AddZettelModal>
            </SafeAreaView>
        </Box>
    );
}

function AddZettelModal({ loadZettel, isOpen, setIsAdding }) {
    const theme = useTheme();
    const [vorname, setVorname] = useState("");
    const [nachname, setNachname] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const db = SQLite.useSQLiteContext();

    return (
        <Modal size="lg" isOpen={isOpen}>
            <ModalBackdrop />
            <ModalContent backgroundColor={theme.colors.card}>
                <ModalHeader>
                    <Heading color={theme.colors.text} size="lg">
                        Neuer Zettel
                    </Heading>
                    <ModalCloseButton onPress={(e) => setIsAdding(false)}>
                        {/* <CloseIcon
                                    color={theme.colors.text}
                                ></CloseIcon>
                                <DoorClosedIcon
                                    color={theme.colors.text}
                                    size={40}
                                /> */}
                        <XIcon color={theme.colors.text} size={30}></XIcon>
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <VStack gap={"$3"}>
                        <Input
                            flexGrow={1}
                            variant="rounded"
                            size="lg"
                            isDisabled={false}
                            isInvalid={false}
                            isReadOnly={false}
                            alignItems="center"
                        >
                            <InputField
                                color={theme.colors.text}
                                placeholder="Vorname"
                                onChangeText={(newText) => {
                                    setVorname(newText);
                                }}
                            />
                        </Input>
                        <Input
                            flexGrow={1}
                            variant="rounded"
                            size="lg"
                            isDisabled={false}
                            isInvalid={false}
                            isReadOnly={false}
                            alignItems="center"
                        >
                            <InputField
                                color={theme.colors.text}
                                placeholder="Nachname"
                                onChangeText={(newText) => {
                                    setNachname(newText);
                                }}
                            />
                        </Input>
                        <Box marginStart={"auto"}>
                            <Button
                                disabled={!isLoading}
                                size="md"
                                variant="solid"
                                action="primary"
                                isDisabled={false}
                                isFocusVisible={false}
                                onPress={async (e) => {
                                    try {
                                        setIsLoading(true);
                                        let result = await db.runAsync(
                                            "Insert INTO zettel (vorname, nachname) VALUES (?, ?)",
                                            [vorname, nachname]
                                        );
                                        console.log(result.lastInsertRowId);
                                        loadZettel();
                                        setIsAdding(false);
                                    } catch (error) {
                                        console.log(error);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                            >
                                <ButtonText>Add</ButtonText>
                            </Button>
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
