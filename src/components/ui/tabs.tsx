'use client'

import * as React from "react"

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ")
}

// Simple Context
const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void }>({
    value: "",
    onValueChange: () => { },
})

export function Tabs({ defaultValue, className, children }: any) {
    const [value, setValue] = React.useState(defaultValue)
    return (
        <TabsContext.Provider value={{ value, onValueChange: setValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ className, children }: any) {
    return <div className={cn("flex", className)}>{children}</div>
}

export function TabsTrigger({ value, className, children }: any) {
    const context = React.useContext(TabsContext)
    const isActive = context.value === value
    return (
        <button
            onClick={() => context.onValueChange(value)}
            className={cn(className)}
            data-state={isActive ? "active" : "inactive"}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, className, children }: any) {
    const context = React.useContext(TabsContext)
    if (context.value !== value) return null
    return <div className={className}>{children}</div>
}
