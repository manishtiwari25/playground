import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;

class PipelineSingleton {
  static task: any = "automatic-speech-recognition";
  static model = "Xenova/whisper-base";
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event: any) => {
  let transcriber = await PipelineSingleton.getInstance((x: any) => {
    self.postMessage(x);
  });

  const output = await transcriber(event.data.float32Array, {
    return_timestamps: true,
    force_full_sequences: false,
    top_k: 0,
    do_sample: false,
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  self.postMessage({
    status: "complete",
    output: output,
  });
});
