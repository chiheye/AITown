"use client"

import { useEffect, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from "@react-three/postprocessing"
import Town from "@/components/town/Town"
import Interface from "@/components/ui/Interface"
import ChatInterface from "@/components/ui/ChatInterface"
import LoadingScreen from "@/components/ui/LoadingScreen"
import LLMConfig from "@/components/ui/LLMConfig"
import { GameProvider } from "@/context/GameContext"
import { LLMProvider } from "@/context/LLMContext"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [performanceMode, setPerformanceMode] = useState(true)

  useEffect(() => {
    // 模拟加载资源
    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowTutorial(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <GameProvider>
      <LLMProvider>
        <main className="relative w-full h-screen overflow-hidden">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <>
              <Canvas shadows>
                <Suspense fallback={null}>
                  <PerspectiveCamera makeDefault position={[50, 50, 50]} fov={50} />

                  <fog attach="fog" args={["#c9e8ff", 0.005, 500]} />

                  <Town />

                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={10}
                    maxDistance={200}
                    maxPolarAngle={Math.PI / 2.1}
                  />

                  {!performanceMode && (
                    <EffectComposer>
                      <Bloom intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.9} />
                      <ChromaticAberration offset={[0.0005, 0.0005]} />
                      <DepthOfField focusDistance={0.01} focalLength={0.2} bokehScale={3} />
                      <Noise opacity={0.02} />
                    </EffectComposer>
                  )}
                </Suspense>
              </Canvas>
              <LLMConfig />
              <Interface showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
              <ChatInterface />
            </>
          )}
        </main>
      </LLMProvider>
    </GameProvider>
  )
}
