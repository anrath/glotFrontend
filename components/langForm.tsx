"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { axiosInstance } from "./axios-instance";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
];

const levels = [
  { label: "None", value: "none" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "Fluent", value: "fluent" },
  { label: "Native", value: "native" },
];

const scenarios = [
  { label: "Restaurant Waiter", value: "waiter" },
  { label: "Tour Guide", value: "tourGuide" },
  { label: "Local Resident", value: "local" },
];

const focuses = [
  { label: "Verbs", value: "verbs" },
  { label: "Nouns", value: "nouns" },
  { label: "Adjectives", value: "adjectives" },
];

const FormSchema = z.object({
  known_language: z.string({
    required_error: "Please select a language.",
  }),
  convo_language: z.string({
    required_error: "Please select a language.",
  }),
  language_level: z.string({
    required_error: "Please select an experience level.",
  }),
  scenario: z.string({ required_error: "Please select a scenario." }),
  learningFocus: z.array(z.string()).optional(),
});

type Framework = Record<"value" | "label" | "color", string>;

// const FRAMEWORKS = [
//   {
//     value: "next.js",
//     label: "Next.js",
//     color: "#ef4444",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//     color: "#eab308",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//     color: "#22c55e",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//     color: "#06b6d4",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//     color: "#3b82f6",
//   },
//   {
//     value: "wordpress",
//     label: "WordPress",
//     color: "#8b5cf6",
//   },
// ] satisfies Framework[];

const badgeStyle = (color: string) => ({
  borderColor: `${color}20`,
  backgroundColor: `${color}30`,
  color,
});

export function LangForm({ className }: React.ComponentProps<"form">) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [isWaitingBackend, setIsWaitingBackend] = useState(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    setIsWaitingBackend(true);
    try {
      const response = await axiosInstance.post("/update_settings", data);
      console.log(response.data);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
    setIsWaitingBackend(false);
  }

  const inputRef = React.useRef<HTMLInputElement>(null);
  // const [frameworks, setFrameworks] = React.useState<Framework[]>(FRAMEWORKS);
  const [inputValue, setInputValue] = React.useState<string>("");
  const [selectedValues, setSelectedValues] = React.useState<Framework[]>([]);

  const toggleFramework = (framework: Framework) => {
    setSelectedValues((currentFrameworks) =>
      !currentFrameworks.includes(framework)
        ? [...currentFrameworks, framework]
        : currentFrameworks.filter((l) => l.value !== framework.value)
    );
    inputRef?.current?.focus();
    const values: string[] = selectedValues.map((framework) => framework.value);

    form.setValue("learningFocus", values);
  };

  // TODO: Could not figure out how to use one variable for all form items. Need to refactor. These facilitate closing the popover menu on select. 
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox(value);
  };

  const [openCombobox1, setOpenCombobox1] = React.useState(false);
  const onComboboxOpenChange1 = (value: boolean) => {
    inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox1(value);
  };

  const [openCombobox2, setOpenCombobox2] = React.useState(false);
  const onComboboxOpenChange2 = (value: boolean) => {
    inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox2(value);
  };

  const [openCombobox3, setOpenCombobox3] = React.useState(false);
  const onComboboxOpenChange3 = (value: boolean) => {
    inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox3(value);
  };

  const [openCombobox4, setOpenCombobox4] = React.useState(false);
  const onComboboxOpenChange4 = (value: boolean) => {
    inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox4(value);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid items-start space-y-6", className)}
      >
        {/* Form Variables */}
        <FormField
          control={form.control}
          name="known_language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Known Language</FormLabel>
              <Popover open={openCombobox1} onOpenChange={onComboboxOpenChange1}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox1}
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue("known_language", language.value);
                              setOpenCombobox1(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                language.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Choose a language that you are fluent in.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="convo_language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Conversation Language</FormLabel>
              <Popover open={openCombobox2} onOpenChange={onComboboxOpenChange2}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox2}
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue("convo_language", language.value);
                              setOpenCombobox2(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                language.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                What language do you want to learn?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language_level"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language Level</FormLabel>
              <Popover open={openCombobox3} onOpenChange={onComboboxOpenChange3}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox3}
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? levels.find((level) => level.value === field.value)
                            ?.label
                        : "Select level"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandEmpty>No level found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {levels.map((level) => (
                          <CommandItem
                            value={level.label}
                            key={level.value}
                            onSelect={() => {
                              form.setValue("language_level", level.value);
                              setOpenCombobox3(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                level.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {level.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Choose your level of proficiency in the language.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scenario"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scenario</FormLabel>
              <Popover open={openCombobox4} onOpenChange={onComboboxOpenChange4}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox4}
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? scenarios.find(
                            (scenario) => scenario.value === field.value
                          )?.label
                        : "Select a scenario"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search scenario..." />
                    <CommandEmpty>No scenario found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {scenarios.map((scenario) => (
                          <CommandItem
                            value={scenario.label}
                            key={scenario.value}
                            onSelect={() => {
                              form.setValue("scenario", scenario.value);
                              setOpenCombobox4(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                scenario.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {scenario.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>Who do you want to speak to?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learningFocus"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Learning Focus</FormLabel>
              <FormControl>
                <div className="max-w-[200px]">
                  <Popover
                    open={openCombobox}
                    onOpenChange={onComboboxOpenChange}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-[200px] justify-between text-foreground"
                      >
                        <span className="truncate">
                          {selectedValues.length === 0 && "Select labels"}
                          {selectedValues.length === 1 &&
                            selectedValues[0].label}
                          {selectedValues.length === 2 &&
                            selectedValues.map(({ label }) => label).join(", ")}
                          {selectedValues.length > 2 &&
                            `${selectedValues.length} labels selected`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command loop>
                        <CommandList>
                          <CommandInput
                            ref={inputRef}
                            placeholder="Search framework..."
                            value={inputValue}
                            onValueChange={setInputValue}
                          />
                          <CommandGroup className="max-h-[145px] overflow-auto">
                            {focuses.map((focus) => {
                              const isActive = selectedValues.includes(focus);
                              return (
                                <CommandItem
                                  key={focus.value}
                                  value={focus.value}
                                  onSelect={() => toggleFramework(focus)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isActive ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1">{focus.label}</div>
                                  {/* <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: focus.color }}
                                  /> */}
                                </CommandItem>
                              );
                            })}
                            <CommandEmpty>No framework found.</CommandEmpty>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div
                    className="relative mt-3 h-24 overflow-y-auto"
                    style={{
                      marginBottom: `${-100 / (selectedValues.length + 1)}px`,
                    }}
                  >
                    {selectedValues.map(({ label, value, color }) => (
                      <Badge
                        key={value}
                        variant="outline"
                        style={badgeStyle(color)}
                        className="mr-2 mb-2"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Are there skills you want to focus on for this conversation?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submitting */}
        {isWaitingBackend ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Save changes</Button>
        )}
      </form>
    </Form>
  );
}
