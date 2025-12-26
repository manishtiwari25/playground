"use client";

import {
  Accordion,
  AccordionItem,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@heroui/input";
import { Progress } from "@heroui/progress";
import toast from "react-hot-toast";

import { subtitle, title } from "@/components/primitives";
const entities = [
  {
    abbreviation: "O",
    description: "Outside of a named entity",
  },
  {
    abbreviation: "B-PER",
    description:
      "Beginning of a person’s name right after another person’s name",
  },
  {
    abbreviation: "I-PER",
    description: "Person’s name",
  },
  {
    abbreviation: "B-ORG",
    description:
      "Beginning of an organisation right after another organisation",
  },
  {
    abbreviation: "I-ORG",
    description: "Organisation",
  },
  {
    abbreviation: "B-LOC",
    description: "Beginning of a location right after another location",
  },
  {
    abbreviation: "I-LOC",
    description: "Location",
  },
];

export default function OfflineSentimentAnalysisPage() {
  const [result, setResult] = useState<any[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [showModelDownloadProgressBar, setModelDownloadProgressBar] =
    useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState<number>();
  const [message, setMessage] = useState<string>(
    "Hallo, ich bin Adam und komme aus Österreich.",
  );
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
        setResult(e.data.output);
        break;
    }
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../../workers/ner.ts", import.meta.url),
      );
    }
    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  const analyze = useCallback((text: string) => {
    if (worker.current) {
      if (text === "") {
        toast.error("Please enter text");

        return;
      }

      toast("Analyzing...");
      setDisableButton(true);
      worker.current?.postMessage({ text });
    }
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Named Entity Recognition(NER)</h1>
          <h2 className={subtitle()}>
            using{" "}
            <Link
              isExternal
              className="font-bold text-black dark:text-white"
              href="https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl"
            >
              bert-base-multilingual-cased-ner-hrl
            </Link>
          </h2>
          <Accordion>
            <AccordionItem
              key="entity"
              aria-label="Entity Information"
              title="Entity Information"
            >
              <Table aria-label="Example static collection table">
                <TableHeader>
                  <TableColumn>Abbreviation</TableColumn>
                  <TableColumn>Description</TableColumn>
                </TableHeader>
                <TableBody>
                  {entities.map((x) => (
                    <TableRow key={x.abbreviation}>
                      <TableCell>{x.abbreviation}</TableCell>
                      <TableCell>{x.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionItem>
          </Accordion>

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
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4" />
          <Button
            className="mt-4 mb-4"
            disabled={disableButton}
            onPress={() => analyze(message)}
          >
            Analyze
          </Button>
          {showModelDownloadProgressBar && (
            <Progress
              className="max-w-md"
              label={`Downloading ${fileName}`}
              value={progress}
            />
          )}

          {ready !== null && result?.length > 0 && (
            <Table aria-label="Example static collection table">
              <TableHeader>
                <TableColumn>Entity</TableColumn>
                <TableColumn>Index</TableColumn>
                <TableColumn>Score</TableColumn>
                <TableColumn>Word</TableColumn>
              </TableHeader>
              <TableBody>
                {result.map((x) => (
                  <TableRow key={x.word}>
                    <TableCell>{x.entity}</TableCell>
                    <TableCell>{x.index}</TableCell>
                    <TableCell>{x.score.toFixed(2)}</TableCell>
                    <TableCell>{x.word}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </section>
  );
}
