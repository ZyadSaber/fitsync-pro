"use client"

import { useState } from "react"
import SignInComponent from "./signInComponent"
import SignupComponent from "./SignupComponent"

export default function AuthScreen() {
    const [screen, setScreen] = useState<"signin" | "signup">("signin")

    return (
        <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="m-auto w-full max-w-[440px] px-6 py-10 md:px-10">
                {screen === "signin"
                    ? <SignInComponent onSwitchToSignup={() => setScreen("signup")} />
                    : <SignupComponent onSwitchToSignIn={() => setScreen("signin")} />
                }
            </div>
        </div>
    )
}
