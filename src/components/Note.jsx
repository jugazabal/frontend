
const Note = ({ note, onToggle }) => {
  return (
    <li>
      {note.content} 
      <button onClick={onToggle}>
        make {note.important ? 'not important' : 'important'}
      </button>
    </li>
  )
}

export default Note
