

# Make Prompt Card Buttons Smaller

## Change — `src/components/ai-chat/analyst-sections/NarrativePromptCard.tsx`

Make buttons compact and inline instead of full-width:

- Change button container from `flex flex-col gap-1.5` → `flex flex-wrap gap-1.5`
- Remove `w-full` from both buttons
- Reduce padding: `px-3 py-1.5` → `px-2.5 py-1`
- Reduce font: `text-[11px]` → `text-[10px]`
- Reduce card padding: `p-3` → `p-2.5`

Result: Compact pill-shaped buttons that sit side-by-side instead of stretching full width.

