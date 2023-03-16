import { Input } from "@twilio-paste/core/input";
import { Label } from "@twilio-paste/core/label";
import { Box } from "@twilio-paste/core/box";
import { TextArea } from "@twilio-paste/core/textarea";
import { FormEvent } from "react";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";

import { sessionDataHandler } from "../sessionDataHandler";
import { addNotification, changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import { initSession } from "../store/actions/initActions";
import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { notifications } from "../notifications";
import { NotificationBar } from "./NotificationBar";
import { introStyles, fieldStyles, titleStyles, formStyles } from "./styles/PreEngagementFormPhase.styles";

export const PreEngagementFormPhase = () => {
    const { name, email, query } = useSelector((state: AppState) => state.session.preEngagementData) || {};
    const dispatch = useDispatch();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
        try {
            const data = await sessionDataHandler.fetchAndStoreNewSession({
                formData: {
                    friendlyName: name,
                    email,
                    query
                }
            });
            dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
        } catch (err) {
            dispatch(addNotification(notifications.failedToInitSessionNotification((err as Error).message)));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <>
            <Header />
            <NotificationBar />
            <Box as="form" data-test="pre-engagement-chat-form" onSubmit={handleSubmit} {...formStyles}>
                <Text {...titleStyles} as="h3">
                    ¡Hola!
                </Text>
                <Text {...introStyles} as="p">
                Estamos aqui para ayudar, favor de ingresar tus datos para comenzar.
                </Text>
                <Box {...fieldStyles}>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        type="text"
                        placeholder="Ingresar su nombre"
                        name="name"
                        data-test="pre-engagement-chat-form-name-input"
                        value={name}
                        onChange={(e) => dispatch(updatePreEngagementData({ name: e.target.value }))}
                        required
                    />
                </Box>
                <Box {...fieldStyles}>
                    <Label htmlFor="email">Correo electronico</Label>
                    <Input
                        type="email"
                        placeholder="example@gmail.com"
                        name="email"
                        data-test="pre-engagement-chat-form-email-input"
                        value={email}
                        onChange={(e) => dispatch(updatePreEngagementData({ email: e.target.value }))}
                        required
                    />
                </Box>

                <Box {...fieldStyles}>
                    <Label htmlFor="query">Como podemos ayudarte?</Label>
                    <TextArea
                        placeholder="Ingresa tu pregunta y te atenderemos"
                        name="query"
                        data-test="pre-engagement-chat-form-query-textarea"
                        value={query}
                        onChange={(e) => dispatch(updatePreEngagementData({ query: e.target.value }))}
                        onKeyPress={handleKeyPress}
                        required
                    />
                </Box>

                <Button variant="primary" type="submit" data-test="pre-engagement-start-chat-button">
                    Empezar conversacion
                </Button>
            </Box>
        </>
    );
};
