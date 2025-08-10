export interface SafetyCopy {
  id: string; // contentId
  action: 'approve' | 'request_changes' | 'reject' | 'submit_for_review';
  title: string;
  content: string;
  notes?: string;
  createdAt: string; // ISO timestamp
}

const STORAGE_KEY = 'approval_safety_copies';

export function saveApprovalSafetyCopy(copy: SafetyCopy) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: Record<string, SafetyCopy> = raw ? JSON.parse(raw) : {};
    map[copy.id] = copy; // keep latest per contentId
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    // non-fatal
    console.warn('Failed to save safety copy', e);
  }
}

export function getApprovalSafetyCopy(contentId: string): SafetyCopy | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map: Record<string, SafetyCopy> = JSON.parse(raw);
    return map[contentId] ?? null;
  } catch {
    return null;
  }
}

export function clearApprovalSafetyCopy(contentId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const map: Record<string, SafetyCopy> = JSON.parse(raw);
    delete map[contentId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to clear safety copy', e);
  }
}
