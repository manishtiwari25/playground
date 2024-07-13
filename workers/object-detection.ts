import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;

class PipelineSingleton {
  static task: any = "object-detection";
  static model = "Xenova/detr-resnet-50";
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event: any) => {
  const reader = new FileReader();

  reader.onload = async (e2) => {
    self.postMessage({
      status: "processing",
      output: null,
    });
    let detector = await PipelineSingleton.getInstance((x: any) => {
      self.postMessage(x);
    });

    const analysis: any[] = await detector(e2?.target?.result, {
      threshold: 0.9,
      percentage: true,
    });

    self.postMessage({
      status: "complete",
      output: analysis,
    });
  };

  reader.readAsDataURL(event.data.file);
});
