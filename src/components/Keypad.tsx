import { Icon } from './Icon';
import type { KeypadKey } from '../lib/tx';

const KEYS: readonly KeypadKey[] = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '000', '0', 'back',
];

export function Keypad({ onKey }: { onKey: (key: KeypadKey) => void }) {
  return (
    <div className="keypad" role="group" aria-label="Keypad nominal">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`keypad__key num${key === 'back' ? ' keypad__key--action' : ''}`}
          onClick={() => onKey(key)}
          aria-label={key === 'back' ? 'Hapus satu digit' : `Angka ${key}`}
        >
          {key === 'back' ? <Icon name="backspace" /> : key}
        </button>
      ))}
    </div>
  );
}
