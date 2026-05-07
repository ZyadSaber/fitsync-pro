"use client"

import { useState } from "react"
import SignInComponent from "./signInComponent"
import SignupComponent from "./SignupComponent"

export default function AuthScreen() {
    const [screen, setScreen] = useState<"signin" | "signup">("signin")

    return (
        <div className="flex flex-1 items-center justify-center p-10 overflow-auto">
            <div className="w-full max-w-[440px]">
                {screen === "signin"
                    ? <SignInComponent onSwitchToSignup={() => setScreen("signup")} />
                    : <SignupComponent onSwitchToSignIn={() => setScreen("signin")} />
                }
            </div>
        </div>
    )
}
