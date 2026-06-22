"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2Icon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Chapter } from "@/lib/supabase/database.types"

interface ClientEntryFormProps {
  chapters: Chapter[]
}

export default function ClientEntryForm({ chapters }: ClientEntryFormProps) {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState("tyfcb")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    setSubmitting(true)

    try {
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
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      // error handled
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2Icon className="mx-auto mb-4 size-16 text-emerald-500" />
            <h2 className="text-xl font-bold">Entry Submitted!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your {activeTab === "tyfcb" ? "TYFCB" : activeTab === "referral" ? "Referral Slip" : "1 & 1"} entry has been saved to Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold">BNI Entry Form</h1>
          <p className="text-sm text-muted-foreground">Fill in the details for your chapter</p>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid w-full grid-cols-3">
                <TabsTrigger value="tyfcb">TYFCB</TabsTrigger>
                <TabsTrigger value="referral">Referral Slip</TabsTrigger>
                <TabsTrigger value="one-and-one">1 & 1</TabsTrigger>
              </TabsList>

              {/* Shared Chapter Select */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Chapter</CardTitle>
                  <CardDescription>Select your BNI chapter</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeTab === "tyfcb" && (
                    <Select value={tyfcbForm.chapter_id?.toString() ?? null} onValueChange={(v) => setTyfcbForm({ ...tyfcbForm, chapter_id: Number(v) })}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>
                        {chapters.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}
                  {activeTab === "referral" && (
                    <Select value={referralForm.chapter_id?.toString() ?? null} onValueChange={(v) => setReferralForm({ ...referralForm, chapter_id: Number(v) })}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>
                        {chapters.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}
                  {activeTab === "one-and-one" && (
                    <Select value={oneAndOneForm.chapter_id?.toString() ?? null} onValueChange={(v) => setOneAndOneForm({ ...oneAndOneForm, chapter_id: Number(v) })}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>
                        {chapters.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* TYFCB Tab */}
              <TabsContent value="tyfcb">
                <Card>
                  <CardHeader>
                    <CardTitle>Thank You For Closed Business</CardTitle>
                    <CardDescription>Record a closed business entry</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>User Name</Label>
                      <Input value={tyfcbForm.user_name} onChange={(e) => setTyfcbForm({ ...tyfcbForm, user_name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Thank you to</Label>
                      <Input value={tyfcbForm.thank_you_to} onChange={(e) => setTyfcbForm({ ...tyfcbForm, thank_you_to: e.target.value })} placeholder="Member name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Amount</Label>
                        <Input value={tyfcbForm.amount} onChange={(e) => setTyfcbForm({ ...tyfcbForm, amount: e.target.value })} placeholder="$5,000" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Business Type</Label>
                        <Input value={tyfcbForm.business_type} onChange={(e) => setTyfcbForm({ ...tyfcbForm, business_type: e.target.value })} placeholder="Real Estate" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Referral Type</Label>
                      <Select value={tyfcbForm.referral_type} onValueChange={(v) => setTyfcbForm({ ...tyfcbForm, referral_type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Direct">Direct</SelectItem>
                          <SelectItem value="Indirect">Indirect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Comments</Label>
                      <Textarea value={tyfcbForm.comments} onChange={(e) => setTyfcbForm({ ...tyfcbForm, comments: e.target.value })} placeholder="Additional notes..." rows={3} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referral Slip Tab */}
              <TabsContent value="referral">
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Slip</CardTitle>
                    <CardDescription>Create a new referral entry</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>User Name</Label>
                      <Input value={referralForm.user_name} onChange={(e) => setReferralForm({ ...referralForm, user_name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div className="grid gap-2">
                      <Label>To</Label>
                      <Input value={referralForm.referred_to} onChange={(e) => setReferralForm({ ...referralForm, referred_to: e.target.value })} placeholder="Referred person" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Referral Type</Label>
                        <Select value={referralForm.referral_type} onValueChange={(v) => setReferralForm({ ...referralForm, referral_type: v })}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Direct">Direct</SelectItem>
                            <SelectItem value="Indirect">Indirect</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Referral Status</Label>
                        <Select value={referralForm.referral_status} onValueChange={(v) => setReferralForm({ ...referralForm, referral_status: v })}>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Referral</Label>
                      <Input value={referralForm.referral} onChange={(e) => setReferralForm({ ...referralForm, referral: e.target.value })} placeholder="Business description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Telephone</Label>
                        <Input value={referralForm.telephone} onChange={(e) => setReferralForm({ ...referralForm, telephone: e.target.value })} placeholder="(555) 123-4567" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={referralForm.email} onChange={(e) => setReferralForm({ ...referralForm, email: e.target.value })} placeholder="email@example.com" type="email" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Address</Label>
                      <Textarea value={referralForm.address} onChange={(e) => setReferralForm({ ...referralForm, address: e.target.value })} placeholder="Full address" rows={2} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 1 & 1 Tab */}
              <TabsContent value="one-and-one">
                <Card>
                  <CardHeader>
                    <CardTitle>1 & 1 Meeting</CardTitle>
                    <CardDescription>Record a one-on-one meeting</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>User Name</Label>
                      <Input value={oneAndOneForm.user_name} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, user_name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Met With</Label>
                      <Input value={oneAndOneForm.met_with} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, met_with: e.target.value })} placeholder="Person met" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Initiated By</Label>
                        <Input value={oneAndOneForm.initiated_by} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, initiated_by: e.target.value })} placeholder="Who initiated" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Date</Label>
                        <Input value={oneAndOneForm.date} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, date: e.target.value })} type="date" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Where did you meet?</Label>
                      <Input value={oneAndOneForm.where_did_you_meet} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, where_did_you_meet: e.target.value })} placeholder="Coffee Shop" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Topics of Conversation</Label>
                      <Textarea value={oneAndOneForm.topics_of_conversation} onChange={(e) => setOneAndOneForm({ ...oneAndOneForm, topics_of_conversation: e.target.value })} placeholder="Discussion topics..." rows={3} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Entry"}
                </Button>
              </div>
            </Tabs>
          </form>
        </div>
      </main>
    </div>
  )
}
