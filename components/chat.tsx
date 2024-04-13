import React, { useRef, useEffect, useState } from "react";

import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
  CornerDownLeft,
  PencilLine,
  Volume2,
  X,
  Loader2,
  CirclePause,
  Pause,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/components/axios-instance";
import { SplitMessageComponent } from "@/components/split-wiki";
import { MicrophoneComponent } from "@/components/testInput";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic } from "lucide-react";

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

// interface AudioInputProps {
//   onMessageSend: (data: any) => void; // Callback to inform parent component about the message being sent
// }

// export interface WikiData {
//   wiki_user_data?: Array<any>;
//   wiki_ai_data?: Array<any>;
// }

export function scrollBottom() {
  const chatMessages = document.querySelector(".scroll-area");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function Chat({ translationsVisible }) {
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isWaitingBackend, setIsWaitingBackend] = useState(false);

  useEffect(() => {
    // Check for MediaRecorder API support
    if (!window.MediaRecorder) {
      alert("MediaRecorder not supported by this browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          setAudioChunks((currentChunks) => [...currentChunks, event.data]);
        };
      })
      .catch((err) => console.error("Error accessing media devices:", err));
  }, []);

  useEffect(() => {
    if (!recording && audioChunks.length > 0) {
      sendAudioToBackend();
    }
    // This effect depends on `recording` and `audioChunks` changes
  }, [recording, audioChunks]);

  const startRecording = () => {
    console.log("Recording started.");
    if (!mediaRecorder) return;
    setAudioChunks([]);
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    // Set recording to false first to ensure useEffect triggers after all chunks are added
    setRecording(false);
    mediaRecorder.onstop = () => {
      // Handler setup before stopping, actual sending handled by useEffect
      console.log("Recording stopped.");
    };
    mediaRecorder.stop();
  };

  const sendAudioToBackend = async (): Promise<void> => {
    try {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob);

      setIsWaitingBackend(true);
      const response = await axiosInstance.post("/process_audio", formData);
      console.log("Audio sent successfully.", response.data);
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

      // onAudioSend(response.data.data);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
    setIsWaitingBackend(false);
  };

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
      setIsWaitingBackend(true);
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
    setIsWaitingBackend(false);
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

  const fetchWikiData = async (user_message, ai_message) => {
    // Substitute with actual data fetching logic
    const response = await axiosInstance.post("/get_wiki_data", {
      user_message: user_message,
      ai_message: ai_message,
      language: "spanish",
    });
    return response.data;
  };

  const isMessagesMounted = useRef(false); // This ref tracks the mount status
  const [wikiMessageLength, setWikiMessageLength] = useState(2);

  useEffect(() => {
    if (!isMessagesMounted.current) {
      // Skip the effect on initial render
      // TODO == doesn't work
      isMessagesMounted.current = true;
      return;
    }

    if (messages.length === wikiMessageLength) {
      return; // Skip the effect if there are no messages
    }

    const lastUserMessage = messages[messages.length - 1].user_message;
    const lastAiMessage = messages[messages.length - 1].ai_message;
    fetchWikiData(lastUserMessage, lastAiMessage).then((data) => {
      if (data) {
        console.log("Wiki data fetched:", data);
        setWikiData((prevData) => [...prevData, data]);
      }
    });
    setWikiMessageLength(messages.length);
  }, [messages]);

  const handleSubmitNewMessage = async (event) => {
    if (!newMessage.trim()) {
      return; // Prevent submitting empty messages
    }
    event.preventDefault(); // Prevent the default form submit action

    try {
      setIsWaitingBackend(true);
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
    } catch (error) {
      console.error("Error sending initial message:", error);
    }
    setIsWaitingBackend(false);
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
                            {/* <AudioInput onAudioSend={onMessageSend} /> */}
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
                        chatIndex={index}
                        dataType={"user"}
                        lastElement={index === messages.length - 1}
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
                    chatIndex={index}
                    dataType={"ai"}
                    lastElement={index === messages.length - 1}
                  />
                  <p
                    className={`translated-message ${
                      translationsVisible ? "block" : "hidden"
                    }`}
                  >
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
        {/* <MicrophoneComponent /> */}
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
            {/* AudioInput */}
            {isWaitingBackend ? (
              <Button
                disabled
                type="button"
                variant={recording ? "outline" : "ghost"}
                size="icon"
              >
                <Loader2 className="mr-2 size-4 animate-spin" />
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={recording ? "destructive" : "ghost"}
                      size="icon"
                      onClick={recording ? stopRecording : startRecording}
                    >
                      {recording ? (
                        <>
                          <Pause className="size-4" />
                          <span className="sr-only">Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="size-4" />
                          <span className="sr-only">Use Microphone</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Use Microphone</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isWaitingBackend ? (
              <Button disabled className="ml-auto gap-1.5">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

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
