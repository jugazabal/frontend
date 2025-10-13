
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import App from './App'
import './index.css'
import blogReducer from './reducers/blogReducer'
import filterReducer from './reducers/filterReducer'
import userReducer from './reducers/userReducer'
import notificationReducer from './reducers/notificationReducer'

const store = configureStore({
	reducer: {
		blogs: blogReducer,
		filter: filterReducer,
		user: userReducer,
		notification: notificationReducer
	}
})

store.subscribe(() => console.log(store.getState()))

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={queryClient}>
		<Provider store={store}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Provider>
	</QueryClientProvider>
)
