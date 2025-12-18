// src/pages/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Add this import
import { Button } from "../components/ui/button";
import { generateChatResponse } from "../services/chatbotAI";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  MessageCircle,
  Sparkles,
  Target,
  Scale,
  Activity,
} from "lucide-react";

const Chatbot = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: getPersonalizedGreeting(user),
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Personalized greeting based on user data
  // Personalized greeting based on user data
  function getPersonalizedGreeting(user) {
    if (!user) {
      return "Hi! I'm your Dietly AI Coach. I can help you with nutrition advice, meal planning, weight management, and healthy eating tips. What would you like to know?";
    }

    const name = user.name?.split(" ")[0] || "there";
    const goal = user.healthGoal || "maintain";
    const currentWeight = user.currentWeight;
    const targetWeight = user.targetWeight;

    let goalText = "";
    if (currentWeight && targetWeight) {
      const diff = Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10; // Round to 1 decimal
      if (goal === "lose") {
        goalText = ` I see you're working on losing ${diff}kg (from ${currentWeight}kg to ${targetWeight}kg).`;
      } else if (goal === "gain") {
        goalText = ` I see you're working on gaining ${diff}kg (from ${currentWeight}kg to ${targetWeight}kg).`;
      } else {
        goalText = ` I see you want to maintain your weight around ${currentWeight}kg.`;
      }
    } else if (currentWeight) {
      goalText = ` I see your current weight is ${currentWeight}kg.`;
    }

    // More natural greeting variations
    const greetings = [
      `Hi ${name}! I'm your Dietly AI Coach.${goalText} I'm here to help you reach your fitness goals with personalized nutrition advice. What would you like to know?`,
      `Hello ${name}! I'm your Dietly AI Coach.${goalText} How can I assist you with your nutrition journey today?`,
      `Welcome back ${name}! I'm your Dietly AI Coach.${goalText} What can I help you with today?`,
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, hasMounted]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessageText = inputMessage.trim();

    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Pass user data to the AI service
      const botResponse = await generateChatResponse(
        userMessageText,
        messages,
        user
      );

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again later!",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Personalized quick questions based on user goals
  const getQuickQuestions = () => {
    const goal = user?.healthGoal;

    const baseQuestions = [
      "How can I lose weight healthily?",
      "What are good protein sources?",
      "Meal prep ideas for beginners",
      "How to count calories?",
      "Best foods for energy",
      "Healthy snack options",
    ];

    if (goal === "lose") {
      return [
        "Best exercises for weight loss",
        "Low-calorie meal ideas",
        "How to control cravings",
        "Cardio vs strength training for fat loss",
        "Healthy breakfast for weight loss",
        "How much water should I drink?",
      ];
    } else if (goal === "gain") {
      return [
        "High-calorie healthy foods",
        "Best protein sources for muscle",
        "Post-workout meal ideas",
        "How to increase appetite",
        "Mass gainer shake recipes",
        "Strength training tips",
      ];
    }

    return baseQuestions;
  };

  const quickQuestions = getQuickQuestions();

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: getPersonalizedGreeting(user),
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  };

  // User profile summary component
  const UserProfileSummary = () => {
    if (!user) return null;

    return (
      <div className="bg-gradient-to-r from-[#246608]/10 to-[#2F7A0A]/10 rounded-lg p-4 mb-6 border border-[#246608]/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#246608] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {user.healthGoal || "maintain"} weight goal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-700">
            {user.currentWeight && (
              <div className="flex items-center gap-1">
                <Scale className="w-4 h-4 text-[#246608]" />
                <span>{user.currentWeight}kg</span>
              </div>
            )}
            {user.targetWeight && (
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-[#246608]" />
                <span>{user.targetWeight}kg</span>
              </div>
            )}
            {user.activityLevel && (
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-[#246608]" />
                <span className="capitalize">{user.activityLevel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dietary preferences */}
        {(user.dietaryPreferences?.length > 0 ||
          user.allergies?.length > 0) && (
          <div className="mt-3 pt-3 border-t border-[#246608]/10">
            <div className="flex flex-wrap gap-2">
              {user.dietaryPreferences?.map((pref) => (
                <span
                  key={pref}
                  className="px-2 py-1 bg-[#246608] text-white text-xs rounded-full capitalize"
                >
                  {pref}
                </span>
              ))}
              {user.allergies?.map((allergy) => (
                <span
                  key={allergy}
                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full capitalize"
                >
                  {allergy} free
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#246608] to-[#2F7A0A] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Dietly AI Coach
                  </h1>
                  <p className="text-sm text-gray-600">
                    {user
                      ? `Personalized for ${user.name?.split(" ")[0]}`
                      : "Powered by Gemini AI"}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={clearChat}
              className="border-[#246608] text-[#246608] hover:bg-[#246608]/10"
            >
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* User Profile Summary - Show only when user data exists */}
            {user && <UserProfileSummary />}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.isBot
                      ? "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
                      : "bg-gradient-to-r from-[#246608] to-[#2F7A0A] text-white rounded-tr-none"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.isBot ? (
                      <>
                        <Bot className="w-4 h-4 text-[#246608]" />
                        <span className="text-sm font-semibold text-[#246608]">
                          AI Coach
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-white/80" />
                        <span className="text-sm font-semibold text-white/90">
                          You
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {message.text}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.isBot ? "text-gray-500" : "text-white/70"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[80%] border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-[#246608]" />
                    <span className="text-sm font-semibold text-[#246608]">
                      AI Coach
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Show only when few messages */}
          {messages.length <= 2 && (
            <div className="px-6 pb-4">
              <div className="text-sm text-gray-600 mb-3 font-medium">
                Try asking:
              </div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors border border-gray-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about nutrition, diets, meal plans, exercise..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent text-base shadow-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="lg"
                className="px-6 bg-gradient-to-r from-[#246608] to-[#2F7A0A] hover:from-[#1a4a06] hover:to-[#246608] text-white font-semibold"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-3 text-center">
              Dietly AI Coach • Powered by Gemini AI • Personalized for your
              goals
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
