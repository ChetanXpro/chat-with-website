"use client";
import React from "react";
import * as cheerio from "cheerio";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { useToast } from "./ui/use-toast";
import { isURLValid } from "@/utils/isURLValid";

const ScrapePage = () => {
  const [url, setUrl] = React.useState("");
  const { toast } = useToast();

  const scrapeUrl = async (url: string) => {
    try {
      if (!url && isURLValid(url)) {
        console.log("Invalid URL");

        toast({
          variant: "destructive",
          title: "Invalid URL",
          description: "Please enter a valid URL",
        });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <Input onChange={(e) => setUrl(e.target.value)} />
      <Button onClick={() => scrapeUrl(url)}>Scrape</Button>
    </div>
  );
};

export default ScrapePage;
