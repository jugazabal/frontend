# Redux Counter (Vite + Redux Toolkit)

A small counter example showing idiomatic React + Redux Toolkit structure. Compared to a single-file setup, this project demonstrates how to:

- Keep store configuration separate from React rendering logic
- Encapsulate feature state in slices
- Use React-Redux hooks (`useSelector`, `useDispatch`) instead of manual subscriptions
- Organize UI into feature-focused components

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Project structure

```
src/
├── App.jsx                # App layout
├── main.jsx               # React entry, wraps App with Provider
├── styles.css             # Global styles
├── store/
│   └── index.js           # configureStore + root reducer
└── features/
    └── counter/
        ├── Counter.jsx    # Counter UI + dispatches
        ├── CounterHistory.jsx
        └── counterSlice.js# Slice logic + actions
```

## Key improvements over the single-file example

- **Redux Toolkit** eliminates boilerplate and encourages immutable update patterns via Immer.
- **Provider + hooks** replace the manual `store.subscribe`/`renderApp` pattern.
- **Feature-first folder structure** keeps state and UI colocated.
- **History panel** demonstrates how derived UI can be driven from the same slice state.

Feel free to extend this example with additional slices or asynchronous logic using RTK Query or thunks.
