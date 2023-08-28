import { NextRequest, NextResponse } from "next/server";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import {
  VectorDBQAChain,
  ConversationalRetrievalQAChain,
} from "langchain/chains";
import { StreamingTextResponse, LangChainStream } from "ai";
import { CallbackManager } from "langchain/callbacks";
import { pinecone } from "@/utils/pinecone-client";
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "@/config/pinecone";
import { makeChain } from "@/utils/make-chain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { question } = body;

    if (!question) {
      return new Response("No question asked", { status: 500 });
    }
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");

    const pine = await pinecone;

    const index = pine.Index(PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      }
    );

    // const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    //   pineconeIndex: index,
    // });

    // const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    //   k: 1,
    //   returnSourceDocuments: true,
    // });
    const chain = makeChain(vectorStore);
    // console.log("chain", chain);

    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: [],
    });

    // Call our chain with the prompt given by the user
    console.log("sanitizedQuestion", sanitizedQuestion);

    // const response = await chain
    //   .call({ query: sanitizedQuestion })
    //   .catch(console.error);

    console.log("response", response);

    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(error, { status: 500 });
  }
}
