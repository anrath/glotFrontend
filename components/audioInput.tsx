import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic } from "lucide-react";
import { axiosInstance } from "./axios-instance";

interface AudioInputProps {
  onAudioSend: (data: any) => void; // Callback to inform parent component about the message being sent
}

export const AudioInput: React.FC<AudioInputProps> = ({ onAudioSend }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

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

      const response = await axiosInstance.post("/process_audio", formData);
      console.log("Audio sent successfully.", response.data);
      onAudioSend(response.data.data);
    } catch (error) {
      if (axiosInstance.isAxiosError(error)) {
        console.error("Failed to send audio:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={recording ? "outline" : "ghost"} size="icon">
            <a onClick={recording ? stopRecording : startRecording}>
              <Mic className="size-4" />
            </a>
            <span className="sr-only">Use Microphone</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Use Microphone</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AudioInput;
