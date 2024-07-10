import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;

class PipelineSingleton {
  static task: any = "translation";
  static model = "Xenova/nllb-200-distilled-600M";
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event: any) => {
  let translator = await PipelineSingleton.getInstance((x: any) => {
    self.postMessage(x);
  });

  const output = await translator(event.data.text, {
    src_lang: event.data.sourceLang,
    tgt_lang: event.data.destLang,
  });

  self.postMessage({
    status: "complete",
    output: output,
  });
});
