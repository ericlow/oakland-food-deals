"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SubmitDealDialog } from "./submit-deal-dialog"
import { Plus } from "lucide-react"

export function SubmitDealButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Submit Deal
      </Button>
      <SubmitDealDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
