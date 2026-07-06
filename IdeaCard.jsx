export default function IdeaCard({ idea, saved, onToggleSave, removeMode }) {
  return (
    <article className="idea-card">
      <div className="idea-top">
        <span className="idea-niche">{idea.niche}</span>
        <span className="score" title="Opportunity score">{idea.opportunity_score}</span>
      </div>
      <h3 className="idea-title">{idea.title}</h3>
      <p className="idea-desc">{idea.description}</p>
      <div className="idea-meta">
        <span className="tag">{idea.target_audience}</span>
        <span className="tag">{idea.difficulty}</span>
      </div>
      <button
        className={`save-btn ${removeMode ? 'remove' : saved ? 'saved' : ''}`}
        onClick={() => onToggleSave(idea)}
      >
        {removeMode ? 'Remove' : saved ? 'Saved ✓' : 'Save idea'}
      </button>
    </article>
  )
}
