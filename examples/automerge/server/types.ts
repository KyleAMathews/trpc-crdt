import { idText } from "typescript"

export interface User {
  id: string
  name: string
}

export interface UsersDoc {
  users: { [id: string]: User }
}
