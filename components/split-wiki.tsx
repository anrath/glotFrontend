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

interface SplitMessageComponentProps {
  message: string;
  wikiData: any;
  chatIndex: number;
  dataType: string;
  lastElement: boolean;
  typingSpeed: number;
}

export const SplitMessageComponent: React.FC<SplitMessageComponentProps> = ({
  message,
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
      const wordData = wikiData[chatIndex]?.[subset]?.[word];
      return isDesktop ? (
        <HoverCard key={index} className="mb-1">
          <HoverCardTrigger className="word hover:bg-primary">
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
          {wordData && (
            <HoverCardContent>
              <div key={word}>
                <h3>{word}</h3>
                <p>
                  <strong>Part of Speech:</strong> {wordData.partOfSpeech}
                </p>
                <p>
                  <strong>Definitions:</strong>
                  <ul className="list-decimal ml-2">
                    {wordData.definition.map((definition, idx) => (
                      <li key={idx}>{definition}</li>
                    ))}
                  </ul>
                </p>
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
              {wordData && (
                <>
                  <DrawerDescription>
                    <strong>Part of Speech:</strong> {wordData.partOfSpeech}
                  </DrawerDescription>
                  <p>
                    <strong>Definitions:</strong>
                    <ul className="list-decimal ml-2">
                      {wordData.definition.map((definition, idx) => (
                        <li key={idx}>{definition}</li>
                      ))}
                    </ul>
                  </p>
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
