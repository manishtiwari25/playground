import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;

class PipelineSingleton {
  static task: any = "token-classification";
  static model = "Xenova/bert-base-multilingual-cased-ner-hrl";
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event: any) => {
  let analyze = await PipelineSingleton.getInstance((x: any) => {
    self.postMessage(x);
  });

  const output = await analyze(event.data.text);

  self.postMessage({
    status: "complete",
    output: output,
  });
});
