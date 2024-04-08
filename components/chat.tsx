import React, { useRef, useEffect, useState } from "react";

import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { CornerDownLeft, Mic, PencilLine, Volume2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { axiosInstance } from "@/components/axios-instance";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface ChatMessage {
  user_message: string;
  translated_user_message: string;
  audio_user_data: string;
  ai_message: string;
  translated_ai_message: string;
  audio_ai_data: string;
  wiki_user_data?: string;
  wiki_ai_data?: string;
}

// export interface WikiData {
//   wiki_user_data?: Array<any>;
//   wiki_ai_data?: Array<any>;
// }

export function scrollBottom() {
  const chatMessages = document.querySelector(".scroll-area");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function Chat({ translationsVisible }) {
  /**
    ==============================
    Chat Messages
    ==============================
  */
  // const [messages, setMessages] = useState<ChatMessage[]>([]);
  // const [wikiData, setWikiData] = useState<WikiData[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      user_message: "Hello, how are you?",
      translated_user_message: "Hola, ¿cómo estás?",
      audio_user_data: "Base64EncodedStringOfAudio",
      ai_message: "I'm fine, thank you!",
      translated_ai_message: "Estoy bien, ¡gracias!",
      audio_ai_data: "Base64EncodedStringOfAudio",
    },
  ]);

  const [wikiData, setWikiData] = useState([
    {
      // Hello, how are you?
      wiki_user_data: {
        Hello: {
          partOfSpeech: "Interjection",
          definition: ["A greeting", "A greeting"],
        },

        how: {
          partOfSpeech: "Adverb",
          definition: ["In what way", "In what way"],
        },

        are: {
          partOfSpeech: "Verb",
          definition: [
            "Second-person singular simple present indicative of be",
            "Second-person singular simple present indicative of be",
          ],
        },

        you: {
          partOfSpeech: "Pronoun",
          definition: [
            "The person being addressed",
            "The person being addressed",
          ],
        },
      },
      // I'm fine, thank you!
      wiki_ai_data: {
        "I'm": {
          partOfSpeech: "Noun",
          definition: ["A contraction of I am", "A contraction of I am"],
        },
        fine: {
          partOfSpeech: "Adjective",
          definition: ["Of superior quality", "Of superior quality"],
        },
        thank: {
          partOfSpeech: "Verb",
          definition: ["To express gratitude", "To express gratitude"],
        },
        you: {
          partOfSpeech: "Pronoun",
          definition: [
            "The person being addressed",
            "The person being addressed",
          ],
        },
      },
    },
  ]);

  /**
    ==============================
    Edits
    ==============================
  */
  const [isEditing, setIsEditing] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [editedMessage, setEditedMessage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEdit = (message, index) => {
    setIsEditing(true);
    setLastMessage(message.user_message);
    setEditedMessage(message.user_message);
    setEditingIndex(index);
  };

  const updateLastMessage = (updatedMessageData: ChatMessage) => {
    setMessages((prevMessages) => [
      ...prevMessages.slice(0, -1),
      updatedMessageData,
    ]);
  };

  const handleSave = async () => {
    if (editedMessage === lastMessage) {
      setIsEditing(false);
      setEditingIndex(null);
      return;
    }

    try {
      const response = await axiosInstance.post("/edit_last_message", {
        message: editedMessage,
      });
      console.log("Updated message:", response.data);
      updateLastMessage(response.data);
      setIsEditing(false);
      setEditingIndex(null);
      scrollBottom();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingIndex(null);
  };

  /**
    ==============================
    Audio Playback
    ==============================
  */
  const lastAudioRef = useRef(null);

  /**
    ==============================
    New Message Form
    ==============================
  */
  const [newMessage, setNewMessage] = useState("");

  const handleSubmitNewMessage = async (event) => {
    if (!newMessage.trim()) {
      return; // Prevent submitting empty messages
    }
    event.preventDefault(); // Prevent the default form submit action

    try {
      // const response = {data:    {
      //   user_message: "Hello, how are you?",
      //   translated_user_message: "Hola, ¿cómo estás?",
      //   audio_user_data: "Base64EncodedStringOfAudio", // Simulated as a base64 string
      //   ai_message: "I'm fine, thank you!",
      //   translated_ai_message: "Estoy bien, ¡gracias!",
      //   audio_ai_data: "Base64EncodedStringOfAudio",
      // },}
      const response = await axiosInstance.post("/send_message", {
        message: newMessage,
      });
      console.log("New message sent:", response.data);

      // Generate a unique ID for the new message, e.g., timestamp or UUID
      const messageId = Date.now();

      // Update messages without wiki data
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: messageId, ...response.data },
      ]);

      // Clear the message input field
      setNewMessage("");
      scrollBottom();

      setTimeout(typeWriter, 100);

      // Function to fetch wiki data asynchronously
      const fetchWikiData = async (sentence, type, id) => {
        try {
          const result = await axiosInstance.post("/get_wiki_data", {
            sentence: sentence,
            language: "spanish",
          });
          console.log(type === "user" ? "wiki user:" : "wiki ai:", result.data);
          return { id, data: result.data, type };
        } catch (error) {
          console.error(`Error fetching wiki data for ${type}:`, error);
          return { id, data: `Failed to load data for ${type}`, type }; // Fallback text in case of error
        }
      };

      // Asynchronously update wiki data without blocking UI updates
      const userWikiPromise = fetchWikiData(newMessage, "user", messageId);
      const aiWikiPromise = fetchWikiData(
        response.data.ai_message,
        "ai",
        messageId
      );

      Promise.all([userWikiPromise, aiWikiPromise]).then((results) => {
        results.forEach(({ id, data, type }) => {
          setWikiData((prevData) => {
            const newData = [...prevData];
            const index = newData.findIndex((item) => item.id === id);
            if (index !== -1) {
              const item = newData[index];
              if (type === "user") {
                item.wiki_user_data = data;
              } else {
                item.wiki_ai_data = data;
              }
            } else {
              newData.push(
                type === "user"
                  ? { id, wiki_user_data: data }
                  : { id, wiki_ai_data: data }
              );
            }
            return newData;
          });
        });
      });
    } catch (error) {
      console.error("Error sending initial message:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Check for Enter key without Shift
      event.preventDefault(); // Prevent adding a new line
      handleSubmitNewMessage(event); // Submit the form with the current message
    }
  };

  function typeWriter(): void {
    const speed: number = 50; // Speed of the effect in milliseconds

    // Retrieve the last '.ai-message' element on the page
    const nodes: NodeList | null = document.querySelectorAll(".ai-message");

    if (!nodes) {
      console.error("No element found with the class .ai-message");
      return;
    }
    const lastMessage = nodes[nodes.length - 1];

    const txt: string = lastMessage.innerText; // Text to write
    let i: number = 0; // Current position in the text
    lastMessage.innerHTML = ""; // Clear the text
    // Function to write text one character at a time
    const animateText = () => {
      if (i < txt.length) {
        lastMessage.innerHTML += txt.charAt(i);
        i++;
        setTimeout(animateText, speed);
      }
    };

    animateText();
  }

  return (
    <div className="chat-messages">
      <div className="flex flex-col space-y-4 mb-16">
        {messages.map((msg, index) => (
          <div key={index} className="message-pair space-y-4">
            <div className="flex items-start space-x-2">
              <Avatar>
                <AvatarImage
                  alt="User"
                  src="/placeholder.svg?height=40&width=40"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="message rounded-t-lg rounded-br-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span>
                      <strong>You</strong>
                    </span>
                    <div className="ml-2">
                      {msg.audio_user_data && (
                        <AudioPlayer
                          audioData={msg.audio_user_data}
                          audioRef={null}
                          autoPlay={false}
                        />
                      )}
                    </div>
                    <div className="ml-2 mr-auto">
                      {isEditing ? (
                        editingIndex === index ? (
                          // Button to cancel the edit
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cancel Edit</span>
                          </Button>
                        ) : (
                          // Button disabled while another item is being edited
                          <Button
                            disabled
                            size="icon"
                            className="h-8 w-8 bg-background"
                            onClick={() => handleEdit(msg, index)}
                            // style={{ background: "not-allowed" }}
                          >
                            <PencilLine className="h-4 w-4" />
                            <span className="sr-only">Edit Message</span>
                          </Button>
                        )
                      ) : (
                        // Button to start editing
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(msg, index)}
                        >
                          <PencilLine className="h-4 w-4" />
                          <span className="sr-only">Edit Message</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mb-1">
                    {isEditing && editingIndex === index ? (
                      <>
                        <form
                          className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                          onSubmit={handleSave}
                        >
                          <Label htmlFor="editMessage" className="sr-only">
                            Edit Message
                          </Label>
                          <Textarea
                            id="message"
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                // Check for Enter key without Shift
                                event.preventDefault(); // Prevent adding a new line
                                handleSave(); // Submit the form with the current message
                              }
                            }}
                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                          />
                          <div className="flex items-center p-3 pt-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Mic className="size-4" />
                                    <span className="sr-only">
                                      Use Microphone
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Use Microphone
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              type="submit"
                              size="sm"
                              className="ml-auto gap-1.5"
                            >
                              Send Message
                              <CornerDownLeft className="size-3.5" />
                            </Button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <SplitMessageComponent
                        message={msg.user_message}
                        wikiData={wikiData}
                        chatId={index}
                        dataType={"user"}
                      />
                    )}
                  </div>
                  <p
                    className={`translated-message ${
                      translationsVisible ? "block" : "hidden"
                    }`}
                  >
                    {msg.translated_user_message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2 justify-end">
              <div className="flex-1">
                <div className="message rounded-t-lg rounded-bl-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span>
                      <strong>Glot</strong>
                    </span>
                    <div className="ml-2 mr-auto">
                      {msg.audio_ai_data && (
                        <AudioPlayer
                          audioData={msg.audio_ai_data}
                          audioRef={
                            index === messages.length - 1
                              ? lastAudioRef
                              : undefined
                          }
                          autoPlay={index === messages.length - 1}
                        />
                      )}
                    </div>{" "}
                  </div>
                  <SplitMessageComponent
                    message={msg.ai_message}
                    wikiData={wikiData}
                    chatId={index}
                    dataType={"ai"}
                  />
                  {/* {msg.ai_message_split.map((word, index) => (
                    <HoverCard key={index} className="ai-message mb-1">
                      <HoverCardTrigger>{word}</HoverCardTrigger>
                      {wikiData[index][word] && (
                        <HoverCardContent>
                          <div key={word}>
                            <h3>{word}</h3>
                            <p>
                              <strong>Part of Speech:</strong>{" "}
                              {wikiData[index][word].partOfSpeech}
                            </p>
                            <p>
                              <strong>Definition:</strong>{" "}
                              {wikiData[index][word].definition}
                            </p>
                          </div>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ))} */}
                  {/* <p className="ai-message mb-1">{msg.ai_message}</p> */}
                  <p className="translated-message">
                    {msg.translated_ai_message}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-1">
                <Avatar>
                  <AvatarImage
                    alt="Glot"
                    src="/placeholder.svg?height=40&width=40"
                  />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="sticky bottom-12">
        <form
          onSubmit={handleSubmitNewMessage}
          className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Textarea
            id="message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Mic className="size-4" />
                    <span className="sr-only">Use Microphone</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Use Microphone</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button type="submit" size="sm" className="ml-auto gap-1.5">
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface WikiDataEntry {
  partOfSpeech: string;
  definition: string[];
}

interface Props {
  aiMessage: string;
  wikiData: Record<number, Record<string, WikiDataEntry>>;
}

const SplitMessageComponent: React.FC<Props> = ({
  message,
  wikiData,
  chatId,
  dataType,
}) => {
  const words = message.split(/(\s+|[.?!,:;¡¿])/).map((word, index) => {
    if (/\s+|[.?!,:;]/.test(word)) {
      return <>{word}</>;
    } else {
      // Otherwise, return the HoverCard component.
      const subset = dataType === "user" ? "wiki_user_data" : "wiki_ai_data";
      const data = wikiData[chatId][subset]?.[word];
      console.log("data", data);
      return (
        <HoverCard key={index} className="mb-1 ">
          <HoverCardTrigger className="word hover:bg-primary">{word}</HoverCardTrigger>
          {data && (
            <HoverCardContent>
              <div key={word}>
                <h3>{word}</h3>
                <p>
                  <strong>Part of Speech:</strong> {data.partOfSpeech}
                </p>
                <p>
                  <strong>Definitions:</strong>
                  <ul className="list-decimal ml-2">
                    {data.definition.map((definition, idx) => (
                      <li key={idx}>{definition}</li>
                    ))}
                  </ul>
                </p>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      );
    }
  });

  return <span className="ai-message">{words}</span>;
};

const AudioPlayer = ({ audioData, audioRef, autoPlay = false }) => {
  const internalAudioRef = useRef(null);
  const ref = audioRef || internalAudioRef;

  useEffect(() => {
    // Automatically play audio if autoPlay is true
    if (autoPlay && ref.current) {
      ref.current
        .play()
        .catch((error) => console.error("Auto-play error:", error));
    }
  }, [audioData, autoPlay, ref]);

  const togglePlay = () => {
    if (ref.current) {
      if (ref.current.paused) {
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }
  };

  return (
    <span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 color-btn"
        onClick={togglePlay}
      >
        <Volume2 className="h-4 w-4" />
        <span className="sr-only">Play Audio</span>
      </Button>
      <audio ref={ref} style={{ display: "none" }}>
        <source src={`data:audio/mp3;base64,${audioData}`} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </span>
  );
};
