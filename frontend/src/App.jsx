import { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

const API_URL = "https://it6yqu9u9d.execute-api.us-east-1.amazonaws.com/dev";
//import.meta.env.VITA_API_GATEWAY_URL;

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const callLambda = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Get the currently logged-in user's Cognito tokens
      const session = await fetchAuthSession();

      console.log("User ID:", session.userSub);

      const accessToken =
        session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error("No authentication token found");
      }

      // Call API Gateway
      const response = await fetch(
        `${API_URL}/hello`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status}`
        );
      }

      const data = await response.json();

      setMessage(data.message);
    } catch (error) {
      console.error("Error calling Lambda:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div
          style={{
            padding: "40px",
            fontFamily: "Arial",
          }}
        >
          <h1>AWS Prototype</h1>

          <p>
            Welcome,{" "}
            {user?.signInDetails?.loginId || "User"}
          </p>

          <button
            onClick={callLambda}
            disabled={loading}
          >
            {loading ? "Calling..." : "Call Lambda"}
          </button>

          {message && (
            <h3>
              Lambda response: {message}
            </h3>
          )}

          <br />

          <button onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </Authenticator>
  );
}

export default App;