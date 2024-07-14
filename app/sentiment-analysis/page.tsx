"use client";

import { Link } from "@nextui-org/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@nextui-org/input";
import { Progress } from "@nextui-org/progress";

import { subtitle, title } from "@/components/primitives";

export default function OfflineSentimentAnalysisPage() {
  const [result, setResult] = useState<{ label: string; score: number } | null>(
    null,
  );
  const [ready, setReady] = useState<boolean>(false);
  const [showModelDownloadProgressBar, setModelDownloadProgressBar] =
    useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState<number>();
  let worker = useRef<Worker>();

  const onMessageReceived = (e: any) => {
    switch (e.data.status) {
      case "initiate":
        setReady(false);
        break;
      case "ready":
        setReady(true);
        break;
      case "done":
        setModelDownloadProgressBar(false);
        break;
      case "progress":
        setModelDownloadProgressBar(true);
        setFileName(e.data.file);
        setProgress(e.data.progress);
        break;
      case "complete":
        let data = e.data.output[0];

        data.score = data.score.toFixed(2);
        setResult(data);
        break;
    }
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../../workers/sentiment-analysis", import.meta.url),
      );
    }
    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback((text: string) => {
    if (worker.current) {
      worker.current?.postMessage({ text });
    }
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Sentiment Analysis</h1>
          <h2 className={subtitle()}>
            using{" "}
            <Link
              isExternal
              className="font-bold text-black dark:text-white"
              href="https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english"
            >
              distilbert-base-uncased-finetuned-sst-2-english
            </Link>
          </h2>

          <Textarea
            className="pt-4 pb-4"
            placeholder="Enter text here"
            type="text"
            variant="bordered"
            onInput={(e: any) => {
              classify(e.target.value);
            }}
          />
          {showModelDownloadProgressBar && (
            <Progress
              className="max-w-md"
              label={`Downloading ${fileName}`}
              value={progress}
            />
          )}

          {ready !== null && (
            <div>
              {!ready || !result ? (
                <p>Please type something to load the model</p>
              ) : result.label === "POSITIVE" ? (
                <p className="text-6xl">🙂</p>
              ) : (
                <p className="text-6xl">🙁</p>
              )}
              {(ready || result) && (
                <div>
                  <p>Confidence {result?.score}</p>
                  <p>
                    1 is <span className="text-green-700">high</span>
                  </p>
                  <p>
                    0 is <span className="text-red-700">low</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
