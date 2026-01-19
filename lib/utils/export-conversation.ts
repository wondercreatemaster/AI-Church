/**
 * Utilities for exporting conversations in different formats
 */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id?: string;
  title?: string;
  stage?: string;
  userBelief?: string;
  createdAt?: Date;
}

/**
 * Export conversation as human-readable text
 */
export function exportConversationAsText(
  messages: Message[],
  conversation?: Conversation
): string {
  const lines: string[] = [];

  // Add header
  if (conversation?.title) {
    lines.push(`Conversation: ${conversation.title}`);
  } else {
    lines.push("Orthodox Chatbot Conversation");
  }

  lines.push(`Exported: ${new Date().toLocaleString()}`);
  
  if (conversation?.stage) {
    const stageNames: Record<string, string> = {
      A: "Getting to Know You",
      B: "Understanding Differences",
      C: "Exploring Together",
      D: "Next Steps",
    };
    lines.push(`Stage: ${stageNames[conversation.stage] || conversation.stage}`);
  }

  if (conversation?.userBelief) {
    lines.push(`Background: ${conversation.userBelief}`);
  }

  lines.push("");
  lines.push("=" .repeat(60));
  lines.push("");

  // Add messages
  messages.forEach((message, index) => {
    const time = message.timestamp instanceof Date
      ? message.timestamp.toLocaleTimeString()
      : new Date(message.timestamp).toLocaleTimeString();
    
    const role = message.role === "user" ? "You" : "Assistant";
    
    lines.push(`${role} (${time}):`);
    lines.push(message.content);
    
    if (index < messages.length - 1) {
      lines.push("");
      lines.push("-".repeat(60));
      lines.push("");
    }
  });

  return lines.join("\n");
}

/**
 * Export conversation as JSON
 */
export function exportConversationAsJSON(
  messages: Message[],
  conversation?: Conversation
): string {
  const exportData = {
    conversation: {
      id: conversation?.id || null,
      title: conversation?.title || "Untitled Conversation",
      stage: conversation?.stage || null,
      userBelief: conversation?.userBelief || null,
      createdAt: conversation?.createdAt || null,
      exportedAt: new Date().toISOString(),
    },
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date
        ? msg.timestamp.toISOString()
        : new Date(msg.timestamp).toISOString(),
    })),
    metadata: {
      messageCount: messages.length,
      exportVersion: "1.0",
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download file to user's computer
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename by removing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-. ]/gi, "_")
    .replace(/\s+/g, "_")
    .substring(0, 100); // Limit length
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  conversationTitle?: string,
  extension: string = "txt"
): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  
  const title = conversationTitle
    ? sanitizeFilename(conversationTitle)
    : "conversation";
  
  return `${title}_${dateStr}_${timeStr}.${extension}`;
}

