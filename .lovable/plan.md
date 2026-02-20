
# Add Keyword/Topic Input as Step 1 in Content Wizard

## What Changes

The Content Wizard sidebar currently starts at "Solution" and relies on a keyword passed in from outside. We'll insert a new **"Topic"** step at the beginning so users can always enter or edit their keyword before anything else runs.

## Changes (1 file)

### `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`

1. **Update STEPS array** -- add a new first step `{ id: 0, label: 'Topic' }` and shift existing step IDs up by 1 (Solution becomes 2, Research becomes 3, etc.), making 6 total steps.

2. **Add topic input UI inline** -- when `currentStep === 0`, render a simple input field with:
   - A heading: "What would you like to write about?"
   - A text input pre-filled with the `keyword` prop (if provided)
   - A brief helper text: "Enter a keyword or topic for your content"
   - The input updates `wizardState.keyword`

3. **Update `canProceed`** -- add `case 0: return wizardState.keyword.trim().length >= 2;` so the user must type at least 2 characters.

4. **Shift all existing step cases** -- in both `canProceed` and the render section, bump case numbers by 1 (old case 1 becomes case 2, etc.).

5. **Update `goNext`/`goBack`** -- change bounds from `1..5` to `0..5` (start at 0, max remains the last step).

6. **Update initial state** -- `currentStep` starts at `0` instead of `1`.

No new files needed. The topic input is simple enough to be inline (an Input + label), keeping the wizard compact.

## Technical Details

```text
ContentWizardSidebar.tsx changes:
  - STEPS: prepend { id: 0, label: 'Topic' }
  - currentStep initial: 0 (was 1)
  - canProceed case 0: keyword.trim().length >= 2
  - All other cases shift +1
  - goBack: disabled when step === 0 (was 1)
  - goNext: max check stays at last step
  - Render: add step 0 with Input component for keyword
  - Header subtitle shows wizardState.keyword dynamically
```

## Result

| Scenario | Behavior |
|----------|----------|
| Wizard opens with keyword from AI | Topic step shows pre-filled, user can edit or click Next |
| Wizard opens with empty keyword | Topic step is empty, user must type a topic to proceed |
| User changes topic in step 0 | All downstream steps (Research, Outline) use the updated keyword |
