"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChurchTimeline } from "@/components/timeline/church-timeline";
import {
  MessageSquare,
  AlertCircle,
  Cross,
} from "lucide-react";

interface ReligionOption {
  id: string;
  name: string;
  year: number;
  color: string;
  emoji: string;
  description: string;
}

export default function Home() {
  // Religion options for selection
  const religionOptions: ReligionOption[] = [
    { id: "orthodox", name: "Eastern Orthodox", year: 33, color: "byzantine-600", emoji: "☦️", description: "The unchanged faith of the early Church" },
    { id: "catholic", name: "Roman Catholic", year: 1054, color: "red-600", emoji: "✝️", description: "Western Christianity after the Great Schism" },
    { id: "protestant", name: "Protestant", year: 1517, color: "green-600", emoji: "📖", description: "Reformed traditions from the Reformation" },
    { id: "anglican", name: "Anglican/Episcopal", year: 1534, color: "purple-600", emoji: "⛪", description: "English Reformation tradition" },
    { id: "baptist", name: "Baptist", year: 1609, color: "blue-700", emoji: "💧", description: "Believer's baptism tradition" },
    { id: "methodist", name: "Methodist", year: 1738, color: "orange-600", emoji: "🔥", description: "Wesleyan revival movement" },
    { id: "pentecostal", name: "Pentecostal", year: 1906, color: "yellow-600", emoji: "🕊️", description: "Charismatic renewal movement" },
    { id: "mormon", name: "LDS/Mormon", year: 1830, color: "indigo-600", emoji: "📜", description: "Latter-day Saint tradition" },
    { id: "other", name: "Other/Exploring", year: 2025, color: "gray-600", emoji: "🔍", description: "Learning about Christianity" },
  ];

  const handleReligionSelect = (religion: ReligionOption) => {
    // Save to localStorage and navigate to chat
    localStorage.setItem("userBelief", religion.id);
    localStorage.setItem("userBeliefName", religion.name);
    localStorage.setItem("userBeliefEmoji", religion.emoji);
    
    // Navigate to chat
    window.location.assign("/chat");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 md:px-8 md:py-20 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#FAF8F3] via-white to-byzantine-50/30 -z-20" />
        
        {/* Floating Badge */}
        <div className="mb-6 animate-fade-in">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-byzantine-300 text-byzantine-700 px-4 py-2 text-sm">
            ☦ Trace Your Faith to Its Roots
          </Badge>
        </div>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto text-center z-10 mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-orthodox-600 mb-6 leading-tight animate-fade-in">
            Who Is Jesus?
            <span className="block bg-linear-to-r from-byzantine-500 to-orthodox-600 bg-clip-text text-transparent">
              Find the Truth About Christ
            </span>
          </h1>
          <p className="text-lg md:text-xl font-body text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in">
            Discover the unchanged faith preserved from the Apostles to today
          </p>
        </div>

        {/* Comprehensive Church Timeline */}
        <div className="w-full mb-12">
          <ChurchTimeline />
        </div>

        <Button
          onClick={() => document.getElementById("religion-selector")?.scrollIntoView({ behavior: "smooth" })}
          size="lg"
          className="bg-orthodox-600 text-white hover:bg-orthodox-700 transition-all shadow-xl hover:shadow-2xl text-lg px-8 py-6"
        >
          <MessageSquare className="mr-2 h-6 w-6" />
          Discover the Truth
        </Button>
      </section>

      {/* Religion Selector Section */}
      <section id="religion-selector" className="py-20 px-4 md:px-8 bg-linear-to-b from-white to-[#FAF8F3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-orthodox-600 mb-4">
              What{"'"}s Your Background?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your denomination to discover how it differs from the ancient Christian faith
            </p>
          </div>

          {/* Religion Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {religionOptions.map((religion) => (
              <Card
                key={religion.id}
                onClick={() => handleReligionSelect(religion)}
                className="p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-gray-200 hover:border-byzantine-400 hover:bg-byzantine-50/30 group"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{religion.emoji}</div>
                  <h3 className="text-xl font-display font-bold mb-2 text-gray-800 group-hover:text-byzantine-700">
                    {religion.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{religion.description}</p>
                  <Badge variant="outline" className="text-xs mb-3">
                    Est. {religion.year} AD
                  </Badge>
                  <div className="mt-4 flex items-center justify-center text-sm font-semibold text-orthodox-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Start Conversation
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <Alert className="border-l-4 border-orthodox-500 bg-blue-50">
          <AlertCircle className="h-5 w-5 text-orthodox-500" />
          <div className="ml-2">
            <h4 className="font-semibold text-orthodox-600 mb-1">Educational Resource</h4>
            <AlertDescription className="text-gray-700">
              This chatbot provides educational information about Orthodox Christian theology based
              on historical sources. It is not a substitute for pastoral guidance or official church
              teaching. For matters of faith and practice, please consult your local Orthodox
              priest.
            </AlertDescription>
          </div>
        </Alert>
      </section>

      {/* Minimalist Footer */}
      <footer className="bg-orthodox-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Cross className="w-5 h-5" />
            <span className="text-lg font-display font-semibold">Orthodox AI Guide</span>
          </div>
          <p className="text-sm opacity-75 mb-4">
            Exploring Orthodox Christianity through Sacred Tradition
          </p>
          <p className="text-xs opacity-60">
            © 2025 • Educational Resource
          </p>
        </div>
      </footer>
    </div>
  );
}
