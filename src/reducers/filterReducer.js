const filterReducer = (state = 'ALL', action) => {
  switch (action.type) {
    case 'filters/changeFilter':
      return action.payload
    default:
      return state
  }
}

export const filterChange = (value) => ({
  type: 'filters/changeFilter',
  payload: value
})

export default filterReducer
