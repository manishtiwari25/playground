"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Button } from "@nextui-org/button";
import Head from "next/head";

import { ChangeModel } from "./change-model";
import { Number } from "./number";
import { Token } from "./token";

export default function Home() {
  const textareaRef = useRef<any>(null);
  const outputRef = useRef<any>(null);

  const [tokenIds, setTokenIds] = useState([]);
  const [decodedTokens, setDecodedTokens] = useState([]);
  const [margins, setMargins] = useState([]);
  const [tokenizer, setTokenizer] = useState("Xenova/gpt-4o");
  const [textAreaValue, setTextAreaValue] = useState(
    textareaRef.current?.value ?? "",
  );

  // Create a reference to the worker object.
  const worker = useRef<Worker>();

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(
        new URL("../../workers/tokenizer.ts", import.meta.url),
      );
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: any) => {
      setTokenIds(e.data.token_ids);
      setDecodedTokens(e.data.decoded);
      setMargins(e.data.margins);
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  }, []);

  const resetOutput = useCallback(() => {
    textareaRef.current = "";
    setTextAreaValue("");
    setTokenIds([]);
    setDecodedTokens([]);
    setMargins([]);
  }, []);

  const onInputChange = useCallback(
    (e: any) => {
      const model_id = tokenizer;
      const text = e.target.value;

      worker.current?.postMessage({ model_id, text });
      setTextAreaValue(text);
    },
    [tokenizer],
  );

  const onTokenizerChange = useCallback((e: any) => {
    const model_id = e.target.value;

    setTokenizer(model_id);
    if (!model_id) return;
    worker.current?.postMessage({ model_id, text: textareaRef.current.value });
  }, []);

  const onShowExamplePress = () => {
    const model_id = tokenizer;
    let text = `Certain phrases fit into one token, while others span multiple tokens: extraordinary

Punctuation marks can be broken into several tokens: !?

Unicode characters like emojis may be split into many tokens containing the underlying bytes: 🤖

Common letter combinations often appear as a single token: thesharedsequence`;

    setTextAreaValue(text);
    worker.current?.postMessage({ model_id, text });
  };

  return (
    <>
      <Head>
        <meta
          content="Explore how large language models tokenize text with our tool. Understand tokenization, see how text is broken into tokens, and view the total token count. Discover how different models tokenize the same text differently. Ideal for anyone looking to delve into the mechanics of language processing models and improve their knowledge of NLP. Compatible with various models including GPT-4, GPT-3.5, Grok-1, Claude, Mistral, Gemma, Llama, T5, and BERT."
          name="description"
        />
        <meta
          content="GPT-4, GPT-3.5-turbo, text-embedding-ada-002, text-davinci-003, text-davinci-002, GPT-3, Grok-1, Claude, Mistral v3, Mistral v1, Gemma, Llama 3, LLaMA, Llama 2, T5, bert-base-cased, tokenization, language models, NLP, natural language processing, text analysis, token count, text tokenization tool"
          name="keywords"
        />
      </Head>
      <main className="flex min-h-screen flex-col pl-96 pt-10 max-w-[70%]">
        <div className="flex mb-2 justify-between">
          <h1 className="dark:text-white text-5xl font-extrabold">Tokenizer</h1>
          <ChangeModel
            selected={tokenizer}
            onModelChange={(e: any) => {
              resetOutput();
              onTokenizerChange(e);
            }}
          />
        </div>
        <h2 className="font-bold mb-2 dark:text-white">
          Learn about language model tokenization
        </h2>
        <p className="mb-2 dark:text-white">
          Large language models process text by breaking it down into tokens,
          which are common sequences of characters within the text. These models
          learn to understand the statistical relationships between tokens and
          are particularly skilled at predicting the next token in a sequence.
          The tool below can help you see how a text might be tokenized by a
          language model and provide the total token count for that text. Note
          that the tokenization process can vary between different models. For
          example, newer models may use a different tokenizer compared to
          earlier ones, resulting in different tokens for the same text input.
        </p>
        <Textarea
          ref={textareaRef}
          className="bg-transparent pt-5"
          label="Enter text here"
          size="lg"
          value={textAreaValue}
          variant="bordered"
          onChange={onInputChange}
        />
        <div className="flex justify-start gap-5 pt-5">
          <Button variant="bordered" onPress={resetOutput}>
            Clear
          </Button>
          <Button variant="bordered" onPress={onShowExamplePress}>
            Show Example
          </Button>
        </div>
        <div className="flex justify-center gap-5 pt-5">
          <div className="w-[15%]">
            <Number count={tokenIds.length} title="Tokens" />
          </div>
          <div className="w-[15%]">
            <Number
              count={textareaRef.current?.value?.length ?? 0}
              title="Characters"
            />
          </div>
        </div>
        <Tabs aria-label="Options" className="pt-5" variant="bordered">
          <Tab key="text" title="Text">
            <div
              ref={outputRef}
              className="max-h-[500px] min-h-[200px] overflow-auto rounded-3xl p-[20px] text-black"
            >
              {decodedTokens.map((token, index) => (
                <Token
                  key={index}
                  margin={margins[index]}
                  position={index}
                  text={token}
                />
              ))}
            </div>
          </Tab>
          <Tab key="token_ids" title="Token IDs">
            <div
              ref={outputRef}
              className="max-h-[500px] min-h-[200px] overflow-auto rounded-3xl p-[20px]"
            >
              <span className="leading-5 inline-block text-lg">
                [{tokenIds.join(", ")}]
              </span>
            </div>
          </Tab>
        </Tabs>
        <p className="mb-2 text-black">
          As a general rule, one token usually represents about four characters
          in typical English text, which translates to roughly 75 words for
          every 100 tokens.
        </p>
        <p className="mb-2 text-black pt-3">
          This tool is built with
          <a
            className="font-bold"
            href="https://github.com/xenova/transformers.js"
          >
            {" "}
            transformers.js{" "}
          </a>
          and loads AI models directly in your browser. If you found this tool
          helpful, please support
          <a
            className="font-bold"
            href="https://github.com/xenova/transformers.js"
          >
            {" "}
            transformers.js{" "}
          </a>
          and explore their other open-source projects.
        </p>
      </main>
    </>
  );
}
