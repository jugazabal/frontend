# Fullstack Part 7: Custom Hooks - Agent Instructions

## Objective
The agent must understand and implement **Custom Hooks** in React to promote logic reuse and component modularity.

## Core Concepts & Rules

1.  **Purpose of Custom Hooks:** The primary goal is to **extract component logic** into reusable functions, making components cleaner and more maintainable.
2.  **Definition:** A Custom Hook is a regular JavaScript function that uses other built-in React Hooks (like `useState`, `useEffect`).
3.  **Naming Convention (Crucial Rule):** The name of every Custom Hook **must** start with the word `use` (e.g., `useCounter`, `useField`).
4.  **Rules of Hooks (Recap):** Adhere to the two main rules:
    * Always call Hooks at the **top level** of a function component or another Custom Hook.
    * **Do not** call Hooks inside loops, conditions, or nested functions.

## Implementation Instructions

### 1. Implement `useCounter` Hook (State/Logic Encapsulation)

Create a Custom Hook that encapsulates state management and its manipulation logic:

* **Function Signature:** `const useCounter = () => { ... }`
* **Internal Logic:** Use `useState` inside the hook to manage a counter value.
* **Return Value:** Return an object containing the current `value` and functions to manipulate it (`increase`, `decrease`, `zero`).

**Agent Action:** Implement and demonstrate the following structure:

```javascript
const useCounter = () => {
  const [value, setValue] = useState(0)
  const increase = () => { setValue(value + 1) }
  const decrease = () => { setValue(value - 1) }
  const zero = () => { setValue(0) }

  return {
    value,
    increase,
    decrease,
    zero
  }
}

// Usage Example (Demonstrate Reusability):
// const left = useCounter()
// const right = useCounter()