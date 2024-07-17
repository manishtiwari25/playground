import { useEffect, useRef, useState } from "react";
import { Progress, Spinner } from "@nextui-org/react";
import toast from "react-hot-toast";

import MessageBox from "./message-box";
import { Message } from "./types/message";
import ChatBubble from "./chat-bubble";

export const Conversation = ({ file }: { file: File }) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [readyToChat, setReadyToChat] = useState(false);
  const [showModelDownloadProgressBar, setModelDownloadProgressBar] =
    useState<boolean>(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState<number>(0);
  const [modelDownloadProgressMessage, setModelDownloadProgressMessage] =
    useState<string>();
  const [spinnerMessage, setSpinnerMessage] = useState<string>(
    "Generating Response",
  );
  let worker = useRef<Worker>();

  async function queryStore(messages: Message[]) {
    if (!worker.current) {
      throw new Error("Worker is not ready.");
    }

    return new ReadableStream({
      start(controller) {
        if (!worker.current) {
          controller.close();

          return;
        }

        const payload: Record<string, any> = {
          messages,
        };

        worker.current?.postMessage(payload);
        const onMessageReceived = async (e: any) => {
          switch (e.data.type) {
            case "init_progress":
              setModelDownloadProgressBar(true);
              setModelDownloadProgress(e.data.data.progress);
              setModelDownloadProgressMessage(e.data.data.text);

              break;
            case "chunk":
              controller.enqueue(e.data.data);
              break;
            case "error":
              worker.current?.removeEventListener("message", onMessageReceived);
              const error = new Error(e.data.error);

              controller.error(error);
              break;
            case "complete":
              worker.current?.removeEventListener("message", onMessageReceived);
              controller.close();
              setModelDownloadProgressBar(false);
              setReadyToChat(true);
              break;
          }
        };

        worker.current?.addEventListener("message", onMessageReceived);
      },
    });
  }

  const sendMessage = async () => {
    if (!readyToChat || !userPrompt) {
      return;
    }

    const initialInput = userPrompt;
    const initialMessages = [...messages];
    const newMessages = [
      ...initialMessages,
      { role: "human" as const, content: userPrompt },
    ];

    setMessages(newMessages);
    setSpinnerMessage("Generating Response");
    setIsProcessing(true);
    setUserPrompt("");

    try {
      const stream = await queryStore(newMessages);
      const reader = stream.getReader();

      let chunk = await reader.read();

      const aiResponseMessage: Message = {
        content: "",
        role: "ai" as const,
      };

      setMessages([...newMessages, aiResponseMessage]);

      while (!chunk.done) {
        aiResponseMessage.content = aiResponseMessage.content + chunk.value;
        setMessages([...newMessages, aiResponseMessage]);
        chunk = await reader.read();
      }
      setIsProcessing(false);
      setSpinnerMessage("");
    } catch (e: any) {
      setMessages(initialMessages);
      setIsProcessing(false);
      setSpinnerMessage("");
      setUserPrompt(initialInput);
      toast.error(`There was an issue with querying your PDF: ${e.message}`);
    }
  };

  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(
        new URL("../../workers/rag.ts", import.meta.url),
      );
    }

    embedPDF();
  }, []);

  useEffect(() => {
    let element = document.getElementById("msg-box");

    element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  });
  const embedPDF = () => {
    if (file === null) {
      toast(`You must select a file to embed.`);

      return;
    }
    setSpinnerMessage("Embedding your PDF");
    setIsProcessing(true);
    worker.current?.postMessage({ pdf: file });
    const onMessageReceived = (e: any) => {
      switch (e.data.type) {
        case "error":
          worker.current?.removeEventListener("message", onMessageReceived);
          setSpinnerMessage("");
          setIsProcessing(false);
          toast.error(`There was an issue embedding your PDF: ${e.data.error}`);
          break;
        case "complete":
          worker.current?.removeEventListener("message", onMessageReceived);
          setIsProcessing(false);
          setSpinnerMessage("");
          setReadyToChat(true);
          toast(
            `Embedding successful! Now try asking a question about your PDF.`,
          );
          break;
      }
    };

    worker.current?.addEventListener("message", onMessageReceived);
  };

  return (
    <>
      <div
        className="overflow-y-scroll scroll-snap-y-container"
        id="chat-bubble"
      >
        {messages.length > 0 ? (
          [...messages].map((m, i) => (
            <ChatBubble
              key={i}
              isUserMessage={m.role === "human"}
              message={m}
              onRemovePressed={() =>
                setMessages((previousMessages) => {
                  const displayOrderedMessages = previousMessages.reverse();

                  return [
                    ...displayOrderedMessages.slice(0, i),
                    ...displayOrderedMessages.slice(i + 1),
                  ].reverse();
                })
              }
            />
          ))
        ) : (
          <></>
        )}
      </div>

      <div className="left-0 right-0 items-center justify-center grid grid-cols-1">
        {isProcessing && (
          <div
            className={
              isProcessing
                ? "flex justify-center col-start-1"
                : "flex justify-center col-start-1 invisible"
            }
          >
            <Spinner color="warning" label={spinnerMessage} size="lg" />
          </div>
        )}
        {showModelDownloadProgressBar && (
          <div className="flex justify-center col-start-1">
            <Progress
              label={modelDownloadProgressMessage}
              value={modelDownloadProgress * 100}
            />
          </div>
        )}
        <div className="flex justify-center col-start-1" id="msg-box">
          <MessageBox
            handleMessageSent={sendMessage}
            sendButtonDisabled={isProcessing}
            setUserPrompt={setUserPrompt}
            userPrompt={userPrompt}
          />
        </div>
      </div>
    </>
  );
};
