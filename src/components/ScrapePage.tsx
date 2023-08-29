"use client";
import React from "react";
import * as cheerio from "cheerio";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { useToast } from "./ui/use-toast";
import { isURLValid } from "@/utils/isURLValid";
import Loader from "./Loader";

const ScrapePage = () => {
  const [isLoading, setIsLoading] = React.useState(false);
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

      setIsLoading(true);

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });
      const data = await response.json();
      console.log("data", data);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;
  return (
    <div className=" flex w-[50%] gap-4">
      <Input
        className="rounded-xl"
        placeholder="Enter website url"
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button className="bg-blue-400 rounded-xl" onClick={() => scrapeUrl(url)}>
        Scrape
      </Button>
    </div>
  );
};

export default ScrapePage;
