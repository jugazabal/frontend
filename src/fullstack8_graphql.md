# Fullstack Part 8: GraphQL Server - Agent Instructions

## Objective
The agent must transition from the REST architecture used in previous parts to implementing a **GraphQL server**. This involves understanding GraphQL's core principles, setting up a server with **Apollo Server**, and defining the necessary schema and resolvers.

---

## 1. Understand GraphQL Fundamentals

The agent must grasp the key philosophical differences between REST and GraphQL:

| Feature | REST | GraphQL |
| :--- | :--- | :--- |
| **Philosophy** | **Resource-based**. Each resource has its own unique URL (`/users/10`). Operations determined by HTTP method (GET, POST, PUT). | **Query-based**. The client dictates the exact data shape needed. All queries are sent to a **single endpoint** (e.g., `/graphql`) via an HTTP **POST** request. |
| **Data Fetching** | Returns fixed data structures, often leading to **over-fetching** (receiving more data than necessary). | Returns data structure defined precisely by the client's query, avoiding over/under-fetching. |
| **Data Source** | The server dictates the response format. | The server provides a **schema**; the server's implementation (resolvers) can fetch data from any source (databases, other REST services, etc.). |

## 2. Server Setup: Apollo Server

The agent will use **Apollo Server** to implement the GraphQL API.

* **Project Initialization:**
    ```bash
    npm init
    npm install @apollo/server graphql
    ```
* **Server Core Implementation:** The server instance is created by passing two main parameters:
    1.  **`typeDefs`**: The GraphQL Schema (written in Schema Definition Language - SDL).
    2.  **`resolvers`**: A set of functions that define how to fetch the data for each field in the schema.

## 3. Define the GraphQL Schema (`typeDefs`)

The agent must define the data structure and the queries available to the client using the Schema Definition Language (SDL).

### 3.1. Define Custom Types

* Define the structure of a core entity (e.g., a `Person` in a phonebook application).
* Use GraphQL **Scalar Types** (e.g., `String`, `Int`, `Boolean`, `ID`).
* The exclamation mark (`!`) signifies a **non-nullable** field (a value must be returned).

**Agent Action (Example: Phonebook):**

```graphql
type Person {
  name: String!
  phone: String
  street: String!
  city: String!
  id: ID!
}