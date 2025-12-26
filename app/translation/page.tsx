"use client";

import { Autocomplete, AutocompleteItem, Button, Link } from "@heroui/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@heroui/input";
import { Progress } from "@heroui/progress";
import toast from "react-hot-toast";

import { subtitle, title } from "@/components/primitives";
import { siteConfig } from "@/config/site";

export default function OfflineSentimentAnalysisPage() {
  const [result, setResult] = useState<string>("");
  const defaultSourceLang = "eng_Latn";
  const defaultDestLang = "deu_Latn";
  const [sourceLang, setSourceLang] = useState<string>(defaultSourceLang);
  const [destLang, setDestLang] = useState<string>(defaultDestLang);
  const [ready, setReady] = useState<boolean>(false);
  const [showModelDownloadProgressBar, setModelDownloadProgressBar] =
    useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState<number>();
  const [message, setMessage] = useState<string>("");
  const [disableButton, setDisableButton] = useState<boolean>(false);
  let worker = useRef<Worker>();

  const onMessageReceived = (e: any) => {
    switch (e.data.status) {
      case "initiate":
        setReady(false);
        break;
      case "ready":
        setReady(true);
        break;
      case "progress":
        setModelDownloadProgressBar(true);
        setFileName(e.data.file);
        setProgress(e.data.progress);
        break;
      case "done":
        setModelDownloadProgressBar(false);
        break;
      case "complete":
        setDisableButton(false);
        let data = e.data.output[0];

        setResult(data.translation_text);
        break;
    }
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../../workers/translation.ts", import.meta.url),
      );
    }
    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback(
    (text: string, sourceLang: string, destLang: string) => {
      if (worker.current) {
        if (text === "") {
          toast.error("Please enter text");

          return;
        }
        if (sourceLang === "") {
          toast.error("Please select source langauage");

          return;
        }
        if (destLang === "") {
          toast.error("Please select target language");

          return;
        }
        toast("Translating");
        setDisableButton(true);
        worker.current?.postMessage({ text, sourceLang, destLang });
      }
    },
    [],
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Language Translation</h1>
          <h2 className={subtitle()}>
            using{" "}
            <Link
              isExternal
              className="font-bold text-black dark:text-white"
              href="https://huggingface.co/Xenova/nllb-200-distilled-600M"
            >
              nllb-200-distilled-600M
            </Link>
          </h2>

          <Textarea
            className="pt-4 pb-4"
            placeholder="Enter text here"
            type="text"
            value={message}
            variant="bordered"
            onInput={(e: any) => {
              setMessage(e.target.value);
            }}
          />
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Autocomplete
              className="max-w-xs"
              defaultItems={siteConfig.languages}
              defaultSelectedKey={defaultSourceLang}
              label="Source Language"
              onSelectionChange={(key) => setSourceLang(key?.toString() ?? "")}
            >
              {(lang: any) => (
                <AutocompleteItem key={lang.code}>
                  {lang.language}
                </AutocompleteItem>
              )}
            </Autocomplete>
            <Autocomplete
              className="max-w-xs"
              defaultItems={siteConfig.languages}
              defaultSelectedKey={defaultDestLang}
              label="Target Language"
              onSelectionChange={(key) => setDestLang(key?.toString() ?? "")}
            >
              {(lang: any) => (
                <AutocompleteItem key={lang.code}>
                  {lang.language}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <Button
            className="mt-4 mb-4"
            disabled={disableButton}
            onPress={() => classify(message, sourceLang, destLang)}
          >
            Translate
          </Button>
          {showModelDownloadProgressBar && (
            <Progress
              className="max-w-md"
              label={`Downloading ${fileName}`}
              value={progress}
            />
          )}

          {ready !== null && <p className="text-xl">{result}</p>}
        </div>
      </div>
    </section>
  );
}
