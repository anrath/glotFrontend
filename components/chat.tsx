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
  ai_message: string;
  translated_ai_message?: string;
  audio_data: string;
}

export function Chat() {
  const [isEditing, setIsEditing] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [editedMessage, setEditedMessage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [translationsVisble, setTranslationsVisible] = useState(true);
  const lastAudioRef = useRef(null); // Reference for the audio element of the last message

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      user_message: "Hello, how are you?",
      translated_user_message: "Hola, ¿cómo estás?",
      audio_data: "Base64EncodedStringOfAudio", // Simulated as a base64 string
      ai_message: "I'm fine, thank you!",
      translated_ai_message: "Estoy bien, ¡gracias!",
    },
    {
      user_message:
        "What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today? What is the weather like today?",
      translated_user_message: "¿Cómo está el clima hoy?",
      audio_data: "Base64EncodedStringOfAudio",
      ai_message: "It's sunny and warm outside.",
      translated_ai_message: "Está soleado y cálido afuera.",
    },
    {
      user_message: "Can you help me with my homework?",
      translated_user_message: "¿Puedes ayudarme con mi tarea?",
      audio_data: "Base64EncodedStringOfAudio",
      ai_message: "Sure, what do you need help with?",
      translated_ai_message: "Claro, ¿con qué necesitas ayuda?",
    },
    {
      user_message: "Thank you for your assistance.",
      translated_user_message: "Gracias por tu ayuda.",
      audio_data: "Base64EncodedStringOfAudio",
      ai_message: "You're welcome!",
      translated_ai_message: "¡De nada!",
    },
  ]);

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
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingIndex(null);
  };

  // Automatically play the audio of the last message if it exists
  useEffect(() => {
    if (lastAudioRef.current) {
      lastAudioRef.current
        .play()
        .catch((error) => console.error("Audio playback error:", error));
    }
  }, [messages]); // This effect depends on the messages array

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
                            className="h-8 w-8"
                            onClick={() => handleEdit(msg, index)}
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
                  <p className="mb-1">
                    {isEditing && editingIndex === index ? (
                      <>
                        <form className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                          <Label htmlFor="editMessage" className="sr-only">
                            Edit Message
                          </Label>
                          <Textarea
                            id="message"
                            value={editedMessage}
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
                  </p>
                  <p className="translated-message">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 color-btn"
                        onClick={console.log("clicked")}
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="sr-only">Edit Message</span>
                      </Button>
                    </div>
                  </div>
                  <p className="mb-1">{msg.ai_message}</p>
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
      <div className="sticky bottom-10">
        <form className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Textarea
            id="message"
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
