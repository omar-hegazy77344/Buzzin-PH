// /src/components/Login.js
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { useRouter } from "next/navigation"
import {useAuth} from "../lib/authContext";
import { useEffect , useRef} from "react";



const Login = () => {
    const inputRefs = useRef([]);
  // code for the bluring of Foucus and Unfocus feilds
    useEffect(() => {
          const inputs = inputRefs.current;
      
          const handleFocus = (event) => {
            const parent = event.target.parentNode;
            parent.classList.add("focus");
            parent.classList.add("not-empty");
          };
      
          const handleBlur = (event) => {
            const parent = event.target.parentNode;
            if (event.target.value === "") {
              parent.classList.remove("not-empty");
            }
            parent.classList.remove("focus");
          };
      
          // Add event listeners
          inputs.forEach((input) => {
            input.addEventListener("focus", handleFocus);
            input.addEventListener("blur", handleBlur);
          });
        
          // Cleanup: remove event listeners
          return () => {
            inputs.forEach((input) => {
              if (input && (input.tagName === "INPUT" || input.tagName === "TEXTAREA")) {
                input.addEventListener("focus", handleFocus);
                input.addEventListener("blur", handleBlur);
              }
            });
        };
        
        }, []);

  const { user } = useAuth();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setloginError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault();
    setloginError(null); // Reset any previous errors
    console.log("Attempting to log in with:", email, password);
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/") // Navigate to the home page
    } catch (error) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        // Expected error: user does not exist or wrong password
        setloginError("Invalid email or password.");
      } else {
        // Log other unexpected errors
        console.error("Unexpected error:", error);
        setloginError("Something went wrong. Please try again later.");
      }
    }
  }

  useEffect(() => {
        if (user) {
          router.replace("/")
        }
      }, [user, router])
  
  return (
    <div className="contact">
      <div className="wrapper">
      <h2>Login</h2>
    <form
      onSubmit={handleLogin}
      className="contact-form"
    >
      <div className="input-wrap ">
      <input
        ref={(el) => (inputRefs.current[0] = el)}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="contact-input"
      />
      <label >Email</label>
      </div>
      <div className="input-wrap ">
      <input
        ref={(el) => (inputRefs.current[1] = el)}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="contact-input"
      />
        <label >Password</label>
      </div>
      {!loginError &&(<button
        type="submit"
        className="ibtn"
      >
        Login
      </button>)}
      {loginError && (
      <div className="error-box">
        {loginError}
        <br/>
        <br/>
        <button className="btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
      )}
    </form>
    </div>
    </div>
  )
}

export default Login