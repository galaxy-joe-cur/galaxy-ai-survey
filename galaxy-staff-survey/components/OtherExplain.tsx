type Props = {
  checked: boolean;
  onToggle: () => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
};

/** 封閉列表用的「其他（請說明）」＋文字欄 */
export default function OtherExplain({
  checked,
  onToggle,
  value,
  onChange,
  placeholder = "請說明",
  label = "其他（請說明）",
}: Props) {
  return (
    <>
      <label className="choice">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span>{label}</span>
      </label>
      {checked && (
        <input
          className="inline-other"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </>
  );
}
