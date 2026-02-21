import { ChevronLeftIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { api } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const SECTIONS = [
  {
    title: "🔍 Search & Research",
    examples: [
      { emoji: "🌤️", text: "What's the weather like today?" },
      { emoji: "🔎", text: "Search the web for the latest tech news" },
      { emoji: "📰", text: "Find recent updates on AI and LLMs" },
    ],
  },
  {
    title: "✨ Create & Analyze",
    examples: [
      { emoji: "📐", text: "Help me plan a simple project structure" },
      { emoji: "🐍", text: "Write a short Python script to parse JSON" },
      { emoji: "📊", text: "Generate a summary of the workspace files" },
    ],
  },
  {
    title: "📋 Organize & Execute",
    examples: [
      {
        emoji: "📂",
        text: "List what's in my workspace and suggest improvements",
      },
      { emoji: "⏰", text: "Create a daily reminder to check the weather" },
      { emoji: "📝", text: "Help me organize my notes in the data folder" },
    ],
  },
  {
    title: "📁 File & Workspace",
    examples: [
      { emoji: "📖", text: "Read and summarize the README in my project" },
      { emoji: "📁", text: "Create a new directory and add a config file" },
      { emoji: "📂", text: "Show me the contents of the output folder" },
    ],
  },
  {
    title: "💡 Learn & Explore",
    examples: [
      { emoji: "🎓", text: "Explain how the skills system works" },
      { emoji: "🛠️", text: "What tools do you have access to?" },
      { emoji: "🚀", text: "Help me get started with this workspace" },
    ],
  },
];

export default function JarvisWelcome() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const sendMessage = (text: string) => {
    api.jarvis["user-message"].post({ content: text });
  };

  const section = selectedIndex !== null ? SECTIONS[selectedIndex] : null;

  return (
    <motion.div
      className="flex flex-col gap-8 items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        variants={fadeUp}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-4xl font-bold bg-linear-to-r from-cyan-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
      >
        ✨ Hi, I'm Jarvis
      </motion.h1>
      <AnimatePresence mode="wait">
        {!section && (
          <motion.p
            key="subtitle"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="text-lg text-muted-foreground"
          >
            How can I help you today?
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {section ? (
          <motion.div
            key="questions"
            className="flex flex-col gap-6 items-center w-full max-w-md"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <motion.h2
              variants={staggerItem}
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
                  onClick={() => sendMessage(text)}
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
            className="flex flex-wrap justify-center gap-3 max-w-2xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
