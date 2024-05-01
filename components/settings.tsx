import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { axiosInstance } from "@/components/axios-instance";
import { Loader2 } from "lucide-react";
import { LangForm } from "@/components/langForm";

export interface ChatSettings {
  convo_lang: string;
  known_lang: string;
  scenario?: string;
  learningFocus?: string;
}

export function ChatDrawerDialog() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Conversation Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Conversation Profile</DialogTitle>
              {/* <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription> */}
            </DialogHeader>
            <ProfileForm />
            <LangForm />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Chat Profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Chat Profile</DrawerTitle>
          {/* <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription> */}
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  const [isWaitingBackend, setIsWaitingBackend] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    convo_lang: "Spanish",
    known_lang: "English",
    scenario: "waiter in Barcelona",
    learningFocus: "present tense",
  });

  const displaySettings = {
    convo_lang: "Conversation Language",
    known_lang: "Known Language",
    scenario: "Scenario",
    learningFocus: "Learning Focus",
  };

  const updateSettings = async (event) => {
    event.preventDefault();
    // TODO: fix assignment: // setSettings(event);
    console.log("working");
    setIsWaitingBackend(true);
    try {
      const response = await axiosInstance.post("/update_settings", event);
      console.log(response.data);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
    setIsWaitingBackend(false);
  };

  const settingsDivs = Object.keys(settings).map((key, index) => {
    return (
      <div key={index} className="grid gap-2">
        <Label htmlFor={key}>{displaySettings[key]}</Label>
        <Input id={key} defaultValue={settings[key]} />
      </div>
    );
  });

  return (
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={updateSettings}
    >
      {settingsDivs}
      {isWaitingBackend ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit">Save changes</Button>
      )}
    </form>
  );
}
