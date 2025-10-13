
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:backdrop-blur-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group toast group-[.toaster]:border-red-500/30 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-red-500/10 group-[.toaster]:via-red-600/10 group-[.toaster]:to-red-500/10 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-red-100 group-[.toaster]:shadow-lg group-[.toaster]:shadow-red-500/20 group-[.toaster]:ring-1 group-[.toaster]:ring-red-500/20",
          success: "group toast group-[.toaster]:border-green-500/30 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-green-500/10 group-[.toaster]:via-green-600/10 group-[.toaster]:to-green-500/10 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-green-100",
          warning: "group toast group-[.toaster]:border-yellow-500/30 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-yellow-500/10 group-[.toaster]:via-yellow-600/10 group-[.toaster]:to-yellow-500/10 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-yellow-100",
          info: "group toast group-[.toaster]:border-blue-500/30 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-blue-500/10 group-[.toaster]:via-blue-600/10 group-[.toaster]:to-blue-500/10 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-blue-100",
        },
      }}
      position="bottom-right"
      closeButton={true}
      duration={5000}
      expand={true}
      richColors={false}
      {...props}
    />
  )
}

export { Toaster, toast }
