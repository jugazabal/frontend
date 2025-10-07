
import ReactDOM from 'react-dom/client'
import { legacy_createStore as createStore, combineReducers } from 'redux'
import App from './App'
import './index.css'
import noteReducer, { createNote } from './reducers/noteReducer'
import filterReducer, { filterChange } from './reducers/filterReducer'

const reducer = combineReducers({
	notes: noteReducer,
	filter: filterReducer
})

const store = createStore(reducer)

store.subscribe(() => console.log(store.getState()))
store.dispatch(filterChange('IMPORTANT'))
store.dispatch(createNote('combineReducers forms one reducer from many simple reducers'))

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
