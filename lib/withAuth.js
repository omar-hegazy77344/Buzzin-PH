// /src/utils/withAuth.js
import { useAuth } from "../lib/authContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!user) {
        router.replace("/login")
      }
    }, [user, router])

    if (!user) {
      return null // or a loading spinner
    }

    return <WrappedComponent {...props} />
  }

  ComponentWithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return ComponentWithAuth
}

export default withAuth