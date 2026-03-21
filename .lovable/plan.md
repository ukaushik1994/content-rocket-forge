

# Fix 7 Broken Routes (404s)

## Changes

All fixes are simple `navigate()` target replacements — no new files, no structural changes.

### File 1: `src/components/dashboard/QuickActionsGrid.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 146 | `/team` | `/ai-chat` |
| 164 | `/seo-tools` | `/keywords` |
| 182 | `/brand-guidelines` | `/offerings` |
| 200 | `/templates` | `/engage/email` |

### File 2: `src/components/dashboard/EnhancedQuickActions.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 90 | `/seo-tools` | `/keywords` |
| 101 | `/team` | `/ai-chat` |
| 112 | `/templates` | `/engage/email` |

### File 3: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 1043 | `/content` | `/repository` |

### File 4: `src/components/dashboard/RecentProjectsSection.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 69 | `/content` | `/repository` |
| 138 | `/content` | `/repository` |

### File 5: `src/components/content-repurposing/tour/ContentRepurposingTour.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 126 | `/content-repurposing` | `/ai-chat` |

### File 6: `src/components/landing/ai-showcase/AIProposalDemo.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 116 | `/content-strategy` | `/ai-proposals` |

### File 7: `src/components/research/content-strategy/SelectedProposalsSidebar.tsx`
| Line | Old Route | New Route |
|------|-----------|-----------|
| 270 | `/content-strategy?proposal=...` | `/ai-proposals?proposal=...` |

**7 files, ~12 line changes total.**

