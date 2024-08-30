import { createContext, useContext, Dispatch } from "react";

export interface Task {
  _id: string;
  content: string;
  createdBy: string;
}

export interface Column {
  _id: string;
  title: string;
  tasks: Task[];
  createdBy: string;
}

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
  activeWorkSpaceColumn: Column[];
}

// Initial state
export const initialState: State = {
  workSpaces: [],
  user: null,
  activeWorkSpaceColumn: [],
};

// Define the shape of your actions
export type Action =
  | { type: "SET_WORKSPACE"; payload: WorkSpace[] }
  | { type: "ADD_WORKSPACE"; payload: WorkSpace }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | { type: "SET_USER"; payload: userType | null }
  | { type: "RESET_STATE" }
  | { type: "ADD_WOKSPACE_MEMBERS"; payload: { id: string; users: userType[] } }
  | {
      type: "DELETE_WORKSPACE_MEMBERS";
      payload: { id: string; userIds: string[] };
    }
  | {
      type: "SET_ACTIVE_WORKSPACE_COLUMN";
      payload: { columns: Column[] };
    }
  | {
      type: "ADD_COLUMN";
      payload: Column;
    }
  | {
      type: "DELETE_COLUMN";
      payload: { id: string };
    }
  | {
      type: "CREATE_TASK";
      payload: { columnId: string; task: Task };
    }
  | {
      type: "DELETE_TASK";
      payload: { columnId: string; taskId: string };
    }
  | {
      type: "UPDATE_TASK_POSITION";
      payload: {
        source: { droppableId: string; index: number };
        destination: { droppableId: string; index: number };
      };
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
    case "SET_ACTIVE_WORKSPACE_COLUMN":
      return { ...state, activeWorkSpaceColumn: action.payload.columns };
    case "ADD_COLUMN":
      return {
        ...state,
        activeWorkSpaceColumn: [...state.activeWorkSpaceColumn, action.payload],
      };
    case "DELETE_COLUMN":
      return {
        ...state,
        activeWorkSpaceColumn: state.activeWorkSpaceColumn.filter(
          (column) => column._id !== action.payload.id
        ),
      };
    case "CREATE_TASK":
      return {
        ...state,
        activeWorkSpaceColumn: state.activeWorkSpaceColumn.map((column) => {
          if (column._id === action.payload.columnId) {
            return {
              ...column,
              tasks: [...column.tasks, action.payload.task],
            };
          } else {
            return column;
          }
        }),
      };
    case "DELETE_TASK":
      return {
        ...state,
        activeWorkSpaceColumn: state.activeWorkSpaceColumn.map((column) => {
          if (column._id === action.payload.columnId) {
            return {
              ...column,
              tasks: column.tasks.filter(
                (task) => task._id !== action.payload.taskId
              ),
            };
          } else {
            return column;
          }
        }),
      };
    case "UPDATE_TASK_POSITION":
      const { source, destination } = action.payload;

      if (!destination) return state; // If there's no destination, do nothing

      const columns = state.activeWorkSpaceColumn;

      if (source.droppableId !== destination.droppableId) {
        const sourceColumn = columns.find(
          (column) => column._id === source.droppableId
        );
        if (!sourceColumn) return state;

        const destColumn = columns.find(
          (column) => column._id === destination.droppableId
        );
        if (!destColumn) return state;

        const sourceItems = [...sourceColumn.tasks];
        const destItems = [...destColumn.tasks];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);

        return {
          ...state,
          activeWorkSpaceColumn: columns.map((column) => {
            if (column._id === source.droppableId) {
              return { ...column, tasks: sourceItems };
            } else if (column._id === destination.droppableId) {
              return { ...column, tasks: destItems };
            } else {
              return column;
            }
          }),
        };
      } else {
        const sourceColumn = columns.find(
          (column) => column._id === source.droppableId
        );
        if (!sourceColumn) return state;

        const copiedItems = [...sourceColumn.tasks];
        const [removed] = copiedItems.splice(source.index, 1);
        copiedItems.splice(destination.index, 0, removed);

        return {
          ...state,
          activeWorkSpaceColumn: columns.map((column) =>
            column._id === source.droppableId
              ? { ...column, tasks: copiedItems }
              : column
          ),
        };
      }

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
