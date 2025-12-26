"use client";
import { useEffect, useRef, useState } from "react";
import { Progress } from "@heroui/progress";
import { Image } from "@heroui/image";
import { Link, Spinner } from "@heroui/react";

import FileUploadButton from "@/components/shared/upload-file";
import { CancelIcon } from "@/icons/cancel";
import { UploadIcon } from "@/icons/upload";
import { getRandomColor } from "@/utils/random-color";
import { subtitle, title } from "@/components/primitives";
export default function ObjectDetectionPage() {
  const [imageUrl, setImageUrl] = useState<string>();
  const [showModelDownloadProgressBar, setModelDownloadProgressBar] =
    useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [showAnalysing, setShowAnalysing] = useState<boolean>(false);

  const [progress, setProgress] = useState<number>();
  const [detectedBoxesObject, setBoxDetectedObject] = useState<any[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  let worker = useRef<Worker>();

  const onMessageReceived = (e: any) => {
    switch (e.data.status) {
      case "done":
        setModelDownloadProgressBar(false);
        break;
      case "progress":
        setModelDownloadProgressBar(true);
        setBoxDetectedObject([]);
        setFileName(e.data.file);
        setProgress(e.data.progress);
        break;
      case "complete":
        setShowAnalysing(false);
        setBoxDetectedObject(e.data.output);
        break;
      case "processing":
        setShowAnalysing(true);
        break;
    }
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../../workers/object-detection.ts", import.meta.url),
      );
    }
    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Object Detection</h1>
        <h2 className={subtitle()}>
          using{" "}
          <Link
            isExternal
            className="font-bold text-black dark:text-white"
            href="https://huggingface.co/facebook/detr-resnet-50"
          >
            detr-resnet-50
          </Link>
        </h2>
        {showAnalysing && <Spinner color="warning" label="Analysing..." />}
        <div className="relative inline-block">
          {!isImageLoaded ? (
            <div className="w-full h-64 border-2 border-dashed border-gray-400 flex items-center justify-center">
              <span className="text-gray-400 p-20">No Image Selected</span>
            </div>
          ) : (
            <Image alt="img" className="relative" src={imageUrl} />
          )}

          {detectedBoxesObject.map((x: any, index: any) => (
            <div
              key={index}
              className="absolute border z-10"
              style={{
                top: `${x.box.ymin * 100}%`,
                left: `${x.box.xmin * 100}%`,
                width: `${(x.box.xmax - x.box.xmin) * 100}%`,
                height: `${(x.box.ymax - x.box.ymin) * 100}%`,
                border: `2px solid ${getRandomColor()}`,
              }}
            >
              <span className="bg-red-500 text-white text-xs absolute -top-4 left-0">
                {x.label}
              </span>
            </div>
          ))}
        </div>

        <FileUploadButton
          accept="image/*"
          className="m-4"
          rejectProps={{ color: "danger", startContent: <CancelIcon /> }}
          size="lg"
          startContent={<UploadIcon />}
          onUpload={(files) => {
            setImageUrl(URL.createObjectURL(files[0]));
            setIsImageLoaded(true);
            setBoxDetectedObject([]);
            if (worker.current) {
              worker.current?.postMessage({ file: files[0] });
            }
          }}
        >
          Upload
        </FileUploadButton>
        {showModelDownloadProgressBar && (
          <Progress
            className="max-w-md"
            label={`Downloading ${fileName}`}
            value={progress}
          />
        )}
      </div>
    </section>
  );
}
