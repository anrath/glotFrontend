import React, { useRef, useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function SplitMessageComponent({
  message,
  wikiData,
  chatIndex,
  dataType,
}) {
  const words = message.split(/(\s+|[.?!,:;¡¿])/).map((word, index) => {
    if (/\s+|[.?!,:;¡¿]/.test(word)) {
      console.log("punctuation word", word);
      return <>{word}</>;
    } else {
      console.log("real word:", word);
      const subset = dataType === "user" ? "wiki_user_data" : "wiki_ai_data";
      const wordData = wikiData[chatIndex]?.[subset]?.[word];
      console.log("real word:", word, wordData);

      return (
        <HoverCard key={index} className="mb-1">
          <HoverCardTrigger className="word hover:bg-primary">
            {word}
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
}

export default SplitMessageComponent;
