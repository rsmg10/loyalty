import type { Ref } from 'vue';

export type MessageTone = 'success' | 'error' | 'info';
export type Message = { tone: MessageTone; text: string };

export function messageClass(tone: MessageTone) {
  const base = 'mt-2 rounded-xl px-3 py-2 text-xs font-semibold';
  if (tone === 'success') {
    return `${base} bg-tide/10 text-tide`;
  }
  if (tone === 'error') {
    return `${base} bg-ember/10 text-ember`;
  }
  return `${base} bg-dusk/10 text-dusk`;
}

export function setMessage(target: Ref<Message | null>, tone: MessageTone, text: string) {
  target.value = { tone, text };
}
