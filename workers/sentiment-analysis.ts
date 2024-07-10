import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;
class PipelineSingleton {
  static task: any = "sentiment-analysis";
  static model = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event: any) => {
  let classifier = await PipelineSingleton.getInstance((x: any) => {
    self.postMessage(x);
  });

  let output = await classifier(event.data.text);

  self.postMessage({
    status: "complete",
    output: output,
  });
});
