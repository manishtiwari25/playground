import { Button, Textarea } from "@nextui-org/react";

import { SendIcon } from "@/icons/send";

export default function MessageBox(props: any) {
  const handleEnterPress = (e: any) => {
    if (e.key === "Enter" && e.shiftKey) {
      props.handleMessageSent(props.userPrompt);
    }
  };

  return (
    <Textarea
      key="message"
      className="max-w-4xl whitespace-pre"
      endContent={
        <div className="justify-end">
          <Button
            className="h-30"
            isDisabled={props.userPrompt === "" || props.sendButtonDisabled}
            variant="light"
            onPress={props.handleMessageSent}
          >
            <SendIcon
              className="justify-center flex dark:invert"
              height="60"
              width="60"
            />
          </Button>
        </div>
      }
      maxRows={5}
      placeholder="Please use SHIFT + ENTER to send the message"
      radius="lg"
      value={props.userPrompt}
      variant="bordered"
      onKeyDown={handleEnterPress}
      onValueChange={props.setUserPrompt}
    />
  );
}
