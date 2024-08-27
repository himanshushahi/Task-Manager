import { createContext, useContext, Dispatch } from "react";

export type userType = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
};

type WorkSpace = {
  _id: string;
  name: string;
  members: userType[];
};

// Define the shape of your state
interface State {
  workSpaces: WorkSpace[];
  user: userType | null;
}

// Initial state
export const initialState: State = {
  workSpaces: [],
  user: null,
};

// Define the shape of your actions
type Action =
  | { type: "SET_WORKSPACE"; payload: WorkSpace[] }
  | { type: "ADD_WORKSPACE"; payload: WorkSpace }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | { type: "SET_USER"; payload: userType | null }
  | { type: "RESET_STATE" }
  | { type: "ADD_WOKSPACE_MEMBERS"; payload: { id: string; users: userType[] } }
  | {
      type: "DELETE_WORKSPACE_MEMBERS";
      payload: { id: string; userIds: string[] };
    };

// Reducer function
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_WORKSPACE":
      return { ...state, workSpaces: action.payload };
    case "ADD_WORKSPACE":
      return { ...state, workSpaces: [...state.workSpaces, action.payload] };
    case "DELETE_WORKSPACE":
      return {
        ...state,
        workSpaces: state.workSpaces.filter(
          (workspace) => workspace._id !== action.payload
        ),
      };
    case "ADD_WOKSPACE_MEMBERS":
      return {
        ...state,
        workSpaces: state.workSpaces.map((workspace) => {
          if (workspace._id === action.payload.id) {
            return {
              ...workspace,
              members: [...workspace.members, ...action.payload.users],
            };
          } else {
            return workspace;
          }
        }),
      };
    case "DELETE_WORKSPACE_MEMBERS":
      return {
        ...state,
        workSpaces: state.workSpaces.map((workspace) => {
          if (workspace._id === action.payload.id) {
            return {
              ...workspace,
              members: workspace.members.filter(
                (user) => !action.payload.userIds.includes(user._id)
              ),
            };
          } else {
            return workspace;
          }
        }),
      };

    case "SET_USER":
      return { ...state, user: action.payload };
    case "RESET_STATE":
      return (state = initialState);
    default:
      return state;
  }
};

// Create contexts with appropriate types
export const GlobalStateContext = createContext<State | undefined>(undefined);
export const GlobalDispatchContext = createContext<
  Dispatch<Action> | undefined
>(undefined);

// Custom hooks to use context values
export const useGlobalState = (): State => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalProvider");
  }
  return context;
};

export const useGlobalDispatch = (): Dispatch<Action> => {
  const context = useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error("useGlobalDispatch must be used within a GlobalProvider");
  }
  return context;
};
