"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useState, useTransition } from "react";
import { Sparkles, Wand2 } from "lucide-react";

import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { StateBlock } from "@/components/dashboard/state-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ALL_PLATFORMS,
  PLATFORM_CHARACTER_LIMITS,
  PLATFORM_LABELS,
  getPrimaryCharacterLimit,
} from "@/lib/platforms";
import type { Platform, Tone } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const TONES: Tone[] = [
  "professional",
  "casual",
  "humorous",
  "inspirational",
  "promotional",
];

export default function ComposePage() {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [captionVariants, setCaptionVariants] = useState<string[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);
  const [publishNow, setPublishNow] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isGeneratingCaptions, startGeneratingCaptions] = useTransition();
  const [isGeneratingHashtags, startGeneratingHashtags] = useTransition();

  const deferredContent = useDeferredValue(content);
  const activePreviewPlatform = selectedPlatforms[0] ?? null;
  const characterLimit = getPrimaryCharacterLimit(selectedPlatforms);
  const isOverLimit = deferredContent.length > characterLimit;

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  function addHashtag(tag: string) {
    const normalized = tag.trim().replace(/^#*/, "");

    if (!normalized) {
      return;
    }

    const nextTag = `#${normalized}`;
    setHashtags((current) => (current.includes(nextTag) ? current : [...current, nextTag]));
    setHashtagInput("");
  }

  async function handleGenerateCaptions() {
    setError(null);
    startGeneratingCaptions(async () => {
      try {
        if (!topic.trim() || selectedPlatforms.length === 0) {
          throw new Error("Select a platform and add a topic first");
        }

        const response = await fetch("/api/ai/caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            topic,
            platform: selectedPlatforms[0],
            tone,
          }),
        });
        const payload = (await response.json()) as ApiResponse<{ captions: string[] }>;

        if (payload.error || !payload.data) {
          throw new Error(payload.error ?? "Failed to generate captions");
        }

        setCaptionVariants(payload.data.captions);
      } catch (generationError) {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Failed to generate captions",
        );
      }
    });
  }

  async function handleGenerateHashtags() {
    setError(null);
    startGeneratingHashtags(async () => {
      try {
        if (!content.trim() || selectedPlatforms.length === 0) {
          throw new Error("Add content and select a platform first");
        }

        const response = await fetch("/api/ai/hashtags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content,
            platform: selectedPlatforms[0],
          }),
        });
        const payload = (await response.json()) as ApiResponse<{ hashtags: string[] }>;

        if (payload.error || !payload.data) {
          throw new Error(payload.error ?? "Failed to generate hashtags");
        }

        setHashtagSuggestions(payload.data.hashtags);
      } catch (generationError) {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Failed to generate hashtags",
        );
      }
    });
  }

  async function savePost(status: "draft" | "scheduled") {
    setError(null);
    startSaving(async () => {
      try {
        if (selectedPlatforms.length === 0) {
          throw new Error("Select at least one platform");
        }

        const scheduledAt =
          !publishNow && scheduleDate && scheduleTime
            ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
            : null;

        const response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content,
            platforms: selectedPlatforms,
            hashtags,
            media_urls: [],
            status,
            scheduled_at: status === "scheduled" ? scheduledAt : null,
            published_at: null,
            campaign_id: null,
            ai_generated: captionVariants.includes(content),
          }),
        });

        const payload = (await response.json()) as ApiResponse<unknown>;

        if (payload.error) {
          throw new Error(payload.error);
        }

        router.push("/dashboard/calendar");
        router.refresh();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to save post");
      }
    });
  }

  return (
    <main className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        {error ? (
          <StateBlock
            actionLabel="Dismiss"
            description={error}
            onAction={() => setError(null)}
            title="Composer action failed"
            tone="error"
          />
        ) : null}

        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader>
            <CardTitle className="text-white">Platform Selector</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_PLATFORMS.map((platform) => (
              <button
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selectedPlatforms.includes(platform)
                    ? "border-primary bg-primary/10 text-white"
                    : "border-white/8 bg-white/4 text-slate-300 hover:border-white/16"
                }`}
                key={platform}
                onClick={() => togglePlatform(platform)}
                type="button"
              >
                {PLATFORM_LABELS[platform]}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader>
            <CardTitle className="text-white">Write Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-[200px] border-white/10 bg-white/5 text-white"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Draft the message your team wants to publish..."
              value={content}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Character limit for selected platforms: {characterLimit}
              </span>
              <span className={isOverLimit ? "font-semibold text-red-400" : "text-slate-400"}>
                {content.length}/{characterLimit}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Caption Studio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  className="border-white/10 bg-white/5 text-white"
                  id="topic"
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Launch day teaser for a new AI feature"
                  value={topic}
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select onValueChange={(value) => setTone(value as Tone)} value={tone}>
                  <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((toneOption) => (
                      <SelectItem key={toneOption} value={toneOption}>
                        {toneOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="bg-primary text-white hover:bg-indigo-500"
              disabled={isGeneratingCaptions}
              onClick={() => void handleGenerateCaptions()}
              type="button"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isGeneratingCaptions ? "Generating..." : "Generate Captions"}
            </Button>

            {captionVariants.length > 0 ? (
              <div className="grid gap-3">
                {captionVariants.map((variant, index) => (
                  <button
                    className="rounded-2xl border border-white/8 bg-white/4 p-4 text-left text-sm text-slate-300 transition hover:border-primary/40 hover:bg-primary/8"
                    key={`${variant}-${index}`}
                    onClick={() => setContent(variant)}
                    type="button"
                  >
                    {variant}
                  </button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader>
            <CardTitle className="text-white">Hashtags & Scheduling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {hashtags.map((hashtag) => (
                <Badge
                  className="cursor-pointer bg-white/6 text-slate-300"
                  key={hashtag}
                  onClick={() => setHashtags((current) => current.filter((item) => item !== hashtag))}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-3">
              <Input
                className="border-white/10 bg-white/5 text-white"
                onChange={(event) => setHashtagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addHashtag(hashtagInput);
                  }
                }}
                placeholder="#launchday"
                value={hashtagInput}
              />
              <Button onClick={() => addHashtag(hashtagInput)} type="button" variant="outline">
                Add
              </Button>
            </div>
            <Button
              disabled={isGeneratingHashtags}
              onClick={() => void handleGenerateHashtags()}
              type="button"
              variant="outline"
            >
              {isGeneratingHashtags ? "Suggesting..." : "Suggest Hashtags"}
            </Button>
            {hashtagSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtagSuggestions.map((suggestion) => (
                  <Badge
                    className="cursor-pointer bg-primary/12 text-primary"
                    key={suggestion}
                    onClick={() => addHashtag(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Publish Now</p>
                  <p className="text-xs text-slate-500">
                    Turn off to schedule for a later date and time.
                  </p>
                </div>
                <button
                  className={`h-7 w-12 rounded-full p-1 transition ${publishNow ? "bg-primary" : "bg-white/10"}`}
                  onClick={() => setPublishNow((current) => !current)}
                  type="button"
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition ${publishNow ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>

              {!publishNow ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    className="border-white/10 bg-white/5 text-white"
                    onChange={(event) => setScheduleDate(event.target.value)}
                    type="date"
                    value={scheduleDate}
                  />
                  <Input
                    className="border-white/10 bg-white/5 text-white"
                    onChange={(event) => setScheduleTime(event.target.value)}
                    type="time"
                    value={scheduleTime}
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={isSaving} onClick={() => void savePost("draft")} type="button" variant="outline">
                Save Draft
              </Button>
              <Button
                className="bg-primary text-white hover:bg-indigo-500"
                disabled={isSaving || isOverLimit}
                onClick={() => void savePost("scheduled")}
                type="button"
              >
                {isSaving ? "Saving..." : "Schedule Post"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader>
            <CardTitle className="text-white">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPlatforms.length === 0 ? (
              <StateBlock
                description="Select one or more platforms to preview how the post will look before scheduling."
                title="No platform selected"
              />
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map((platform) => (
                    <PlatformBadge key={platform} platform={platform} />
                  ))}
                </div>
                {isOverLimit ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">
                    This draft exceeds the current platform limit.
                  </div>
                ) : null}
                <div className="rounded-3xl border border-white/8 bg-[#0f1020] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Previewing</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {activePreviewPlatform ? PLATFORM_LABELS[activePreviewPlatform] : "Select a platform"}
                      </p>
                    </div>
                    <Badge className="bg-white/6 text-slate-300">
                      {activePreviewPlatform
                        ? PLATFORM_CHARACTER_LIMITS[activePreviewPlatform]
                        : "No preview"}
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-4 rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/15" />
                      <div>
                        <p className="text-sm font-semibold text-white">Brandify Agency</p>
                        <p className="text-xs text-slate-500">@brandifyagency</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {deferredContent || "Your draft preview will render here as you type."}
                    </p>
                    {hashtags.length > 0 ? (
                      <p className="text-sm text-primary">{hashtags.join(" ")}</p>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
