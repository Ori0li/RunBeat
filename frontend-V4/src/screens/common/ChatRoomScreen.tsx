import { BASE_URL } from "@/libs/api/auth";
import InsertButton from "@/src/components/chat/InsertButton";
import InsertInput from "@/src/components/chat/InsertInput";
import Message from "@/src/components/chat/Message";
import Profile from "@/src/components/chat/Profile";
import RunBeatLogo from "@/src/components/common/RunBeatLogo";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { getSocket } from "@/src/utils/socket";
import { useLocalSearchParams } from "expo-router";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ChatRoomScreenProps = {
  roomId?: number;
};

type ChatMessage = {
  messageId: number;
  chatId: number;
  senderId: number;
  content: string;
  createdAt: string;
  photoUrl?: string | null;
};

const ChatRoomScreen = ({ roomId: propRoomId }: ChatRoomScreenProps) => {
  const { roomId: queryRoomId } = useLocalSearchParams();
  const chatId = Number(propRoomId ?? queryRoomId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const myAccountId = useAuthStore((s) => s.accountId);

  const scrollRef = useRef<ScrollView>(null);
  const isFirstLoad = useRef(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [cursor, setCursor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = async () => {
    if (!chatId || isLoading || !hasMore || myAccountId === null) return;
    setIsLoading(true);
    const query = cursor ? `&cursor=${cursor}` : "";

    try {
      const res = await fetch(
        `${BASE_URL}/chats/messages?roomId=${chatId}${query}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const json = await res.json();
      if (res.ok && json.success) {
        const newMessages: ChatMessage[] = json.data ?? [];
        setMessages((prev) => [...newMessages.reverse(), ...prev]);
        if (newMessages.length > 0) {
          setCursor(newMessages[newMessages.length - 1].messageId);
        }
        if (newMessages.length < 20) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("메시지 불러오기 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const socket = getSocket();
    if (!socket || !inputText.trim() || myAccountId == null) return;
    socket.emit("message.send", { chatId, content: inputText.trim() });
    setInputText("");
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y <= 0 && hasMore && !isLoading) {
      fetchMessages();
    }
  };

  useEffect(() => {
    if (chatId && myAccountId !== null) fetchMessages();
  }, [chatId, myAccountId]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit("join.room", { chatId });
      socket.on("message.receive", (data: ChatMessage) => {
        if (data.chatId === chatId) {
          setMessages((prev) => {
            if (prev.find((m) => m.messageId === data.messageId)) return prev;
            return [...prev, data];
          });
        }
      });
    }
    return () => {
      getSocket()?.off("message.receive");
    };
  }, [chatId]);

  useEffect(() => {
    if (messages.length === 0) return;
    // 최초 1회만 스크롤 아래로 이동
    if (isFirstLoad.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100); // 렌더 완료 대기
      isFirstLoad.current = false;
    }

    const lastMessage = messages[messages.length - 1];
    const socket = getSocket();
    if (
      socket &&
      chatId &&
      myAccountId !== null &&
      lastMessage.senderId !== myAccountId
    ) {
      socket.emit("message.read", {
        chatId,
        lastReadMessageId: lastMessage.messageId,
      });
    }
  }, [messages, myAccountId]);

  const getTime = (str: string) => str.slice(11, 16);

  const renderedMessages = useMemo(() => {
    const list: JSX.Element[] = [];
    let lastDate = "";
    const sorted = [...messages].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );

    sorted.forEach((msg, index) => {
      const dateForCompare = msg.createdAt.slice(0, 10);
      const dateForDisplay =
        msg.createdAt.slice(0, 10).replace(/-/g, ". ") + ".";
      const isSelf = msg.senderId === myAccountId;
      const prevMsg = index > 0 ? sorted[index - 1] : null;
      const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
      const showDate = dateForCompare !== lastDate;
      if (showDate) lastDate = dateForCompare;

      list.push(
        <View key={msg.messageId}>
          {showDate && (
            <Text
              style={{ textAlign: "center", marginVertical: 10, color: "#888" }}
            >
              {dateForDisplay}
            </Text>
          )}
          <View style={styles.messageRow}>
            <View
              style={[
                styles.userMessage,
                isSelf ? styles.rightMessage : styles.leftMessage,
              ]}
            >
              {!isSelf && isFirstInGroup ? (
                <View style={{ position: "relative", bottom: 15 }}>
                  <Profile width={40} height={40} uri={msg.photoUrl} />
                </View>
              ) : (
                !isSelf && <View style={{ width: 40 }} />
              )}
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                {isSelf && (
                  <Text style={{ fontSize: 12, color: "#888", marginRight: 6 }}>
                    {getTime(msg.createdAt)}
                  </Text>
                )}
                <Message content={msg.content} fromSelf={isSelf} />
                {!isSelf && (
                  <Text style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>
                    {getTime(msg.createdAt)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>,
      );
    });
    return list;
  }, [messages, myAccountId]);

  if (!chatId || isNaN(chatId) || myAccountId === null) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "gray" }}>채팅 불러오는 중입니다...</Text>
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 0}
    >
      <View style={{ flex: 1 }}>
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <RunBeatLogo />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollPage}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          bounces={false}
          overScrollMode="never"
          scrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {isLoading && (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#999" }}>로딩 중...</Text>
            </View>
          )}
          {renderedMessages}
        </ScrollView>

        <View style={styles.insertWrapper}>
          <InsertInput value={inputText} onChangeText={setInputText} />
          <InsertButton onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollPage: {
    width: "100%",
    backgroundColor: "#C3D8FF",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  container: {
    position: "relative",
    flex: 1,
    width: "100%",
    height: "100%",
  },
  messageRow: {
    width: "100%",
    display: "flex",
  },
  userMessage: {
    maxWidth: "80%",
    gap: 10,
    marginBottom: 13,
    alignItems: "flex-end",
  },
  leftMessage: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  rightMessage: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  insertWrapper: {
    width: "100%",
    height: 75,
    paddingBottom: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#C3D8FF",
  },
});

export default ChatRoomScreen;
