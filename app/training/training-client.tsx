"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, FileUp, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TrainingClient() {
  const [textLoading, setTextLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);

  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textSource, setTextSource] = useState("");
  const [textAuthor, setTextAuthor] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfAuthor, setPdfAuthor] = useState("");

  const [urlValue, setUrlValue] = useState("");
  const [urlTitle, setUrlTitle] = useState("");

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!textContent.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    setTextLoading(true);
    try {
      const res = await fetch("/api/training/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textContent.trim(),
          title: textTitle.trim() || undefined,
          source: textSource.trim() || undefined,
          author: textAuthor.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add text");
        return;
      }
      if (typeof data.upserted === "number" && data.upserted === 0) {
        toast.error(
          data.errors?.[0] ||
            "Nothing was added to the database. Check your OpenAI/Pinecone configuration."
        );
        return;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        toast.warning(
          `Added ${data.upserted} chunks, but ${data.errors.length} chunk(s) failed.`
        );
      } else {
        toast.success(`Added ${data.upserted} chunks to the chatbot database.`);
      }
      setTextContent("");
      setTextTitle("");
      setTextSource("");
      setTextAuthor("");
    } catch {
      toast.error("Request failed. Try again.");
    } finally {
      setTextLoading(false);
    }
  }

  async function handlePdfSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please select a PDF file.");
      return;
    }
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", pdfFile);
      if (pdfTitle.trim()) formData.set("title", pdfTitle.trim());
      if (pdfAuthor.trim()) formData.set("author", pdfAuthor.trim());
      const res = await fetch("/api/training/pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add PDF");
        return;
      }
      if (typeof data.upserted === "number" && data.upserted === 0) {
        toast.error(
          data.errors?.[0] ||
            "Nothing was added to the database. Check your OpenAI/Pinecone configuration."
        );
        return;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        toast.warning(
          `Added ${data.upserted} chunks from ${data.pages} page(s), but ${data.errors.length} chunk(s) failed.`
        );
      } else {
        toast.success(
          `Added ${data.upserted} chunks from ${data.pages} page(s) to the chatbot database.`
        );
      }
      setPdfFile(null);
      setPdfTitle("");
      setPdfAuthor("");
    } catch {
      toast.error("Request failed. Try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlValue.trim()) {
      toast.error("Please enter a URL.");
      return;
    }
    setUrlLoading(true);
    try {
      const res = await fetch("/api/training/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlValue.trim(),
          title: urlTitle.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add URL");
        return;
      }
      if (typeof data.upserted === "number" && data.upserted === 0) {
        toast.error(
          data.errors?.[0] ||
            "Nothing was added to the database. Check your OpenAI/Pinecone configuration."
        );
        return;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        toast.warning(
          `Added ${data.upserted} chunks, but ${data.errors.length} chunk(s) failed.`
        );
      } else {
        toast.success(`Added ${data.upserted} chunks from the page to the chatbot database.`);
      }
      setUrlValue("");
      setUrlTitle("");
    } catch {
      toast.error("Request failed. Try again.");
    } finally {
      setUrlLoading(false);
    }
  }

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Text
        </TabsTrigger>
        <TabsTrigger value="pdf" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          PDF
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          URL
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add text document</CardTitle>
            <CardDescription>
              Paste or type content. It will be chunked and stored so the chatbot can use it in answers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-content">Content *</Label>
                <Textarea
                  id="text-content"
                  placeholder="Paste or type your training text here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={10}
                  className="resize-y"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="text-title">Title</Label>
                  <Input
                    id="text-title"
                    placeholder="e.g. Catechism excerpt"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-source">Source</Label>
                  <Input
                    id="text-source"
                    placeholder="e.g. Book name"
                    value={textSource}
                    onChange={(e) => setTextSource(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-author">Author</Label>
                  <Input
                    id="text-author"
                    placeholder="e.g. Church Father"
                    value={textAuthor}
                    onChange={(e) => setTextAuthor(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={textLoading} className="bg-byzantine-500 hover:bg-byzantine-600">
                {textLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add to database"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pdf" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add PDF document</CardTitle>
            <CardDescription>
              Upload a PDF file. Its text will be extracted, chunked, and stored for the chatbot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePdfSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-file">PDF file *</Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pdf-title">Title</Label>
                  <Input
                    id="pdf-title"
                    placeholder="e.g. Orthodox Catechism"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf-author">Author</Label>
                  <Input
                    id="pdf-author"
                    placeholder="Optional"
                    value={pdfAuthor}
                    onChange={(e) => setPdfAuthor(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={pdfLoading || !pdfFile} className="bg-byzantine-500 hover:bg-byzantine-600">
                {pdfLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add to database"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="url" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add web page (URL)</CardTitle>
            <CardDescription>
              Enter a web page URL. The main text will be fetched, chunked, and stored for the chatbot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-value">URL *</Label>
                <Input
                  id="url-value"
                  type="url"
                  placeholder="https://example.com/article"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url-title">Title (optional)</Label>
                <Input
                  id="url-title"
                  placeholder="Page title (defaults to page &lt;title&gt;)"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={urlLoading} className="bg-byzantine-500 hover:bg-byzantine-600">
                {urlLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add to database"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
