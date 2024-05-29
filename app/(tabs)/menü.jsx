import { Platform, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import {
    Text,
    Box,
    Button,
    ButtonText,
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
    VStack,
} from "@gluestack-ui/themed";
import { useSQLiteContext } from "expo-sqlite/next";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatGrid } from "react-native-super-grid";
import { PlusCircle, XIcon } from "lucide-react-native";

export default function Menü() {
    const db = useSQLiteContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const theme = useTheme();
    const [menu, setMenu] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    async function loadMenü() {
        try {
            const result = await db.getAllAsync(`SELECT * FROM zutat`);

            // console.log(result);
            setMenu(result);
        } catch (error) {
            console.log(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        loadMenü();

        return () => {};
    }, []);

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
                    {/* <Input
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
                    </Input> */}
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
                        data={menu}
                        itemDimension={300}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={(e) => {
                                    // router.navigate(`./menu/${item.id}`);
                                }}
                            >
                                <Box
                                    borderRadius={"$3xl"}
                                    backgroundColor={theme.colors.border}
                                    p={"$11"}
                                >
                                    <HStack justifyContent="space-between">
                                        <Text
                                            color={theme.colors.text}
                                            numberOfLines={1}
                                        >
                                            {`${item.name}`}
                                        </Text>
                                        <Text
                                            color={theme.colors.text}
                                            numberOfLines={1}
                                        >
                                            {`${item.preis} €`}
                                        </Text>
                                    </HStack>
                                </Box>
                            </TouchableOpacity>
                        )}
                    />
                </Box>

                <AddMenüModal
                    loadMenü={loadMenü}
                    isOpen={isAdding}
                    setIsAdding={setIsAdding}
                ></AddMenüModal>
            </SafeAreaView>
        </Box>
    );
}

function AddMenüModal({ loadMenü, isOpen, setIsAdding }) {
    const theme = useTheme();
    const [name, setName] = useState("");
    const [preis, setPreis] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const db = useSQLiteContext();

    return (
        <Modal size="lg" isOpen={isOpen}>
            <ModalBackdrop />
            <ModalContent backgroundColor={theme.colors.card}>
                <ModalHeader>
                    <Heading color={theme.colors.text} size="lg">
                        Neue Zutat
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
                                placeholder="Name"
                                onChangeText={(newText) => {
                                    setName(newText);
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
                                inputMode="numeric"
                                color={theme.colors.text}
                                placeholder="Preis"
                                onChangeText={(newText) => {
                                    setPreis(newText);
                                }}
                            />
                        </Input>
                        <Box marginStart={"auto"}>
                            <Button
                                size="md"
                                variant="solid"
                                action="primary"
                                isDisabled={isLoading}
                                isFocusVisible={false}
                                onPress={async (e) => {
                                    try {
                                        setIsLoading(true);
                                        let numPreis = Number.parseFloat(
                                            preis.replace(",", ".")
                                        );
                                        console.log(numPreis);
                                        let result = await db.runAsync(
                                            "Insert INTO zutat (name, preis) VALUES (?, ?)",
                                            [name, numPreis]
                                        );
                                        console.log(result.lastInsertRowId);
                                        loadMenü();
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
