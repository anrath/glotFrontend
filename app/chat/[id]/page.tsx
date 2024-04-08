"use client";

import React, { useState } from "react";
import { CircleUser } from "lucide-react";
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

export default function ChatWindow() {

  /**
    ==============================
    Translations Visibility State
    ==============================
  */
  const [translationsVisible, setTranslationsVisible] = useState(true);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] fixed overflow-hidden">
      {/* Sidebar menu */}
      <Sidebar />
      {/* Header Menu */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <SidebarMobile />
          <div className="w-full flex-1">
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
          <Chat translationsVisible={translationsVisible} />
        </main>
      </div>
    </div>
  );
}
