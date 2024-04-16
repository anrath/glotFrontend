import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
// import { useTypingEffect } from "@/components/typingEffect"; // Import the custom hook
import TypeIt from "typeit-react";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export function formatPhonAudio(phonAudio, changes) {
  let formattedPhonAudioArray = [];
  let currentIndex = 0;

  changes.forEach((change, i) => {
    // Add unchanged text
    if (currentIndex < change.position) {
      formattedPhonAudioArray.push(
        phonAudio.slice(currentIndex, change.position)
      );
    }

    if (change.action === "r") {
      // Replace character
      formattedPhonAudioArray.push(
        <span key={`del-${i}`} className="line-through">
          {change.delete_character}
        </span>
      );
      formattedPhonAudioArray.push(
        <span key={`add-${i}`} className="overline">
          {change.add_character}
        </span>
      );
    } else if (change.action === "-") {
      // Delete character
      formattedPhonAudioArray.push(
        <span key={`del-${i}`} className="line-through">
          {change.character}
        </span>
      );
    } else if (change.action === "+") {
      // Add character
      if (currentIndex === change.position) {
        // if addition is exactly at the position without replacement
        formattedPhonAudioArray.push(
          <span key={`add-${i}`} className="overline">
            {change.character}
          </span>
        );
      }
    }
    currentIndex = change.position + 1;
  });

  // Append any remaining text after the last change
  if (currentIndex < phonAudio.length) {
    formattedPhonAudioArray.push(phonAudio.slice(currentIndex));
  }

  return formattedPhonAudioArray;
}

interface SplitMessageComponentProps {
  message: string;
  pronunciation?: any;
  wikiData: any;
  chatIndex: number;
  dataType: string;
  lastElement: boolean;
  typingSpeed: number;
}

export const SplitMessageComponent: React.FC<SplitMessageComponentProps> = ({
  message,
  pronunciation,
  wikiData,
  chatIndex,
  dataType,
  lastElement,
  typingSpeed,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!message) return <></>;
  const words = message.split(/(\s+|[.?!,:;¡¿])/).map((word, index) => {
    if (word === "") {
      return <></>;
    } else if (/\s+|[.?!,:;¡¿]/.test(word)) {
      return (
        <>
          {lastElement && dataType === "ai" ? (
            <TypeIt
              key={index}
              options={{
                strings: [word],
                speed: 50,
                waitUntilVisible: false,
                cursorChar: "",
                startDelay: index * 50 * 2,
              }}
            />
          ) : (
            <>{word}</>
          )}
        </>
      );
    } else {
      const subset = dataType === "user" ? "wiki_user_data" : "wiki_ai_data";
      let pronunciationWordData;
      let pronunciationIncorrect = false;
      if (dataType === "user") {
        pronunciationWordData = pronunciation[word];
        pronunciationIncorrect = pronunciationWordData?.changes.length > 0;
      }
      const wikiWordData = wikiData[chatIndex]?.[subset]?.[word];
      return isDesktop ? (
        <HoverCard key={index} className="mb-1">
          <HoverCardTrigger
            className={`word hover:bg-primary ${
              pronunciationIncorrect ? "underline" : ""
            }`}
          >
            {lastElement && dataType === "ai" ? (
              <>
                <TypeIt
                  options={{
                    strings: [word],
                    speed: 50,
                    waitUntilVisible: false,
                    cursorChar: "",
                    startDelay: index * 50 * 2,
                  }}
                />
              </>
            ) : (
              <>{word}</>
            )}
          </HoverCardTrigger>
          {wikiWordData && (
            <HoverCardContent>
              <div key={word}>
                <h3>{word}</h3>
                {pronunciationWordData && (
                  <div>
                    <p className="tracking-[.25em]">
                      {formatPhonAudio(
                        pronunciationWordData.phon_audio,
                        pronunciationWordData.changes
                      )}
                    </p>
                  </div>
                )}
                <p>
                  <strong>Part of Speech:</strong> {wikiWordData.partOfSpeech}
                </p>
                <strong>Definitions:</strong>
                <ul className="list-decimal ml-2">
                  {wikiWordData.definition.map((definition, idx) => (
                    <li key={idx}>{definition}</li>
                  ))}
                </ul>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      ) : (
        <Drawer>
          <DrawerTrigger key={word}>{word}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{word}</DrawerTitle>
              {wikiWordData && (
                <>
                  <DrawerDescription>
                    <strong>Part of Speech:</strong> {wikiWordData.partOfSpeech}
                  </DrawerDescription>
                  {pronunciationWordData && (
                    <div>
                      <p className="tracking-[.25em]">
                        {formatPhonAudio(
                          pronunciationWordData.phon_audio,
                          pronunciationWordData.changes
                        )}
                      </p>
                    </div>
                  )}

                  <strong>Definitions:</strong>
                  <ul className="list-decimal ml-2">
                    {wikiWordData.definition.map((definition, idx) => (
                      <li key={idx}>{definition}</li>
                    ))}
                  </ul>
                </>
              )}
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
  });

  const class_type = dataType === "user" ? "user-message" : "ai-message";
  return <span className={class_type}>{words}</span>;
};

export default SplitMessageComponent;
