
import ReactDOM from 'react-dom/client'
import { configureStore } from '@reduxjs/toolkit'
import App from './App'
import './index.css'
import noteReducer, { createNote } from './reducers/noteReducer'
import filterReducer, { filterChange } from './reducers/filterReducer'

const store = configureStore({
	reducer: {
		notes: noteReducer,
		filter: filterReducer
	}
})

store.subscribe(() => console.log(store.getState()))
store.dispatch(filterChange('IMPORTANT'))
store.dispatch(createNote('combineReducers forms one reducer from many simple reducers'))

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
