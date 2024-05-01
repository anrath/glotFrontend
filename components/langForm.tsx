"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { FancyBox } from "./fancy-box";

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

const scenarios = [
  { label: "Restaurant Waiter", value: "waiter" },
  { label: "Tour Guide", value: "tourGuide" },
  { label: "Local Resident", value: "local" },
];

const FormSchema = z.object({
  convo_language: z.string({
    required_error: "Please select a language.",
  }),
  known_language: z.string({
    required_error: "Please select a language.",
  }),
  // multiselect
  scenario: z.string().optional(),
  learningFocus: z.set(z.string()).optional(),
});

export function LangForm() {
  // const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [isWaitingBackend, setIsWaitingBackend] = useState(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("working");
    setIsWaitingBackend(true);
    try {
      const response = await axiosInstance.post("/update_settings", event);
      console.log(response.data);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
    setIsWaitingBackend(false);

    // toast({
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Variables */}
        <FormField
          control={form.control}
          name="convo_language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Conversation Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
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
          name="known_language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Known Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
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

        {/* <FormField
          control={form.control}
          name="scenario"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scenario</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !form.watch("scenario")?.size && "text-muted-foreground"
                      )}
                    >
                      {form.watch("scenario")?.size
                        ? `Selected: ${form.watch("scenario").size} options`
                        : "Select scenarios"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px] p-0">
                    <DropdownMenuLabel>Choose Scenarios</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {scenarios.map((persona) => (
                      <DropdownMenuCheckboxItem
                        key={persona.value}
                        checked={form.watch("scenario")?.has(persona.value)}
                        onCheckedChange={(isChecked) => {
                          const newScenarios = new Set(
                            form.getValues("scenario")
                          );
                          if (isChecked) {
                            newScenarios.add(persona.value);
                          } else {
                            newScenarios.delete(persona.value);
                          }
                          form.setValue("scenario", newScenarios);
                        }}
                      >
                        {persona.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FormControl>

              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="scenario"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Known Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
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
                <FancyBox />
              </FormControl>
              <FormDescription>Are there skills you want to focus on for this conversation?</FormDescription>
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
