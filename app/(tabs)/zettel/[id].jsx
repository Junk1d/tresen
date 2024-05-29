import { View, Platform, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
    Text,
    Box,
    Toast,
    ToastDescription,
    ToastTitle,
    VStack,
    useToast,
    HStack,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    Heading,
    ModalCloseButton,
    ModalBody,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonIcon,
    AddIcon,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite/next";
import { FlatGrid } from "react-native-super-grid";
import { XIcon } from "lucide-react-native";

export default function zettel() {
    const navigation = useNavigation();
    const { id } = useLocalSearchParams();
    const theme = useTheme();

    const db = useSQLiteContext();
    const [isLoading, setIsLoading] = useState(true);
    const [menu, setMenu] = useState([]);

    async function loadZettelInfo() {
        try {
            const [zettel] = await db.getAllAsync(
                `SELECT * FROM zettel WHERE id = ?`,
                [id]
            );
            const result = await db.getAllAsync(
                `SELECT z.id, z.name, z.preis, SUM(b.anzahl) AS bestellt FROM zutat AS z LEFT JOIN bestellung AS b ON b.zettelid = ? AND b.zutatid = z.id GROUP BY z.id`,
                [id]
            );
            setMenu(result);
            navigation.setOptions({
                headerTitle: `${zettel.vorname} ${zettel.nachname}`,
            });
        } catch (error) {
            console.log(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        loadZettelInfo();

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
        <Box px={"$8"}>
            <FlatGrid
                data={menu}
                itemDimension={300}
                renderItem={({ item }) => (
                    <Zutat item={item} zettelid={id}></Zutat>
                )}
            />
        </Box>
    );
}

function Zutat({ item, zettelid }) {
    const theme = useTheme();
    const toast = useToast();
    const [anzahl, setAnzahl] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const db = useSQLiteContext();
    const [isLoading, setIsLoading] = useState(false);

    function successToast(message) {
        toast.show({
            placement: "top right",
            duration: 2000,

            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast
                        nativeID={toastId}
                        action="success"
                        variant="accent"
                        backgroundColor={theme.colors.border}
                    >
                        <VStack space="xs">
                            <ToastTitle color={theme.colors.text}>
                                {message}
                            </ToastTitle>
                        </VStack>
                    </Toast>
                );
            },
        });
    }
    function errorToast(message) {
        toast.show({
            placement: "top right",
            duration: 5000,
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast
                        nativeID={toastId}
                        action="error"
                        variant="accent"
                        backgroundColor={theme.colors.border}
                    >
                        <VStack space="xs">
                            <ToastTitle color={theme.colors.text}>
                                {message}
                            </ToastTitle>
                        </VStack>
                    </Toast>
                );
            },
        });
    }

    return (
        <>
            <TouchableOpacity
                onLongPress={(e) => {
                    setIsOpen(true);
                }}
                onPress={async (e) => {
                    // console.log("short");
                    try {
                        await db.runAsync(
                            "INSERT INTO bestellung (zettelid, zutatid, anzahl, preisProAnzahl) VALUES (?,?,?,?)",
                            [zettelid, item.id, 1, item.preis]
                        );
                        successToast(`+1 ${item.name}`);
                    } catch (error) {
                        errorToast("Fehler beim Adden");
                        console.log(error);
                    }
                }}
            >
                <Box
                    borderRadius={"$3xl"}
                    backgroundColor={theme.colors.border}
                    p={"$11"}
                >
                    <HStack>
                        <Text color={theme.colors.text} numberOfLines={1}>
                            {`${item.name}`}
                        </Text>
                        <Text
                            marginStart={8}
                            color={theme.colors.text}
                            numberOfLines={1}
                        >
                            {`${item.preis} €`}
                        </Text>
                        <Text
                            marginStart={"auto"}
                            color={theme.colors.text}
                            numberOfLines={1}
                        >
                            {`${item.bestellt ? item.bestellt : 0}`}
                        </Text>
                    </HStack>
                </Box>
            </TouchableOpacity>
            <Modal size="lg" isOpen={isOpen}>
                <ModalBackdrop />
                <ModalContent backgroundColor={theme.colors.card}>
                    <ModalHeader>
                        <Heading color={theme.colors.text} size="lg">
                            {item.name}
                        </Heading>
                        <ModalCloseButton onPress={(e) => setIsOpen(false)}>
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
                            <HStack>
                                <Input
                                    flexGrow={1}
                                    size="lg"
                                    isDisabled={false}
                                    isInvalid={false}
                                    isReadOnly={false}
                                    alignItems="center"
                                >
                                    <InputField
                                        inputMode="numeric"
                                        color={theme.colors.text}
                                        placeholder="0"
                                        value={anzahl}
                                        onChangeText={(newText) => {
                                            let newAnzahl = Number.parseInt(
                                                newText
                                            )
                                                ? Number.parseInt(newText)
                                                : "";

                                            setAnzahl(newAnzahl.toString());
                                        }}
                                    />
                                </Input>
                                <Button
                                    size="lg"
                                    onPress={(e) => {
                                        setAnzahl((current) =>
                                            (
                                                (Number.parseInt(current)
                                                    ? Number.parseInt(current)
                                                    : 0) + 1
                                            ).toString()
                                        );
                                    }}
                                >
                                    <ButtonIcon as={AddIcon} />
                                </Button>
                            </HStack>
                            <Box marginStart={"auto"}>
                                <Button
                                    size="md"
                                    variant="solid"
                                    action="primary"
                                    isDisabled={
                                        isLoading ||
                                        Number.parseInt(anzahl) <= 0
                                    }
                                    isFocusVisible={false}
                                    onPress={async (e) => {
                                        try {
                                            setIsLoading(true);

                                            await db.runAsync(
                                                "INSERT INTO bestellung (zettelid, zutatid, anzahl, preisProAnzahl) VALUES (?,?,?,?)",
                                                [
                                                    zettelid,
                                                    item.id,
                                                    Number.parseInt(anzahl),
                                                    item.preis,
                                                ]
                                            );
                                            successToast(
                                                `+${anzahl} ${item.name}`
                                            );
                                        } catch (error) {
                                            errorToast("Fehler beim Adden");
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
        </>
    );
}
