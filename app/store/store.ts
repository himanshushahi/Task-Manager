import React, { createContext, useContext, Dispatch } from "react";

// Define the shape of your state
interface State {
  authenticated: boolean;
}

// Define the shape of your actions
type Action = { type: "SET_AUTHENTICATE"; payload: boolean }; // Update based on your actual user type

// Initial state
export const initialState: State = {
  authenticated: false,
};

// Reducer function
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_AUTHENTICATE":
      return { ...state, authenticated: action.payload };
    default:
      return state;
  }
};

// Create contexts with appropriate types
export const GlobalStateContext = createContext<State | undefined>(undefined);
export const GlobalDispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined
);

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
