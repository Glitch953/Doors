export default function InteractionPrompt({ hint }) {
  if (!hint) return null
  return (
    <div className="interaction-prompt">
      <span className="prompt-dot" />
      <span>{hint}</span>
    </div>
  )
}
