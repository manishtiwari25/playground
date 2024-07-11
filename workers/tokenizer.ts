import { env, AutoTokenizer } from "@xenova/transformers";

env.allowLocalModels = false;

const TOKENIZER_MAPPINGS = new Map();

self.addEventListener("message", async (event) => {
  let tokenizerPromise = TOKENIZER_MAPPINGS.get(event.data.model_id);

  if (!tokenizerPromise) {
    tokenizerPromise = AutoTokenizer.from_pretrained(event.data.model_id);

    TOKENIZER_MAPPINGS.set(
      event.data.model_id,
      new Promise((resolve) => {
        tokenizerPromise.then((tokenizer: any) => {
          switch (tokenizer.constructor.name) {
            case "LlamaTokenizer":
            case "Grok1Tokenizer":
              tokenizer.decoder.decoders.pop();
              break;
            case "T5Tokenizer":
              tokenizer.decoder.addPrefixSpace = false;
              break;
          }
          resolve(tokenizer);
        });
      }),
    );
  }

  const tokenizer = await tokenizerPromise;

  const text = event.data.text;

  const token_ids = tokenizer.encode(text);

  let decoded = token_ids.map((x: any) => tokenizer.decode([x]));

  let margins = [];

  switch (tokenizer.constructor.name) {
    case "BertTokenizer":
      margins = decoded.map((x: any, i: any) =>
        i === 0 || x.startsWith("##") ? 0 : 8,
      );
      decoded = decoded.map((x: any) => x.replace("##", ""));
      break;
    case "T5Tokenizer":
      if (decoded.length > 0 && decoded.length !== " ") {
        decoded[0] = decoded[0].replace(/^ /, "");
      }
      break;
  }

  self.postMessage({
    token_ids,
    decoded,
    margins,
  });
});
