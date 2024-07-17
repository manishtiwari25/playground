import { Avatar } from "@nextui-org/react";

export default function ChatBubble(props: any) {
  let messageCSS = `flex items-start gap-3 mb-3 m-1 ${props.isUserMessage ? "justify-end" : "justify-start"}`;

  return (
    <div className={messageCSS}>
      <span hidden={props.isUserMessage}>
        <Avatar
          isBordered
          radius="lg"
          src={`https://api.dicebear.com/7.x/bottts/png`}
        />
      </span>
      <div className="gap-1">
        <div className="w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-xl dark:bg-gray-700">
          <div className="items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {props.isUserMessage ? "You" : "Assistant"}
            </span>
          </div>
          <div className="items-start my-2.5 bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
            <div className="me-2">
              {props.message.content && (
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {props.message.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
      <span hidden={!props.isUserMessage}>
        <Avatar
          isBordered
          name="You"
          radius="lg"
          src="https://api.dicebear.com/9.x/avataaars/svg"
        />
      </span>
    </div>
  );
}
