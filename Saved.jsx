import IdeaCard from './IdeaCard'

export default function Saved({ savedIdeas, onToggleSave }) {
  return (
    <>
      <h1 className="page-title">Saved PDF ideas</h1>
      <p className="page-sub">Every idea you save is stored on your account, on any device.</p>

      {savedIdeas.length === 0 ? (
        <div className="empty">Nothing saved yet. Generate some ideas and hit "Save idea".</div>
      ) : (
        <div className="ideas-grid">
          {savedIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} removeMode onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </>
  )
}
