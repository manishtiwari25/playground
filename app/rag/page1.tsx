import { useCallback, useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";

import MessageBox from "./message-box";

export default function Conversation(props: any) {
  const [userPrompt, setUserPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let element = document.getElementById("chat-bubble");

    element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  });

  const sendMessage = useCallback(async () => {
    setIsProcessing(true);
    setIsProcessing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessageSent = async () => {
    let newMessage = userPrompt;

    setUserPrompt("");
    await sendMessage();
  };

  return (
    <>
      <div className="relative h-[95%] no-scrollbar mt-2" hidden={props.hidden}>
        <div
          className="absolute inset-0 bottom-[20%] overflow-y-auto scroll-snap-y-container"
          id="chat-bubble"
        >
          {/* <ChatBubble
            key={message.id}
            AssistantName={getAssistantName(
              props.assitantsList,
              message.assistantId,
              message.role,
            )}
            Avatar={getAssistantAvatar(
              props.assitantsList,
              message.assistantId,
            )}
            createdAt={message.createdAt}
            isUserMessage={message.role === "user"}
            message={message.content.map((x) => x.text.value ?? "").join("\n")}
          /> */}
        </div>

        <div className="absolute bottom-[0%] left-0 right-0 items-center justify-center grid grid-cols-1">
          <div
            className={
              isProcessing
                ? "flex justify-center col-start-1"
                : "flex justify-center col-start-1 invisible"
            }
          >
            <Spinner color="warning" label="Generating Response" size="lg" />
          </div>
          <MessageBox
            handleMessageSent={handleMessageSent}
            sendButtonDisabled={isProcessing}
            setUserPrompt={setUserPrompt}
            userPrompt={userPrompt}
          />
        </div>
      </div>
    </>
  );
}
