import type { LanguageModelLike } from "@langchain/core/language_models/base";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { Message } from "@/app/rag/types/message";

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

const modelConfig = {
  model: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
  chatOptions: {
    temperature: 0.5,
  },
};
const vectorstore = new MemoryVectorStore(embeddings, {});

const SYSTEM_TEMPLATE: string = `You are an experienced researcher, expert at interpreting and answering questions based on provided sources. Using the provided context, answer the user's question to the best of your ability using the resources provided.
Generate a concise answer for a given question based solely on the provided search results. You must only use information from the provided search results. Use an unbiased and journalistic tone. Combine search results together into a coherent answer. Do not repeat text, stay focused, and stop generating when you have answered the question.
If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.`;

const embedPDF = async (pdfBlob: Blob) => {
  const pdfLoader = new WebPDFLoader(pdfBlob, { parsedItemSeparator: " " });
  const docs = await pdfLoader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  await vectorstore.addDocuments(splitDocs);
};
const formatChatHistoryAsMessages = async (chatHistory: Message[]) => {
  return chatHistory.map((chatMessage) => {
    if (chatMessage.role === "human") {
      return new HumanMessage(chatMessage.content);
    } else {
      return new AIMessage(chatMessage.content);
    }
  });
};
const generateRAGResponse = async (
  messages: Message[],
  {
    chatModel,
    devModeTracer,
  }: {
    chatModel: LanguageModelLike;
    devModeTracer?: LangChainTracer;
  },
) => {
  const text = messages[messages.length - 1].content;
  const chatHistory = await formatChatHistoryAsMessages(messages.slice(0, -1));

  let responseChainPrompt;

  responseChainPrompt = ChatPromptTemplate.fromMessages<{
    context: string;
    chat_history: BaseMessage[];
    question: string;
  }>([
    ["system", SYSTEM_TEMPLATE],
    [
      "user",
      "When responding to me, use the following documents as context:\n<context>\n{context}\n</context>",
    ],
    [
      "ai",
      "Understood! I will use the documents between the above <context> tags as context when answering your next questions.",
    ],
    ["placeholder", "{chat_history}"],
    ["user", `{input}`],
  ]);

  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt: responseChainPrompt,
    documentPrompt: PromptTemplate.fromTemplate(
      `<doc>\n{page_content}\n</doc>`,
    ),
  });

  let historyAwarePrompt;

  historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ["placeholder", "{chat_history}"],
    [
      "user",
      "Given the above conversation, rephrase the following question into a standalone, natural language query with important keywords that a researcher could later pass into a search engine to get information relevant to the conversation. Do not respond with anything except the query.\n\n<question_to_rephrase>\n{input}\n</question_to_rephrase>",
    ],
  ]);

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: chatModel,
    retriever: vectorstore.asRetriever(),
    rephrasePrompt: historyAwarePrompt,
  });

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever: historyAwareRetrieverChain,
  });

  // retrievalChain streams back an object with a few fields.
  // We only want to stream back the answer, so pick it out.
  const fullChain = retrievalChain.pick("answer");

  const stream = await fullChain.stream(
    {
      input: text,
      chat_history: chatHistory,
    },
    {
      callbacks: devModeTracer !== undefined ? [devModeTracer] : [],
    },
  );

  for await (const chunk of stream) {
    if (chunk) {
      self.postMessage({
        type: "chunk",
        data: chunk,
      });
    }
  }

  self.postMessage({
    type: "complete",
    data: "OK",
  });
};

self.addEventListener("message", async (event: { data: any }) => {
  let devModeTracer;

  if (event.data.pdf) {
    try {
      await embedPDF(event.data.pdf);
    } catch (e: any) {
      self.postMessage({
        type: "error",
        error: e.message,
      });
      throw e;
    }
  } else {
    let chatModel: BaseChatModel | LanguageModelLike;

    const webllmModel = new ChatWebLLM(modelConfig);

    await webllmModel.initialize((event) =>
      self.postMessage({ type: "init_progress", data: event }),
    );
    // Best guess at Phi-3 tokens
    chatModel = webllmModel.bind({
      stop: ["\nInstruct:", "Instruct:", "<hr>", "\n<hr>"],
    });

    try {
      await generateRAGResponse(event.data.messages, {
        devModeTracer,
        chatModel,
      });
    } catch (e: any) {
      self.postMessage({
        type: "error",
        error: `${e.message}. Make sure your browser supports WebLLM/WebGPU.`,
      });
      throw e;
    }
  }

  self.postMessage({
    type: "complete",
    data: "OK",
  });
});
