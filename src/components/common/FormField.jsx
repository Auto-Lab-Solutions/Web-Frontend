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
        <Label htmlFor={id} className="text-text-primary font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-4 h-4 rounded-full bg-border-primary text-white text-xs flex items-center justify-center cursor-help hover:bg-border-secondary transition-colors">
                ?
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Input 
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={cn(
          "transition-all duration-200 focus:ring-2 focus:ring-border-tertiary/20 text-sm",
          error ? "border-red-500 focus:border-red-500" : "border-border-secondary hover:border-border-tertiary/50 focus:border-border-tertiary",
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default FormField
