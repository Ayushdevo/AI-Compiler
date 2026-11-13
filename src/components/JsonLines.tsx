/** Render generated JSON as text: model output must never be interpreted as HTML. */
export function JsonLines({ text }: { text: string }) {
  return text.split('\n').map((line, index) => (
    <div key={index} className="flex hover:bg-[#122131]/20 font-mono py-0.5">
      <span className="w-10 shrink-0 select-none text-right text-[#465a73] pr-4 text-xs border-r border-[#152538]">
        {index + 1}
      </span>
      <span className="pl-4 text-xs whitespace-pre-wrap">{line}</span>
    </div>
  ));
}
