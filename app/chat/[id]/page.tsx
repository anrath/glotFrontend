"use client";

import React, { useState } from "react";
import { CircleGauge, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatDrawerDialog } from "@/components/settings";
import { Chat } from "@/components/chat";
import { Sidebar, SidebarMobile } from "@/components/sidebar";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function ChatWindow() {
  const [translationsVisible, setTranslationsVisible] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [speed, setSpeed] = useState({ typingSpeed: 100, audioSpeed: 1.0 });

  function adjustTypeSpeed(rangeVal: number): void {
    setSpeed({ typingSpeed: (rangeVal * 2) / 3, audioSpeed: rangeVal / 100 });
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] fixed overflow-hidden">
      {/* Sidebar menu */}
      <Sidebar />
      {/* Header Menu */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <SidebarMobile />
          <div className="w-full flex-1">
            <span className="flex items-center space-x-4">
              <Toggle
                className="bg-primary"
                variant="outline"
                aria-label="Toggle Translations"
                pressed={!translationsVisible}
                onPressedChange={() => {
                  setTranslationsVisible(!translationsVisible);
                }}
              >
                Toggle Translations
              </Toggle>

              {isDesktop ? (
                <>
                  <Label
                    className="flex items-center space-x-2"
                    htmlFor="speed"
                  >
                    Slow
                  </Label>
                  <Slider
                    aria-labelledby="speed-label"
                    id="speed"
                    defaultValue={[speed["typingSpeed"]]}
                    min={50}
                    max={150}
                    step={25}
                    minStepsBetweenThumbs={1}
                    className="w-full"
                    style={{ width: "25%" }}
                    onValueCommit={(value) => {
                      adjustTypeSpeed(value[0]);
                    }}
                  />
                  <Label
                    className="flex items-center space-x-2"
                    htmlFor="speed"
                  >
                    Fast
                  </Label>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                    >
                      <CircleGauge className="h-5 w-5" />
                      <span className="sr-only">Change Speed</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e) => adjustTypeSpeed(50)}>
                      Slow
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => adjustTypeSpeed(75)}>
                      Slower
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => adjustTypeSpeed(100)}>
                      Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => adjustTypeSpeed(125)}>
                      Faster
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => adjustTypeSpeed(150)}>
                      Fast
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </span>
          </div>
          <ChatDrawerDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main className="scroll-area flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto max-h-screen">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              Chat with Glot
            </h1>
          </div>
          <Chat translationsVisible={translationsVisible} speed={speed} />
        </main>
      </div>
    </div>
  );
}
