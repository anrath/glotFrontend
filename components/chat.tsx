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
  pronunciation?: any;
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

export function Chat({ translationsVisible, speed }) {
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
      audio_user_data:
        "k05VTVBZAQB2AHsnZGVzY3InOiAnfHUxJywgJ2ZvcnRyYW5fb3JkZXInOiBGYWxzZSwgJ3NoYXBlJzogKDMyNjQsKSwgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAr/80TEABIYeXwAYwxIXLXnXlp8PozGZELZ4vcjRKx4xONxalh0CYREIcMmTJkwBBYWMmnzRsE2f/5o2A3fSYfmjLvpMmgsLBswafNGfzJk0aNGjbrDSjSkIPJI/J6SrP3/80TEChEAkhgAwMZMQMIDi9FfhaF78EU04ILDAYD1ZDQT0sPk4PkPidy31HLpR1PwGUdDMccHATKOh/PxBTsUULrD5Qa+GAJKaoRNZDj/yuP1rGVPnhNc7QY2Mcc8+Zb/80TEGRcJhiABWRgBHknKZlCZQAHpDQyOwkz08yI4XLCMjMi+FwtfP6xEY2lRtKSXiaS+kP+4n0a1n83xSP6DM0w3/k93v4DG0jvkxdI7U9U8wtGEbIPYCjgq9UFYIPb/80TEDxWrKngBjWgAwyjBlz/L5EC4HP/Jo5x4kMcn/4yHLhLEov//Lo8y4kYMaf//rc0z5gyP///6akkFoGp9E+aK/////0Tcvm5Ll83LiajdRPL6sP9fmZxlZkgul0H/80TECxRpOqwB2GAA5GJjBDpoDYahbvXH/p7uHcqe3jM1nv768vbfptGzsw+q0oigCBQblYi2me0stO/Rt/dpW+MYtv+rXv//vpcixttSq1XfV0VLrNAHXZBRRGoCGUD/80TEDBVxOrAAnR5wGCxkDqcxDYDBk6xnTM08t3z/t657/w1q+PfsKhJ+E4yuvaATeDH9NIlnh2xlvMhX+mcQ3GrG26MsxY1n//01rtlXVPlTuK4dOaFfYvBLCjnlG5j/80TECROhNrgAjhJwBdB9UHInbWtPsw/P//dLJZ///FCWMV/cG/4+ywjJ5kIIgiB4BBIwmhgTGWLjFZGFBIZWRNubF0Cwnpt9d+Y///29X9v+pfwkWCgtazNJMLnAqgL/80TEDRWZyqwAo1qUCbqdQG8SjrYTcZXx2Bwq6BiNnxBx3XL6zMaAKOjZMzHmC6m6mJ40Ba0TpukgaC1femh9M2/PfdX0zb+d0/hjsqQttmW4eytqw8r1lAEuHEmtEoD/80TECRRZOrgAlN5wiYFrgKlQM7joD4SqrTTHl+YPH+v/eEwxc+8NnUMX9jOc5RvI67AnDQRLVF3KxuSoNJVZiPHsZ7ooAAdcUAVaCtYrpGWed//9NfWXwCjNHdAd4Vf/80TEChG5MsAAbhhwl+YFy+4+7JrXealFFLuf+sLWfMy27WcoxR6aMOHZ7WxwJBZD53Va9YvdZZbXoSW3xrzQUFQIHnW/////0us3FpDCxux0ZcBeRYlYQwTEolR0bM3/80TEFg+ZLrwAkxJwI9b232HvyFyWarJ1sbzYS3UooiYfJxUxI8kk0xJDBRPXK0swYuM0JTX/1dS3CJS6zfTnSoS6e3JAJ69ZZ3rOoYuoEV9WsTOLSlmSlXlcbnXjjM3/80TEKhHZNrgAw9JwUiEhkjJSJdVmpI4oYRg9FirD5Cxpiv////////0q/+rAB9CIViGmIAML2y5DxBkKLlDeMCFW7yPFpqBG9tecyNdo2cn6+KTImAwhcEiV78p53fX/80TENRFZJqQAw8xwZGhEScLf/////Q3s/6+xIrXO2sCaQR5QyYCHKmiTLihNM4tMpWR3NXb6/vUpDjFLmd2fvqh7KV/////9v///n0kZ7feu4Rr6E5KVq+gQQQzAP/j/80TEQhG6wqQAeIS5AAfgDkZYpByjm0ZNv//z//pqi/////////r//b97dXolFGKU1h5THQXHGBTnVGGmaQPBgsMGMJB1BpDGohhgsLAOLDxAwYIkCAYiqjDZf/////v/80TEThGTGqwAOEq8//6ei9eq7mEHQu7uqGKppiHIYhM46NDybKRIE5B0NQ5B8UqoP2B4ZFokCUIwDThWKhsLQlFR1S/////////9n6a5+lENYzY1zFG5U4fYfHDEUwb/80TEWg9bIqQACA68g3MF81DHNICkbjgkKVUZKjQajJIZPMICYHgOBoNSQihUbnl1r/////7//////////////7eqq2aplaEnormoVQdKDY0491ImjonKGlipxFhWXGn/80TEbw/jIqAACA68HxwmQFR5aJxVFQaMEoJmIi0BwOxMWHJr////6//73////////0////VjPzF0esuxjFYoicVKKxJyiQqY4dFTGh4YcOigBCxjh1xISEgCUrhEAg//80TEghFrHqAACE69AEpQ8LMPAsBYWkOs6zf/+rdM2X//qX///9///8xv/7/qjq2Z9W0crVKXYyuitQPC3UVR5jMaYxUNUBRVQ6MDyh17CQsorETVIxDghQS5xh0hcev/80TEjxCDFogACEq5Teb7Q9KKnKezepKiuvkxhAz5145Iu1FQTxhNefizcVTcy5vc2Lp+1tziAxMsKEE810krjNl0WtNdIVis2llS/+eTD6hLc+rmyRAprGG9uo+o5Kv/80TEoBBbHlQBRygAbyH+1To/x2CO4oy7aD7CUfK8y1N3Y/9X15VJulJ5v/xhJAw3TkbbeI21QFikbC1ia7KqDlIXnbqzpGPvJlm4DskkT/srysD6hKHXPcd2ZuOkcuL/80TEsSHjKiQBmkgAOIMd9ffysgcUlInmKCKOyv7QmjrT1nC2kSYSCzr//Xl8smItBR0PPnmn////qKimLVbLnM1S8d6aIjrotXHH19xTJe+/5htuXXRN1ihhgr5LLx3/80TEfCHjKnQBj1gA6CmfMxEIIdoIBWTVDAdE4SMY+0iI4sJkz6jNd7YxVH9mpTb0UpbCG+9ctNJAYXwnYq5Kz9yv/rpOT9z2E8nmsZXUur95l7L7D3eyvdyvVf/al/X/80TERyD7GowByUgBX8Jy2cvGdTptuS8C5JzBtAjt02FPypGdFBgbRMto53pBSbzMsPCuJYUpIBO3NAF22WtIxQi1kkKIFSZCEhxx3ZuX5V7WqJK/I/7S5MZ75VcytQ3/80TEFhfC/owBRigBFo8PAMfNo7diu4lM5isalVzcz6t1a2ZSzPKXM/9r9U5jGriwsHhZyGQxswkLKrGOKjBZw6ZzGMUVLRylZxIWmMZ5g9YVSKCyjAnjE58SwrJxEjT/80TEChMSqngBijgAOfKjdam84w4pQ75EFgLhEWPGt+eOjZxoKfnflSxrGzOhx3/Y41S6V83//xxFoVuX/N1N//o5cWEKlTpIoSNyR4qIqiaKqkkQIllQyklut/dLIln/80TEEBH4BegBwRgBSQaSS0uFm/b91JYaGUGmK6O//7sksSWKoq0Uz///pQyg0xWYrvj//9VapRVorpet////JkszeyX/NWCggVllgMECDoZH//mTLJZYrAwQIOjs/+z/80TEGxERlWQAGMSUZURUoUwMECDkdnb//uUyggShky7+BQqKCR/1C7DIwWFf1iosSf8V4sTVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEKQAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEfAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
      ai_message: "I'm fine, thank you!",
      translated_ai_message: "Estoy bien, ¡gracias!",
      audio_ai_data:
        "k05VTVBZAQB2AHsnZGVzY3InOiAnfHUxJywgJ2ZvcnRyYW5fb3JkZXInOiBGYWxzZSwgJ3NoYXBlJzogKDMyNjQsKSwgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAr/80TEABIYeXwAYwxIXLXnXlp8PozGZELZ4vcjRKx4xONxalh0CYREIcMmTJkwBBYWMmnzRsE2f/5o2A3fSYfmjLvpMmgsLBswafNGfzJk0aNGjbrDSjSkIPJI/J6SrP3/80TEChEAkhgAwMZMQMIDi9FfhaF78EU04ILDAYD1ZDQT0sPk4PkPidy31HLpR1PwGUdDMccHATKOh/PxBTsUULrD5Qa+GAJKaoRNZDj/yuP1rGVPnhNc7QY2Mcc8+Zb/80TEGRcJhiABWRgBHknKZlCZQAHpDQyOwkz08yI4XLCMjMi+FwtfP6xEY2lRtKSXiaS+kP+4n0a1n83xSP6DM0w3/k93v4DG0jvkxdI7U9U8wtGEbIPYCjgq9UFYIPb/80TEDxWrKngBjWgAwyjBlz/L5EC4HP/Jo5x4kMcn/4yHLhLEov//Lo8y4kYMaf//rc0z5gyP///6akkFoGp9E+aK/////0Tcvm5Ll83LiajdRPL6sP9fmZxlZkgul0H/80TECxRpOqwB2GAA5GJjBDpoDYahbvXH/p7uHcqe3jM1nv768vbfptGzsw+q0oigCBQblYi2me0stO/Rt/dpW+MYtv+rXv//vpcixttSq1XfV0VLrNAHXZBRRGoCGUD/80TEDBVxOrAAnR5wGCxkDqcxDYDBk6xnTM08t3z/t657/w1q+PfsKhJ+E4yuvaATeDH9NIlnh2xlvMhX+mcQ3GrG26MsxY1n//01rtlXVPlTuK4dOaFfYvBLCjnlG5j/80TECROhNrgAjhJwBdB9UHInbWtPsw/P//dLJZ///FCWMV/cG/4+ywjJ5kIIgiB4BBIwmhgTGWLjFZGFBIZWRNubF0Cwnpt9d+Y///29X9v+pfwkWCgtazNJMLnAqgL/80TEDRWZyqwAo1qUCbqdQG8SjrYTcZXx2Bwq6BiNnxBx3XL6zMaAKOjZMzHmC6m6mJ40Ba0TpukgaC1femh9M2/PfdX0zb+d0/hjsqQttmW4eytqw8r1lAEuHEmtEoD/80TECRRZOrgAlN5wiYFrgKlQM7joD4SqrTTHl+YPH+v/eEwxc+8NnUMX9jOc5RvI67AnDQRLVF3KxuSoNJVZiPHsZ7ooAAdcUAVaCtYrpGWed//9NfWXwCjNHdAd4Vf/80TEChG5MsAAbhhwl+YFy+4+7JrXealFFLuf+sLWfMy27WcoxR6aMOHZ7WxwJBZD53Va9YvdZZbXoSW3xrzQUFQIHnW/////0us3FpDCxux0ZcBeRYlYQwTEolR0bM3/80TEFg+ZLrwAkxJwI9b232HvyFyWarJ1sbzYS3UooiYfJxUxI8kk0xJDBRPXK0swYuM0JTX/1dS3CJS6zfTnSoS6e3JAJ69ZZ3rOoYuoEV9WsTOLSlmSlXlcbnXjjM3/80TEKhHZNrgAw9JwUiEhkjJSJdVmpI4oYRg9FirD5Cxpiv////////0q/+rAB9CIViGmIAML2y5DxBkKLlDeMCFW7yPFpqBG9tecyNdo2cn6+KTImAwhcEiV78p53fX/80TENRFZJqQAw8xwZGhEScLf/////Q3s/6+xIrXO2sCaQR5QyYCHKmiTLihNM4tMpWR3NXb6/vUpDjFLmd2fvqh7KV/////9v///n0kZ7feu4Rr6E5KVq+gQQQzAP/j/80TEQhG6wqQAeIS5AAfgDkZYpByjm0ZNv//z//pqi/////////r//b97dXolFGKU1h5THQXHGBTnVGGmaQPBgsMGMJB1BpDGohhgsLAOLDxAwYIkCAYiqjDZf/////v/80TEThGTGqwAOEq8//6ei9eq7mEHQu7uqGKppiHIYhM46NDybKRIE5B0NQ5B8UqoP2B4ZFokCUIwDThWKhsLQlFR1S/////////9n6a5+lENYzY1zFG5U4fYfHDEUwb/80TEWg9bIqQACA68g3MF81DHNICkbjgkKVUZKjQajJIZPMICYHgOBoNSQihUbnl1r/////7//////////////7eqq2aplaEnormoVQdKDY0491ImjonKGlipxFhWXGn/80TEbw/jIqAACA68HxwmQFR5aJxVFQaMEoJmIi0BwOxMWHJr////6//73////////0////VjPzF0esuxjFYoicVKKxJyiQqY4dFTGh4YcOigBCxjh1xISEgCUrhEAg//80TEghFrHqAACE69AEpQ8LMPAsBYWkOs6zf/+rdM2X//qX///9///8xv/7/qjq2Z9W0crVKXYyuitQPC3UVR5jMaYxUNUBRVQ6MDyh17CQsorETVIxDghQS5xh0hcev/80TEjxCDFogACEq5Teb7Q9KKnKezepKiuvkxhAz5145Iu1FQTxhNefizcVTcy5vc2Lp+1tziAxMsKEE810krjNl0WtNdIVis2llS/+eTD6hLc+rmyRAprGG9uo+o5Kv/80TEoBBbHlQBRygAbyH+1To/x2CO4oy7aD7CUfK8y1N3Y/9X15VJulJ5v/xhJAw3TkbbeI21QFikbC1ia7KqDlIXnbqzpGPvJlm4DskkT/srysD6hKHXPcd2ZuOkcuL/80TEsSHjKiQBmkgAOIMd9ffysgcUlInmKCKOyv7QmjrT1nC2kSYSCzr//Xl8smItBR0PPnmn////qKimLVbLnM1S8d6aIjrotXHH19xTJe+/5htuXXRN1ihhgr5LLx3/80TEfCHjKnQBj1gA6CmfMxEIIdoIBWTVDAdE4SMY+0iI4sJkz6jNd7YxVH9mpTb0UpbCG+9ctNJAYXwnYq5Kz9yv/rpOT9z2E8nmsZXUur95l7L7D3eyvdyvVf/al/X/80TERyD7GowByUgBX8Jy2cvGdTptuS8C5JzBtAjt02FPypGdFBgbRMto53pBSbzMsPCuJYUpIBO3NAF22WtIxQi1kkKIFSZCEhxx3ZuX5V7WqJK/I/7S5MZ75VcytQ3/80TEFhfC/owBRigBFo8PAMfNo7diu4lM5isalVzcz6t1a2ZSzPKXM/9r9U5jGriwsHhZyGQxswkLKrGOKjBZw6ZzGMUVLRylZxIWmMZ5g9YVSKCyjAnjE58SwrJxEjT/80TEChMSqngBijgAOfKjdam84w4pQ75EFgLhEWPGt+eOjZxoKfnflSxrGzOhx3/Y41S6V83//xxFoVuX/N1N//o5cWEKlTpIoSNyR4qIqiaKqkkQIllQyklut/dLIln/80TEEBH4BegBwRgBSQaSS0uFm/b91JYaGUGmK6O//7sksSWKoq0Uz///pQyg0xWYrvj//9VapRVorpet////JkszeyX/NWCggVllgMECDoZH//mTLJZYrAwQIOjs/+z/80TEGxERlWQAGMSUZURUoUwMECDkdnb//uUyggShky7+BQqKCR/1C7DIwWFf1iosSf8V4sTVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEKQAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEfAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
      pronunciation: {
        Hello: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [],
        },
        how: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [
            {
              action: "r",
              position: 1,
              delete_character: "l",
              add_character: "ɾ",
            },
          ],
        },
        are: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [],
        },
        you: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [],
        },
      },
    },
    {
      user_message: "Hello, how are you?",
      translated_user_message: "Hola, ¿cómo estás?",
      audio_user_data:
        "k05VTVBZAQB2AHsnZGVzY3InOiAnfHUxJywgJ2ZvcnRyYW5fb3JkZXInOiBGYWxzZSwgJ3NoYXBlJzogKDMyNjQsKSwgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAr/80TEABIYeXwAYwxIXLXnXlp8PozGZELZ4vcjRKx4xONxalh0CYREIcMmTJkwBBYWMmnzRsE2f/5o2A3fSYfmjLvpMmgsLBswafNGfzJk0aNGjbrDSjSkIPJI/J6SrP3/80TEChEAkhgAwMZMQMIDi9FfhaF78EU04ILDAYD1ZDQT0sPk4PkPidy31HLpR1PwGUdDMccHATKOh/PxBTsUULrD5Qa+GAJKaoRNZDj/yuP1rGVPnhNc7QY2Mcc8+Zb/80TEGRcJhiABWRgBHknKZlCZQAHpDQyOwkz08yI4XLCMjMi+FwtfP6xEY2lRtKSXiaS+kP+4n0a1n83xSP6DM0w3/k93v4DG0jvkxdI7U9U8wtGEbIPYCjgq9UFYIPb/80TEDxWrKngBjWgAwyjBlz/L5EC4HP/Jo5x4kMcn/4yHLhLEov//Lo8y4kYMaf//rc0z5gyP///6akkFoGp9E+aK/////0Tcvm5Ll83LiajdRPL6sP9fmZxlZkgul0H/80TECxRpOqwB2GAA5GJjBDpoDYahbvXH/p7uHcqe3jM1nv768vbfptGzsw+q0oigCBQblYi2me0stO/Rt/dpW+MYtv+rXv//vpcixttSq1XfV0VLrNAHXZBRRGoCGUD/80TEDBVxOrAAnR5wGCxkDqcxDYDBk6xnTM08t3z/t657/w1q+PfsKhJ+E4yuvaATeDH9NIlnh2xlvMhX+mcQ3GrG26MsxY1n//01rtlXVPlTuK4dOaFfYvBLCjnlG5j/80TECROhNrgAjhJwBdB9UHInbWtPsw/P//dLJZ///FCWMV/cG/4+ywjJ5kIIgiB4BBIwmhgTGWLjFZGFBIZWRNubF0Cwnpt9d+Y///29X9v+pfwkWCgtazNJMLnAqgL/80TEDRWZyqwAo1qUCbqdQG8SjrYTcZXx2Bwq6BiNnxBx3XL6zMaAKOjZMzHmC6m6mJ40Ba0TpukgaC1femh9M2/PfdX0zb+d0/hjsqQttmW4eytqw8r1lAEuHEmtEoD/80TECRRZOrgAlN5wiYFrgKlQM7joD4SqrTTHl+YPH+v/eEwxc+8NnUMX9jOc5RvI67AnDQRLVF3KxuSoNJVZiPHsZ7ooAAdcUAVaCtYrpGWed//9NfWXwCjNHdAd4Vf/80TEChG5MsAAbhhwl+YFy+4+7JrXealFFLuf+sLWfMy27WcoxR6aMOHZ7WxwJBZD53Va9YvdZZbXoSW3xrzQUFQIHnW/////0us3FpDCxux0ZcBeRYlYQwTEolR0bM3/80TEFg+ZLrwAkxJwI9b232HvyFyWarJ1sbzYS3UooiYfJxUxI8kk0xJDBRPXK0swYuM0JTX/1dS3CJS6zfTnSoS6e3JAJ69ZZ3rOoYuoEV9WsTOLSlmSlXlcbnXjjM3/80TEKhHZNrgAw9JwUiEhkjJSJdVmpI4oYRg9FirD5Cxpiv////////0q/+rAB9CIViGmIAML2y5DxBkKLlDeMCFW7yPFpqBG9tecyNdo2cn6+KTImAwhcEiV78p53fX/80TENRFZJqQAw8xwZGhEScLf/////Q3s/6+xIrXO2sCaQR5QyYCHKmiTLihNM4tMpWR3NXb6/vUpDjFLmd2fvqh7KV/////9v///n0kZ7feu4Rr6E5KVq+gQQQzAP/j/80TEQhG6wqQAeIS5AAfgDkZYpByjm0ZNv//z//pqi/////////r//b97dXolFGKU1h5THQXHGBTnVGGmaQPBgsMGMJB1BpDGohhgsLAOLDxAwYIkCAYiqjDZf/////v/80TEThGTGqwAOEq8//6ei9eq7mEHQu7uqGKppiHIYhM46NDybKRIE5B0NQ5B8UqoP2B4ZFokCUIwDThWKhsLQlFR1S/////////9n6a5+lENYzY1zFG5U4fYfHDEUwb/80TEWg9bIqQACA68g3MF81DHNICkbjgkKVUZKjQajJIZPMICYHgOBoNSQihUbnl1r/////7//////////////7eqq2aplaEnormoVQdKDY0491ImjonKGlipxFhWXGn/80TEbw/jIqAACA68HxwmQFR5aJxVFQaMEoJmIi0BwOxMWHJr////6//73////////0////VjPzF0esuxjFYoicVKKxJyiQqY4dFTGh4YcOigBCxjh1xISEgCUrhEAg//80TEghFrHqAACE69AEpQ8LMPAsBYWkOs6zf/+rdM2X//qX///9///8xv/7/qjq2Z9W0crVKXYyuitQPC3UVR5jMaYxUNUBRVQ6MDyh17CQsorETVIxDghQS5xh0hcev/80TEjxCDFogACEq5Teb7Q9KKnKezepKiuvkxhAz5145Iu1FQTxhNefizcVTcy5vc2Lp+1tziAxMsKEE810krjNl0WtNdIVis2llS/+eTD6hLc+rmyRAprGG9uo+o5Kv/80TEoBBbHlQBRygAbyH+1To/x2CO4oy7aD7CUfK8y1N3Y/9X15VJulJ5v/xhJAw3TkbbeI21QFikbC1ia7KqDlIXnbqzpGPvJlm4DskkT/srysD6hKHXPcd2ZuOkcuL/80TEsSHjKiQBmkgAOIMd9ffysgcUlInmKCKOyv7QmjrT1nC2kSYSCzr//Xl8smItBR0PPnmn////qKimLVbLnM1S8d6aIjrotXHH19xTJe+/5htuXXRN1ihhgr5LLx3/80TEfCHjKnQBj1gA6CmfMxEIIdoIBWTVDAdE4SMY+0iI4sJkz6jNd7YxVH9mpTb0UpbCG+9ctNJAYXwnYq5Kz9yv/rpOT9z2E8nmsZXUur95l7L7D3eyvdyvVf/al/X/80TERyD7GowByUgBX8Jy2cvGdTptuS8C5JzBtAjt02FPypGdFBgbRMto53pBSbzMsPCuJYUpIBO3NAF22WtIxQi1kkKIFSZCEhxx3ZuX5V7WqJK/I/7S5MZ75VcytQ3/80TEFhfC/owBRigBFo8PAMfNo7diu4lM5isalVzcz6t1a2ZSzPKXM/9r9U5jGriwsHhZyGQxswkLKrGOKjBZw6ZzGMUVLRylZxIWmMZ5g9YVSKCyjAnjE58SwrJxEjT/80TEChMSqngBijgAOfKjdam84w4pQ75EFgLhEWPGt+eOjZxoKfnflSxrGzOhx3/Y41S6V83//xxFoVuX/N1N//o5cWEKlTpIoSNyR4qIqiaKqkkQIllQyklut/dLIln/80TEEBH4BegBwRgBSQaSS0uFm/b91JYaGUGmK6O//7sksSWKoq0Uz///pQyg0xWYrvj//9VapRVorpet////JkszeyX/NWCggVllgMECDoZH//mTLJZYrAwQIOjs/+z/80TEGxERlWQAGMSUZURUoUwMECDkdnb//uUyggShky7+BQqKCR/1C7DIwWFf1iosSf8V4sTVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEKQAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEfAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
      ai_message: "I'm fine, thank you!",
      translated_ai_message: "Estoy bien, ¡gracias!",
      audio_ai_data:
        "k05VTVBZAQB2AHsnZGVzY3InOiAnfHUxJywgJ2ZvcnRyYW5fb3JkZXInOiBGYWxzZSwgJ3NoYXBlJzogKDMyNjQsKSwgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAr/80TEABIYeXwAYwxIXLXnXlp8PozGZELZ4vcjRKx4xONxalh0CYREIcMmTJkwBBYWMmnzRsE2f/5o2A3fSYfmjLvpMmgsLBswafNGfzJk0aNGjbrDSjSkIPJI/J6SrP3/80TEChEAkhgAwMZMQMIDi9FfhaF78EU04ILDAYD1ZDQT0sPk4PkPidy31HLpR1PwGUdDMccHATKOh/PxBTsUULrD5Qa+GAJKaoRNZDj/yuP1rGVPnhNc7QY2Mcc8+Zb/80TEGRcJhiABWRgBHknKZlCZQAHpDQyOwkz08yI4XLCMjMi+FwtfP6xEY2lRtKSXiaS+kP+4n0a1n83xSP6DM0w3/k93v4DG0jvkxdI7U9U8wtGEbIPYCjgq9UFYIPb/80TEDxWrKngBjWgAwyjBlz/L5EC4HP/Jo5x4kMcn/4yHLhLEov//Lo8y4kYMaf//rc0z5gyP///6akkFoGp9E+aK/////0Tcvm5Ll83LiajdRPL6sP9fmZxlZkgul0H/80TECxRpOqwB2GAA5GJjBDpoDYahbvXH/p7uHcqe3jM1nv768vbfptGzsw+q0oigCBQblYi2me0stO/Rt/dpW+MYtv+rXv//vpcixttSq1XfV0VLrNAHXZBRRGoCGUD/80TEDBVxOrAAnR5wGCxkDqcxDYDBk6xnTM08t3z/t657/w1q+PfsKhJ+E4yuvaATeDH9NIlnh2xlvMhX+mcQ3GrG26MsxY1n//01rtlXVPlTuK4dOaFfYvBLCjnlG5j/80TECROhNrgAjhJwBdB9UHInbWtPsw/P//dLJZ///FCWMV/cG/4+ywjJ5kIIgiB4BBIwmhgTGWLjFZGFBIZWRNubF0Cwnpt9d+Y///29X9v+pfwkWCgtazNJMLnAqgL/80TEDRWZyqwAo1qUCbqdQG8SjrYTcZXx2Bwq6BiNnxBx3XL6zMaAKOjZMzHmC6m6mJ40Ba0TpukgaC1femh9M2/PfdX0zb+d0/hjsqQttmW4eytqw8r1lAEuHEmtEoD/80TECRRZOrgAlN5wiYFrgKlQM7joD4SqrTTHl+YPH+v/eEwxc+8NnUMX9jOc5RvI67AnDQRLVF3KxuSoNJVZiPHsZ7ooAAdcUAVaCtYrpGWed//9NfWXwCjNHdAd4Vf/80TEChG5MsAAbhhwl+YFy+4+7JrXealFFLuf+sLWfMy27WcoxR6aMOHZ7WxwJBZD53Va9YvdZZbXoSW3xrzQUFQIHnW/////0us3FpDCxux0ZcBeRYlYQwTEolR0bM3/80TEFg+ZLrwAkxJwI9b232HvyFyWarJ1sbzYS3UooiYfJxUxI8kk0xJDBRPXK0swYuM0JTX/1dS3CJS6zfTnSoS6e3JAJ69ZZ3rOoYuoEV9WsTOLSlmSlXlcbnXjjM3/80TEKhHZNrgAw9JwUiEhkjJSJdVmpI4oYRg9FirD5Cxpiv////////0q/+rAB9CIViGmIAML2y5DxBkKLlDeMCFW7yPFpqBG9tecyNdo2cn6+KTImAwhcEiV78p53fX/80TENRFZJqQAw8xwZGhEScLf/////Q3s/6+xIrXO2sCaQR5QyYCHKmiTLihNM4tMpWR3NXb6/vUpDjFLmd2fvqh7KV/////9v///n0kZ7feu4Rr6E5KVq+gQQQzAP/j/80TEQhG6wqQAeIS5AAfgDkZYpByjm0ZNv//z//pqi/////////r//b97dXolFGKU1h5THQXHGBTnVGGmaQPBgsMGMJB1BpDGohhgsLAOLDxAwYIkCAYiqjDZf/////v/80TEThGTGqwAOEq8//6ei9eq7mEHQu7uqGKppiHIYhM46NDybKRIE5B0NQ5B8UqoP2B4ZFokCUIwDThWKhsLQlFR1S/////////9n6a5+lENYzY1zFG5U4fYfHDEUwb/80TEWg9bIqQACA68g3MF81DHNICkbjgkKVUZKjQajJIZPMICYHgOBoNSQihUbnl1r/////7//////////////7eqq2aplaEnormoVQdKDY0491ImjonKGlipxFhWXGn/80TEbw/jIqAACA68HxwmQFR5aJxVFQaMEoJmIi0BwOxMWHJr////6//73////////0////VjPzF0esuxjFYoicVKKxJyiQqY4dFTGh4YcOigBCxjh1xISEgCUrhEAg//80TEghFrHqAACE69AEpQ8LMPAsBYWkOs6zf/+rdM2X//qX///9///8xv/7/qjq2Z9W0crVKXYyuitQPC3UVR5jMaYxUNUBRVQ6MDyh17CQsorETVIxDghQS5xh0hcev/80TEjxCDFogACEq5Teb7Q9KKnKezepKiuvkxhAz5145Iu1FQTxhNefizcVTcy5vc2Lp+1tziAxMsKEE810krjNl0WtNdIVis2llS/+eTD6hLc+rmyRAprGG9uo+o5Kv/80TEoBBbHlQBRygAbyH+1To/x2CO4oy7aD7CUfK8y1N3Y/9X15VJulJ5v/xhJAw3TkbbeI21QFikbC1ia7KqDlIXnbqzpGPvJlm4DskkT/srysD6hKHXPcd2ZuOkcuL/80TEsSHjKiQBmkgAOIMd9ffysgcUlInmKCKOyv7QmjrT1nC2kSYSCzr//Xl8smItBR0PPnmn////qKimLVbLnM1S8d6aIjrotXHH19xTJe+/5htuXXRN1ihhgr5LLx3/80TEfCHjKnQBj1gA6CmfMxEIIdoIBWTVDAdE4SMY+0iI4sJkz6jNd7YxVH9mpTb0UpbCG+9ctNJAYXwnYq5Kz9yv/rpOT9z2E8nmsZXUur95l7L7D3eyvdyvVf/al/X/80TERyD7GowByUgBX8Jy2cvGdTptuS8C5JzBtAjt02FPypGdFBgbRMto53pBSbzMsPCuJYUpIBO3NAF22WtIxQi1kkKIFSZCEhxx3ZuX5V7WqJK/I/7S5MZ75VcytQ3/80TEFhfC/owBRigBFo8PAMfNo7diu4lM5isalVzcz6t1a2ZSzPKXM/9r9U5jGriwsHhZyGQxswkLKrGOKjBZw6ZzGMUVLRylZxIWmMZ5g9YVSKCyjAnjE58SwrJxEjT/80TEChMSqngBijgAOfKjdam84w4pQ75EFgLhEWPGt+eOjZxoKfnflSxrGzOhx3/Y41S6V83//xxFoVuX/N1N//o5cWEKlTpIoSNyR4qIqiaKqkkQIllQyklut/dLIln/80TEEBH4BegBwRgBSQaSS0uFm/b91JYaGUGmK6O//7sksSWKoq0Uz///pQyg0xWYrvj//9VapRVorpet////JkszeyX/NWCggVllgMECDoZH//mTLJZYrAwQIOjs/+z/80TEGxERlWQAGMSUZURUoUwMECDkdnb//uUyggShky7+BQqKCR/1C7DIwWFf1iosSf8V4sTVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEKQAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEfAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
      pronunciation: {
        Hello: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [],
        },
        how: {
          phon_audio: "ola",
          phon_text: "oɾa",
          changes: [
            {
              action: "r",
              position: 1,
              delete_character: "l",
              add_character: "ɾ",
            },
          ],
        },
        are: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [],
        },
        you: {
          phon_audio: "ola",
          phon_text: "ola",
          changes: [],
        },
      },
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
                          speed={speed["audioSpeed"]}
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
                            {isWaitingBackend ? (
                              <Button disabled className="ml-auto gap-1.5">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                size="sm"
                                className="ml-auto gap-1.5"
                              >
                                Send Message
                                <CornerDownLeft className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </form>
                      </>
                    ) : (
                      <SplitMessageComponent
                        message={msg.user_message}
                        pronunciation={msg.pronunciation}
                        wikiData={wikiData}
                        chatIndex={index}
                        dataType={"user"}
                        lastElement={index === messages.length - 1}
                        typingSpeed={50}
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
                          speed={speed["audioSpeed"]}
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
                    typingSpeed={50}
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

const AudioPlayer = ({ speed, audioData, audioRef, autoPlay = false }) => {
  const internalAudioRef = useRef(null);
  const ref = audioRef || internalAudioRef;

  useEffect(() => {
    // Automatically play audio if autoPlay is true
    if (autoPlay && ref.current) {
      ref.current.playbackRate = speed; // Set the playback rate based on the speed prop
      ref.current
        .play()
        .catch((error) => console.error("Auto-play error:", error));
    }
    // We don't want audio to play on speed updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
