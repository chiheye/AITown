"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface TutorialProps {
  onClose: () => void
}

export default function Tutorial({ onClose }: TutorialProps) {
  const [step, setStep] = useState(0)

  const tutorialSteps = [
    {
      title: "Welcome to AI Town!",
      content:
        "This is a simulation game where you can build and manage your own futuristic town with the help of AI. Let's get started with a quick tutorial.",
    },
    {
      title: "Navigation Controls",
      content:
        "Use your mouse to navigate around the town. Left-click and drag to rotate the camera, right-click and drag to pan, and use the scroll wheel to zoom in and out.",
    },
    {
      title: "Building Your Town",
      content:
        "Click on the 'Build' tab in the bottom-left panel to construct new buildings. Each building type serves a different purpose and costs resources.",
    },
    {
      title: "Managing Resources",
      content:
        "Keep an eye on your resources at the top of the screen. You'll need money to build and upgrade structures, and your population will grow as you expand.",
    },
    {
      title: "Interacting with AI",
      content:
        "Click on the chat button in the bottom-right corner to talk with the AI assistant. You can ask for advice, learn about your town's status, or just have a conversation!",
    },
  ]

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <div className="fixed inset-0 tutorial-overlay flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Tutorial ({step + 1}/{tutorialSteps.length})
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-2">{tutorialSteps[step].title}</h3>
          <p>{tutorialSteps[step].content}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            {step === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            {step !== tutorialSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
