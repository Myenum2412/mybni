"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCodeIcon } from "lucide-react"

export function QrPopup() {
  const [qrDataUrl, setQrDataUrl] = useState("")

  useEffect(() => {
    const formUrl = `${window.location.origin}/entry-form`
    QRCode.toDataURL(formUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl)
  }, [])

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon">
            <QrCodeIcon className="size-5" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan to Add Entry</DialogTitle>
          <DialogDescription>
            Scan this QR code on your phone to open the entry form
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="rounded-lg border" />
          ) : (
            <div className="flex h-[300px] w-[300px] items-center justify-center rounded-lg border bg-muted">
              <span className="text-sm text-muted-foreground">Generating QR...</span>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Point your camera at this code to open the BNI entry form
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
