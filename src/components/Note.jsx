
const Note = ({ note, onToggle, onDelete }) => {
  return (
    <li>
      {note.content} 
      <button
        onClick={onToggle}
        style={{
          color: note.important ? 'red' : 'blue',
          borderColor: note.important ? 'red' : 'blue',
          borderWidth: '1px',
          borderStyle: 'solid',
          background: 'white',
          marginLeft: '0.5em',
          marginRight: '0.5em',
          cursor: 'pointer'
        }}
      >
        make {note.important ? 'not important' : 'important'}
      </button>
      <button onClick={onDelete} style={{ marginLeft: '0.5em', color: 'red' }}>
        delete
      </button>
    </li>
  )
}

export default Note
