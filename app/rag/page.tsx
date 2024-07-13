"use client";

import MessageBox from "./message-box";

import { BotIcon } from "@/icons/bot";

export default function ChatStart(props: any) {
  return (
    <div className="mt-2">
      <div className="inset-0 bottom-[20%] overflow-y-auto scroll-snap-y-container">
        <span className="flex justify-center col-start-1">
          <BotIcon
            className="w-60 h-60 dark:invert"
            height="100"
            radius="sm"
            width="100"
          />
        </span>
        <span className="flex justify-center col-start-1 item-center mb-20">
          <h1 className="text-3xl font-bold md:text-4xl dark:text-white">
            How can I help you today?
          </h1>
        </span>
      </div>
      <div className="bottom-[0%] left-0 right-0">
        <span className="flex justify-center col-start-1 item-center mb-4">
          <div className="grid grid-cols-2 gap-4">
            {/* <SuggestPrompts
              selectedAssistantId={props.selectedAssistantId}
              setUserPrompt={props.setUserPrompt}
            /> */}
          </div>
        </span>
        <span className="flex justify-center col-start-1">
          <MessageBox
            handleMessageSent={props.handleMessageSent}
            setUserPrompt={props.setUserPrompt}
            userPrompt={props.userPrompt}
          />
        </span>
      </div>
    </div>
  );
}
