import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
  history: []
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1
      state.history.unshift({ type: 'increment', value: state.value, id: crypto.randomUUID() })
    },
    decrement(state) {
      state.value -= 1
      state.history.unshift({ type: 'decrement', value: state.value, id: crypto.randomUUID() })
    },
    reset(state) {
      state.value = 0
      state.history.unshift({ type: 'reset', value: 0, id: crypto.randomUUID() })
    },
    setValue(state, action) {
      state.value = action.payload
      state.history.unshift({ type: 'set', value: state.value, id: crypto.randomUUID() })
    }
  }
})

export const { increment, decrement, reset, setValue } = counterSlice.actions

export default counterSlice.reducer
