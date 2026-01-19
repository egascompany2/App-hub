import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="text-lg mb-8 text-center max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">
          Return Home
        </Link>
      </Button>
    </div>
  )
}