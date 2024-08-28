import { useEffect } from "react";
import { useGlobalDispatch, useGlobalState, userType } from "../store/store";

function UserInitialData() {
  const dispatch = useGlobalDispatch();
  const { user } = useGlobalState();

  if (dispatch === undefined) {
    throw new Error("useInitialData must be used within a GlobalProvider");
  }

  const getWorkSpace = async () => {
    try {
      const response = await fetch("/api/workspace", {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        dispatch({ type: "SET_WORKSPACE", payload: data.workSpaces });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (user !== null) {
      getWorkSpace();
    }
  }, [user]);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch(`/api/authenticate`, {
          credentials: "include",
        });

        const data = (await response.json()) as {
          success: boolean;
          user: userType;
        };
        if (data.success) {
          dispatch({ type: "SET_USER", payload: data.user });
        }
      } catch (error: any) {
        dispatch({ type: "SET_USER", payload: null });
      }
    };

    authenticateUser();
  }, [dispatch]);

  return <></>;
}

export default UserInitialData;
