"use client";

import { useState } from "react";

import { Conversation } from "./conversation";

import { subtitle, title } from "@/components/primitives";
import FileUploadButton from "@/components/shared/upload-file";
import { BotIcon } from "@/icons/bot";
import { CancelIcon } from "@/icons/cancel";
import { UploadIcon } from "@/icons/upload";

export default function ChatStart() {
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [file, setFile] = useState<File>();

  return (
    <>
      {!fileUploaded && (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div>
            <div className="inset-0 bottom-[20%] overflow-y-auto scroll-snap-y-container">
              <span className="flex justify-center col-start-1">
                <BotIcon
                  className="w-60 h-60 dark:invert"
                  height="100"
                  radius="sm"
                  width="100"
                />
              </span>

              <div className="inline-block max-w-lg text-center justify-center">
                <h1 className={title()}>
                  Local Retrieval Augmented Generation (RAG)
                </h1>
                <h2 className={subtitle()}>
                  Please Upload a pdf file to get started
                </h2>
              </div>
            </div>
            <div className="bottom-[0%] left-0 right-0">
              <span className="flex justify-center col-start-1 item-center mb-4">
                <FileUploadButton
                  accept="application/pdf"
                  className="m-4"
                  rejectProps={{
                    color: "danger",
                    startContent: <CancelIcon />,
                  }}
                  size="lg"
                  startContent={<UploadIcon />}
                  onUpload={(files) => {
                    setFileUploaded(true);
                    setFile(files[0]);
                  }}
                >
                  Upload pdf
                </FileUploadButton>
              </span>
            </div>
          </div>
        </section>
      )}
      {fileUploaded && file && <Conversation file={file} />}
    </>
  );
}
