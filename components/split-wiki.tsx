import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
// import { useTypingEffect } from "@/components/typingEffect"; // Import the custom hook
import TypeIt from "typeit-react";

interface SplitMessageComponentProps {
  message: string;
  wikiData: any;
  chatIndex: number;
  dataType: string;
}

export const SplitMessageComponent: React.FC<SplitMessageComponentProps> = ({
  message,
  wikiData,
  chatIndex,
  dataType,
  lastElement,
}) => {
  const typingSpeed = 50;
  const words = message.split(/(\s+|[.?!,:;¡¿])/).map((word, index) => {
    if (/\s+|[.?!,:;¡¿]/.test(word) || word === "") {
      return <>{word}</>;
    } else {
      const subset = dataType === "user" ? "wiki_user_data" : "wiki_ai_data";
      const wordData = wikiData[chatIndex]?.[subset]?.[word];

      return (
        <HoverCard key={index} className="mb-1">
          <HoverCardTrigger className="word hover:bg-primary">
            {lastElement ? (
              <>
                <TypeIt
                  options={{
                    strings: ["example word"],
                    speed: 100,
                    waitUntilVisible: true,
                  }}
                />
                {/* <TypeIt
                  // options={{
                  //   strings: [word]
                  // }}
                  // cursor={false}
                  getBeforeInit={(instance) => {
                    instance.type(word).pause(index * typingSpeed);

                    // Remember to return it!
                    return instance;
                  }}
                /> */}
              </>
            ) : (
              <>{word} </>
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
      );
    }
  });

  const class_type = dataType === "user" ? "user-message" : "ai-message";
  return <span className={class_type}>{words}</span>;
};

export default SplitMessageComponent;
