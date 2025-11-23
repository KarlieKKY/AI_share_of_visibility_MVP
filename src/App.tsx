import { useState, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import { supabase } from "../utils/supabase";
import "./App.css";

function App() {
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from("test_table").select("*");
        if (error) {
          console.error("Error fetching data from Supabase:", error);
        } else {
          console.log("Data fetched from Supabase:", data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    testSupabaseConnection();
  }, []);

  return (
    <>
      <h1>Supabase Client Initialized</h1>
    </>
  );
}

export default App;
