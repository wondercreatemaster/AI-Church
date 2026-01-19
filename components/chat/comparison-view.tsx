"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GitCompare, Lightbulb, ExternalLink, Quote } from "lucide-react";
import { ComparisonData } from "@/lib/mock-data";

interface ComparisonViewProps {
  data: ComparisonData;
  onFollowUp?: () => void;
  onNewTopic?: () => void;
  onSave?: () => void;
}

export function ComparisonView({ data, onFollowUp, onNewTopic, onSave }: ComparisonViewProps) {
  return (
    <Card className="w-full p-6 md:p-8 bg-white shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <GitCompare className="w-6 h-6 text-orthodox-600" />
          <h2 className="text-xl md:text-2xl font-display font-semibold text-orthodox-600">
            {data.topic}
          </h2>
        </div>
        <p className="text-sm text-gray-600">A Theological Comparison</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="summary">Summary View</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="historical">Historical Context</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column: User's Tradition */}
            <div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-300 mb-4"
              >
                {data.userTradition} View
              </Badge>
              <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  {data.userView.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {data.userView.description}
                </p>
                <ul className="space-y-2 mb-4">
                  {data.userView.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-gray-500 italic pt-4 border-t border-blue-200">
                  <ExternalLink className="inline w-3 h-3 mr-1" />
                  Source: {data.userView.source}
                </div>
              </Card>
            </div>

            {/* Right Column: Orthodox View */}
            <div>
              <Badge
                variant="outline"
                className="bg-byzantine-50 text-byzantine-700 border-byzantine-300 mb-4"
              >
                Orthodox View
              </Badge>
              <Card className="bg-gradient-to-br from-byzantine-50 to-white border-2 border-byzantine-300 p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  {data.orthodoxView.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {data.orthodoxView.description}
                </p>
                <ul className="space-y-2 mb-4">
                  {data.orthodoxView.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-byzantine-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Patristic Quote */}
                <div className="bg-burgundy-50 border-l-4 border-burgundy-500 pl-4 py-3 my-4">
                  <Quote className="w-4 h-4 text-burgundy-600 mb-2" />
                  <p className="text-sm font-scripture italic text-gray-800 leading-relaxed">
                    &quot;{data.orthodoxView.quote.text}&quot;
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    — {data.orthodoxView.quote.author}
                  </p>
                </div>

                <div className="text-xs text-gray-500 italic pt-4 border-t border-byzantine-200">
                  <ExternalLink className="inline w-3 h-3 mr-1" />
                  Source: {data.orthodoxView.source}
                </div>
              </Card>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Key Difference Alert */}
          <Alert className="border-l-4 border-orthodox-500 mb-6">
            <Lightbulb className="h-5 w-5 text-orthodox-600" />
            <div className="ml-2">
              <h4 className="font-semibold text-orthodox-600 mb-1">Key Difference</h4>
              <AlertDescription className="text-gray-700">
                {data.keyDifference}
              </AlertDescription>
            </div>
          </Alert>

          {/* Further Reading */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="reading">
              <AccordionTrigger className="text-lg font-semibold">
                Recommended Sources
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {data.furtherReading.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="text-sm text-byzantine-600 hover:text-byzantine-700 hover:underline flex items-center gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onFollowUp} className="bg-byzantine-500 hover:bg-byzantine-600">
              Ask Follow-up
            </Button>
            <Button onClick={onNewTopic} variant="outline">
              New Topic
            </Button>
            <Button onClick={onSave} variant="ghost">
              Save
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <div className="text-center py-12 text-gray-500">
            <p>Detailed comparison view would go here...</p>
          </div>
        </TabsContent>

        <TabsContent value="historical">
          <div className="text-center py-12 text-gray-500">
            <p>Historical context view would go here...</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

