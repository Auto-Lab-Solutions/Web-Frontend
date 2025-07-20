import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const FormField = ({ 
  id, 
  name, 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  required = false, 
  tooltip,
  className,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-text-primary font-medium text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      </div>
      <div className="relative">
        <Input 
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "transition-all duration-200 focus:ring-2 focus:ring-border-tertiary/20",
            error ? "border-red-500 focus:border-red-500" : "border-border-secondary hover:border-border-tertiary/50 focus:border-border-tertiary",
            tooltip ? "pr-10" : "",
            className
          )}
          {...props}
        />
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-border-primary text-white text-xs flex items-center justify-center cursor-help hover:bg-border-secondary transition-colors">
                ?
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8} className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default FormField
