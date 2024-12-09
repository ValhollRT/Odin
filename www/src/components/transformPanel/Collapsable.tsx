import React, { useState, useCallback } from 'react'
import "./transformPanel.css"

interface CollapsibleContextType {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined)

interface CollapsibleProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export const Collapsible: React.FC<CollapsibleProps> = ({ children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <CollapsibleContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="collapsible">{children}</div>
    </CollapsibleContext.Provider>
  )
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ children }) => {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error('CollapsibleTrigger must be used within a Collapsible')
  }
  const { isOpen, setIsOpen } = context

  const handleClick = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [setIsOpen])

  return (
    <div onClick={handleClick} className="collapsible-trigger cursor-pointer">
      {children}
    </div>
  )
}

interface CollapsibleContentProps {
  children: React.ReactNode
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ children }) => {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error('CollapsibleContent must be used within a Collapsible')
  }
  const { isOpen } = context

  if (!isOpen) return null

  return (
    <div className="collapsible-content">
      {children}
    </div>
  )
}