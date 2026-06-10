import { ChevronLeftIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import useJarvisStore from "../hooks/use-jarvis-store";
import { focusChatInput } from "./input/chat-input-id";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeInOut" as const },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const SECTIONS = [
  {
    title: "🖥️ Desktop & Browser",
    examples: [
      {
        emoji: "🌐",
        text: "Browse example.com and extract the pricing details — I'll step in if login is needed",
      },
      {
        emoji: "🔎",
        text: "Research three competitors in [your market] and summarize differences in a table",
      },
      {
        emoji: "🛒",
        text: "Search a booking site for flights to [city] and list the cheapest options",
      },
    ],
  },
  {
    title: "📋 Whiteboard & Design",
    examples: [
      {
        emoji: "📱",
        text: "Sketch two separate mobile app pages on the whiteboard — one for login, one for register",
      },
      {
        emoji: "📝",
        text: "Build an interactive form on the whiteboard to collect my project requirements",
      },
      {
        emoji: "📊",
        text: "Create a dashboard chart on the whiteboard for my weekly goals",
      },
    ],
  },
  {
    title: "📁 Files & Memory",
    examples: [
      {
        emoji: "🧠",
        text: "Remember that I prefer brief, direct answers — update my profile",
      },
      {
        emoji: "📂",
        text: "Set up a workspace folder for my [project name] project",
      },
      {
        emoji: "📖",
        text: "Review what's in my workspace and suggest how to organize it",
      },
    ],
  },
  {
    title: "🔍 Search & Research",
    examples: [
      {
        emoji: "📰",
        text: "Search the web for the latest on [topic] and give me a short summary",
      },
      {
        emoji: "🕵️",
        text: "Dig deep into [topic] — use background workers so my chat stays clean",
      },
      {
        emoji: "🔗",
        text: "Summarize this article: [paste URL]",
      },
    ],
  },
  {
    title: "⏰ Automate & Notify",
    examples: [
      {
        emoji: "⏰",
        text: "Every weekday at 9am, review my task list and notify me",
      },
      {
        emoji: "🔔",
        text: "Run [your command] every Sunday and alert me when it finishes",
      },
      {
        emoji: "📋",
        text: "Show me my scheduled jobs and what's coming up next",
      },
    ],
  },
  {
    title: "🎨 Media & Create",
    examples: [
      { emoji: "🖼️", text: "Generate a minimalist app icon for a notes app" },
      { emoji: "🎤", text: "Transcribe the audio file I'll attach" },
      { emoji: "📑", text: "Summarize the key points from this PDF" },
    ],
  },
];

export default function JarvisWelcome() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const setInputText = useJarvisStore((s) => s.setInputText);
  const setInputMode = useJarvisStore((s) => s.setInputMode);

  const fillInput = (text: string) => {
    setInputText(text);
    focusChatInput(setInputMode);
  };

  const section = selectedIndex !== null ? SECTIONS[selectedIndex] : null;

  return (
    <motion.div
      className="flex flex-col gap-8 items-center justify-center px-4 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-2"
      >
        <img src="/favicon.png" alt="Jarvis" className="size-12" />
        <h1 className="text-4xl font-bold bg-linear-to-r from-red-400 via-blue-400 to-emerald-500 dark:from-red-200 dark:via-blue-200 dark:to-green-200 bg-clip-text text-transparent">
          Hi, I'm Jarvis
        </h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {section ? (
          <motion.div
            key={`questions-${selectedIndex}`}
            className="flex flex-col gap-6 items-center w-full max-w-md"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <motion.h2
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-lg font-medium text-muted-foreground"
            >
              {section.title}
            </motion.h2>
            <motion.div
              className="flex flex-col gap-2 w-full"
              variants={staggerContainer}
            >
              {section.examples.map(({ emoji, text }) => (
                <motion.button
                  key={text}
                  variants={staggerItem}
                  type="button"
                  onClick={() => fillInput(text)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 text-sm rounded-lg border border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 transition-colors text-left cursor-pointer"
                >
                  {emoji} {text}
                </motion.button>
              ))}
            </motion.div>
            <motion.button
              variants={staggerItem}
              type="button"
              onClick={() => setSelectedIndex(null)}
              whileHover={{ x: -2 }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="sections"
            className="flex flex-col gap-8 items-center w-full"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <motion.p
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-lg text-muted-foreground"
            >
              How can I help you today?
            </motion.p>
            <motion.div
              className="flex flex-col w-full md:flex-row flex-wrap md:justify-center gap-3 max-w-2xl"
              variants={staggerContainer}
            >
              {SECTIONS.map((sec, index) => (
                <motion.button
                  key={sec.title}
                  variants={staggerItem}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="px-5 py-3 text-sm font-medium rounded-lg border border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  {sec.title}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
