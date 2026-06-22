"use client"

import { useState, Suspense, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2Icon, QrCodeIcon, FileTextIcon, HeartHandshakeIcon, HandshakeIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Chapter } from "@/lib/supabase/database.types"

function EntryFormContent({ chapters }: { chapters: Chapter[] }) {
  const [activeTab, setActiveTab] = useState("tyfcb")
  const [submitted, setSubmitted] = useState(false)

  const [tyfcbForm, setTyfcbForm] = useState({
    chapter_id: null as number | null,
    user_name: "",
    thank_you_to: "",
    amount: "",
    business_type: "",
    referral_type: null as string | null,
    comments: "",
  })

  const [referralForm, setReferralForm] = useState({
    chapter_id: null as number | null,
    user_name: "",
    referred_to: "",
    referral_type: null as string | null,
    referral_status: null as string | null,
    referral: "",
    telephone: "",
    email: "",
    address: "",
  })

  const [oneAndOneForm, setOneAndOneForm] = useState({
    chapter_id: null as number | null,
    user_name: "",
    met_with: "",
    initiated_by: "",
    where_did_you_meet: "",
    date: "",
    topics_of_conversation: "",
  })

  const resetForms = () => {
    setTyfcbForm({ chapter_id: null, user_name: "", thank_you_to: "", amount: "", business_type: "", referral_type: null, comments: "" })
    setReferralForm({ chapter_id: null, user_name: "", referred_to: "", referral_type: null, referral_status: null, referral: "", telephone: "", email: "", address: "" })
    setOneAndOneForm({ chapter_id: null, user_name: "", met_with: "", initiated_by: "", where_did_you_meet: "", date: "", topics_of_conversation: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      if (activeTab === "tyfcb" && tyfcbForm.chapter_id) {
        await supabase.from("tyfcbs").insert({
          chapter_id: tyfcbForm.chapter_id,
          user_name: tyfcbForm.user_name,
          thank_you_to: tyfcbForm.thank_you_to,
          amount: tyfcbForm.amount,
          business_type: tyfcbForm.business_type,
          referral_type: tyfcbForm.referral_type ?? "",
          comments: tyfcbForm.comments || null,
        })
      } else if (activeTab === "referral" && referralForm.chapter_id) {
        await supabase.from("referrals").insert({
          chapter_id: referralForm.chapter_id,
          user_name: referralForm.user_name,
          referred_to: referralForm.referred_to,
          referral_type: referralForm.referral_type ?? "",
          referral_status: referralForm.referral_status ?? "Pending",
          referral: referralForm.referral,
          telephone: referralForm.telephone || null,
          email: referralForm.email || null,
          address: referralForm.address || null,
        })
      } else if (activeTab === "one-and-one" && oneAndOneForm.chapter_id) {
        await supabase.from("one_and_ones").insert({
          chapter_id: oneAndOneForm.chapter_id,
          user_name: oneAndOneForm.user_name,
          met_with: oneAndOneForm.met_with,
          initiated_by: oneAndOneForm.initiated_by,
          where_did_you_meet: oneAndOneForm.where_did_you_meet,
          date: oneAndOneForm.date,
          topics_of_conversation: oneAndOneForm.topics_of_conversation || null,
        })
      }
      setSubmitted(true)
      resetForms()
      setTimeout(() => setSubmitted(false), 2000)
    } catch {
      // handle error silently
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2Icon className="size-16 text-emerald-500" />
        <h3 className="text-lg font-semibold">Entry Submitted!</h3>
        <p className="text-sm text-muted-foreground">Your entry has been recorded successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="tyfcb"><HeartHandshakeIcon className="mr-1 size-3" /> TYFCB</TabsTrigger>
          <TabsTrigger value="referral"><FileTextIcon className="mr-1 size-3" /> Referral</TabsTrigger>
          <TabsTrigger value="one-and-one"><HandshakeIcon className="mr-1 size-3" /> 1 & 1</TabsTrigger>
        </TabsList>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Chapter</Label>
            <Select
              value={
                activeTab === "tyfcb" ? tyfcbForm.chapter_id?.toString() ??
                "" : activeTab === "referral" ? referralForm.chapter_id?.toString() ?? "" : oneAndOneForm.chapter_id?.toString() ?? ""
              }
              onValueChange={(v) => {
                const id = Number(v)
                if (activeTab === "tyfcb") setTyfcbForm({ ...tyfcbForm, chapter_id: id })
                else if (activeTab === "referral") setReferralForm({ ...referralForm, chapter_id: id })
                else setOneAndOneForm({ ...oneAndOneForm, chapter_id: id })
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
              <SelectContent>
                {chapters.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="tyfcb" className="mt-0 space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">User Name</Label>
              <Input value={tyfcbForm.user_name} onChange={(e) => setTyfcbForm({ ...tyfcbForm, user_name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Thank you to</Label>
              <Input value={tyfcbForm.thank_you_to} onChange={(e) => setTyfcbForm({ ...tyfcbForm, thank_you_to: e.target.value })} placeholder="Member name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Amount (₹)</Label>
                <Input value={tyfcbForm.amount} onChange={(e) => setTyfcbForm({ ...tyfcbForm, amount: e.target.value })} placeholder="5000" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Business Type</Label>
                <Input value={tyfcbForm.business_type} onChange={(e) => setTyfcbForm({ ...tyfcbForm, business_type: e.target.value })} placeholder="Real Estate" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Referral Type</Label>
              <Select value={tyfcbForm.referral_type} onValueChange={(v) => setTyfcbForm({ ...tyfcbForm, referral_type: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Indirect">Indirect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="referral" className="mt-0 space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">User Name</Label>
              <Input value={referralForm.user_name} onChange={(e) => setReferralForm({ ...referralForm, user_name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Referred To</Label>
              <Input value={referralForm.referred_to} onChange={(e) => setReferralForm({ ...referralForm, referred_to: e.target.value })} placeholder="Referred person" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={referralForm.referral_type} onValueChange={(v) => setReferralForm({ ...referralForm, referral_type: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Indirect">Indirect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={referralForm.referral_status} onValueChange={(v) => setReferralForm({ ...referralForm, referral_status: v ?? "Pending" })}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Referral</Label>
              <Input value={referralForm.referral} onChange={(e) => setReferralForm({ ...referralForm, referral: e.target.value })} placeholder="Business description" />
            </div>
          </TabsContent>

          <TabsContent value="one-and-one" className="mt-0 space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">User Name</Label>
              <Input value={oneAndOneForm.user_name} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, user_name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Met With</Label>
              <Input value={oneAndOneForm.met_with} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, met_with: e.target.value })} placeholder="Person met" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Initiated By</Label>
                <Input value={oneAndOneForm.initiated_by} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, initiated_by: e.target.value })} placeholder="Who initiated" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={oneAndOneForm.date} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, date: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Where did you meet?</Label>
              <Input value={oneAndOneForm.where_did_you_meet} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, where_did_you_meet: e.target.value })} placeholder="Coffee Shop" />
            </div>
          </TabsContent>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
            Submit Entry
          </Button>
        </div>
      </Tabs>
    </form>
  )
}

export function QrPopup() {
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])

  useEffect(() => {
    const formUrl = `${window.location.origin}/entry-form`
    QRCode.toDataURL(formUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl)

    // Fetch chapters for the inline form
    const supabase = createClient()
    supabase.from("chapters").select("*").order("id").then(({ data }) => {
      if (data) setChapters(data)
    })
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan to Add Entry</DialogTitle>
          <DialogDescription>
            Scan this QR code or fill the form below directly
          </DialogDescription>
        </DialogHeader>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2 border-b pb-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="rounded-lg border" />
          ) : (
            <div className="flex h-[150px] w-[150px] items-center justify-center rounded-lg border bg-muted">
              <span className="text-xs text-muted-foreground">Generating...</span>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            {qrDataUrl ? "Scan on your phone to open entry form" : "Loading QR code..."}
          </p>
        </div>

        {/* Inline Entry Form */}
        <div>
          <p className="mb-2 text-center text-sm font-medium text-muted-foreground">— Or fill directly —</p>
          <Suspense fallback={<div className="flex h-32 items-center justify-center"><span className="text-sm text-muted-foreground">Loading form...</span></div>}>
            <EntryFormContent chapters={chapters} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  )
}
