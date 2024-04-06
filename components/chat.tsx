import React, { useRef, useEffect, useState } from "react";

import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
  CornerDownLeft,
  Mic,
  Paperclip,
  PencilLine,
  Volume2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { Input } from "@/components/ui/input";

export interface ChatMessage {
  user_message: string;
  translated_user_message?: string;
  audio_user_data: string;
  ai_message: string;
  translated_ai_message?: string;
  audio_ai_data: string;
}

export function scrollBottom() {
  const chatMessages = document.querySelector(".scroll-area");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function typeWriter() {
  let i = 0;
  let txt = 'Lorem ipsum typing effect!'; /* The text */
  let speed = 50; /* The speed/duration of the effect in milliseconds */
  if (i < txt.length) {
    document.getElementById("demo").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

export function Chat({ translationsVisible }) {
  /**
    ==============================
    Chat Messages
    ==============================
  */
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      user_message: "Hello, how are you?",
      translated_user_message: "Hola, ¿cómo estás?",
      audio_user_data: "Base64EncodedStringOfAudio", // Simulated as a base64 string
      ai_message: "I'm fine, thank you!",
      translated_ai_message: "Estoy bien, ¡gracias!",
      audio_ai_data: "Base64EncodedStringOfAudio",
    },
    {
      user_message:
        "What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today?",
      translated_user_message: "¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ¿Cómo está el clima hoy? ",
      audio_user_data: "Base64EncodedStringOfAudio",
      ai_message: "It's sunny and warm outside.",
      translated_ai_message: "Está soleado y cálido afuera.",
      audio_ai_data: "Base64EncodedStringOfAudio",
    },
    {
      user_message: "Can you help me with my homework?",
      translated_user_message: "¿Puedes ayudarme con mi tarea?",
      audio_user_data: "Base64EncodedStringOfAudio",
      ai_message: "Sure, what do you need help with?",
      translated_ai_message: "Claro, ¿con qué necesitas ayuda?",
      audio_ai_data: "Base64EncodedStringOfAudio",
    },
    {
      user_message: "Thank you for your assistance.",
      translated_user_message: "Gracias por tu ayuda.",
      audio_user_data: "Base64EncodedStringOfAudio",
      ai_message: "You're welcome!",
      translated_ai_message: "¡De nada!",
      audio_ai_data: "Base64EncodedStringOfAudio",
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
      const response = await axios.post("/edit_last_message", {
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

  useEffect(() => {
    if (lastAudioRef.current) {
      lastAudioRef.current
        .play()
        .catch((error) => console.error("Audio playback error:", error));
    }
  }, [messages]);

  /**
    ==============================
    New Message Form
    ==============================
  */
  const [newMessage, setNewMessage] = useState("");

  const handleSubmitNewMessage = (event) => {
    if (!newMessage.trim()) {
      return; // Prevent submitting empty messages
    }
    event.preventDefault(); // Prevent the default form submit action
    console.log("Form submitted with message:", newMessage); // Log the current message state
    setNewMessage(""); // Clear the message input field
    scrollBottom();
    typeWriter();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Check for Enter key without Shift
      event.preventDefault(); // Prevent adding a new line
      handleSubmitNewMessage(event); // Submit the form with the current message
    }
  };

  function typeWriter(): void {
    const speed: number = 50;                         // Speed of the effect in milliseconds
  
    // Retrieve the last '.ai-message' element on the page
    const nodes: NodeList | null = document.querySelectorAll('.ai-message')
  
    if (!nodes) {
      console.error('No element found with the class .ai-message');
      return;
    }
    const lastMessage = nodes[nodes.length- 1];

    const txt: string = lastMessage.innerText; // Text to write
    let i: number = 0; // Current position in the text
    lastMessage.innerHTML = ''; // Clear the text
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
                          audioRef={
                            index === messages.length - 1
                              ? lastAudioRef
                              : undefined
                          }
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
                        <form className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring" onSubmit={handleSave}>
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
                      msg.user_message
                    )}
                  </div>
                  <p className={`translated-message ${translationsVisible ? "block" : "hidden"}`}>
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
                        />
                      )}
                    </div>
                  </div>
                  <p className="ai-message mb-1">{msg.ai_message}</p>
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

const AudioPlayer = ({ audioData, audioRef }) => {
  const internalAudioRef = useRef(null);
  const ref = audioRef || internalAudioRef;

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
