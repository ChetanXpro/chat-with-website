import { isURLValid } from "@/utils/isURLValid";
import { NextRequest, NextResponse } from "next/server";
import * as Cheerio from "cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PINECONE_NAME_SPACE, PINECONE_INDEX_NAME } from "@/config/pinecone";
// import {} from "langchain/document_loaders";
import { Document } from "langchain/document";
import { pinecone } from "@/utils/pinecone-client";
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !isURLValid(url)) {
      return NextResponse.json(
        { error: "Provide a valid url" },
        { status: 500 }
      );
    }

    const response = await fetch(url);
    const html = await response.text();
    const $ = Cheerio.load(html);

    const paragraphs = $("p")
      .toArray()
      .map((el) => $(el).text());
    const headings = $("h1, h2, h3, h4, h5, h6")
      .toArray()
      .map((el) => $(el).text());
    // const anchorText = $("a")
    //   .toArray()
    //   .map((el) => $(el).text());
    const spanText = $("span")
      .toArray()
      .map((el) => $(el).text());
    const divText = $("div")
      .toArray()
      .map((el) => $(el).text());

    const allTextContent = [
      ...paragraphs,
      ...headings,
      // ...anchorText,
      ...spanText,
      ...divText,
    ];
    const cleanedAllTextContent = allTextContent.map((text) =>
      text.replace(/\n/g, " ").replace(/\t/g, " ").replace(/\s+/g, " ").trim()
    );

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 200,
    });

    const doc = new Document({ pageContent: cleanedAllTextContent.join(" ") });

    const docs = await textSplitter.splitDocuments([doc]);
    // console.log("split docs", docs);

    const embeddings = new OpenAIEmbeddings({
      maxConcurrency: 2,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pine = await pinecone;

    const index = pine.Index(PINECONE_INDEX_NAME);

    console.log("index...");

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: "text",
    });
    console.log("index done");

    return NextResponse.json({ data: "embedding stored" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
