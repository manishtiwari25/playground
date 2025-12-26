"use client";

import {
  Accordion,
  AccordionItem,
  Button,
  Link,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useState, useEffect, useRef } from "react";
import { Progress } from "@heroui/progress";

import { subtitle, title } from "@/components/primitives";
import FileUploadButton from "@/components/shared/upload-file";
import { CancelIcon } from "@/icons/cancel";
import { UploadIcon } from "@/icons/upload";
import { MicEndIcon } from "@/icons/mic-end";
import { MicIcon } from "@/icons/mic";

export default function WhisperPage() {
  const [result, setResult] = useState<string>("");
  const [transcript, setTranscript] = useState<any[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [showModelDownloadProgressBar, setModelDownloadProgressBar] =
    useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState<number>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioRecorded, setAudioRecorded] = useState<boolean>(false);
  let worker = useRef<Worker>();

  const onMessageReceived = (e: any) => {
    switch (e.data.status) {
      case "progress":
        setModelDownloadProgressBar(true);
        setFileName(e.data.file);
        setProgress(e.data.progress);
        break;
      case "done":
        setModelDownloadProgressBar(false);
        break;
      case "complete":
        setResult(e.data.output.text);
        setTranscript(e.data.output.chunks);
        setIsProcessing(false);
        setReady(true);
        break;
    }
  };
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);

  const [recording, setRecording] = useState(false);

  const chunks = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  }, []);

  const initialMediaRecorder = (stream: any) => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      chunks.current = []; // Resetting chunks array
    };

    mediaRecorder.ondataavailable = (ev: any) => {
      chunks.current.push(ev.data); // Storing data chunks
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext({
        sampleRate: 16000,
      });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const float32Array = audioBuffer.getChannelData(0);

      setAudioUrl(URL.createObjectURL(audioBlob));
      setAudioRecorded(true);
      setIsProcessing(true);
      worker.current?.postMessage({ float32Array });
    };

    setMediaRecorder(mediaRecorder);
  };
  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../../workers/whisper.ts", import.meta.url),
      );
    }
    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Speech Recognition</h1>
          <h2 className={subtitle()}>
            using{" "}
            <Link
              isExternal
              className="font-bold text-black dark:text-white"
              href="https://huggingface.co/openai/whisper-base"
            >
              whisper-base
            </Link>
          </h2>
          <div className="flex justify-between items-center">
            <FileUploadButton
              accept="audio/*"
              className="m-4"
              rejectProps={{ color: "danger", startContent: <CancelIcon /> }}
              size="lg"
              startContent={<UploadIcon />}
              onUpload={async (files) => {
                if (worker.current) {
                  setAudioUrl(URL.createObjectURL(files[0]));
                  setAudioRecorded(true);

                  const arrayBuffer = await files[0].arrayBuffer();
                  const audioContext = new AudioContext({
                    sampleRate: 16000,
                  });
                  const audioBuffer =
                    await audioContext.decodeAudioData(arrayBuffer);
                  const float32Array = audioBuffer.getChannelData(0);

                  worker.current?.postMessage({ float32Array });
                  setIsProcessing(true);
                }
              }}
            >
              Upload
            </FileUploadButton>
            <Button
              startContent={recording ? <MicEndIcon /> : <MicIcon />}
              onPressEnd={stopRecording} // Stop recording when mouse is released
              onPressStart={startRecording} // Start recording when mouse is pressed
            >
              Record from browser
            </Button>
          </div>
          {audioRecorded && (
            <div className="flex justify-center m-4">
              <audio controls src={audioUrl}>
                <source />
                <track default kind="captions" srcLang="en" />
              </audio>
            </div>
          )}

          {showModelDownloadProgressBar && (
            <Progress
              className="max-w-md"
              label={`Downloading ${fileName}`}
              value={progress}
            />
          )}
          {isProcessing && (
            <Spinner color="warning" label="Processing..." size="lg" />
          )}
          {ready !== null && ready && (
            <>
              <p className="text-xl justify-center">{result}</p>
              <Accordion>
                <AccordionItem
                  key="transcript"
                  aria-label="Transcript"
                  title="Transcript"
                >
                  <Table aria-label="Example static collection table">
                    <TableHeader>
                      <TableColumn>Timestamp</TableColumn>
                      <TableColumn>Transcript</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {transcript.map((x) => (
                        <TableRow key={x.text}>
                          <TableCell>
                            {x.timestamp[0]}-{x.timestamp[1]}
                          </TableCell>
                          <TableCell>{x.text}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
