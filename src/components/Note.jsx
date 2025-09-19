
const Note = ({ note, onToggle, onDelete }) => {
  return (
    <li>
      {note.content} 
      <button onClick={onToggle}>
        make {note.important ? 'not important' : 'important'}
      </button>
      <button onClick={onDelete} style={{ marginLeft: '0.5em', color: 'red' }}>
        delete
      </button>
    </li>
  )
}

export default Note
