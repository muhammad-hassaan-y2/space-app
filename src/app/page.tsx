"use client"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

const celestialBodies = {
  sun: { 
    name: "Sun", 
    radius: 2, 
    color: "#FDB813", 
    type: "star", 
    description: "The Sun is the star at the center of our Solar System.", 
    orbitRadius: 0, 
    orbitPeriod: Infinity 
  },
  planets: [
    { name: "Mercury", radius: 0.1, orbitRadius: 4, color: "#A5A5A5", orbitPeriod: 0.24, type: "planet", description: "Mercury is the smallest planet in our Solar System and the closest to the Sun." },
    { name: "Venus", radius: 0.2, orbitRadius: 6, color: "#FFC649", orbitPeriod: 0.62, type: "planet", description: "Venus is often called Earth's twin because of their similar size and mass." },
    { name: "Earth", radius: 0.25, orbitRadius: 8, color: "#0077BE", orbitPeriod: 1, type: "planet", description: "Earth is the only known planet to support life and has one natural satellite, the Moon." },
    { name: "Mars", radius: 0.2, orbitRadius: 10, color: "#E27B58", orbitPeriod: 1.88, type: "planet", description: "Mars is often called the Red Planet due to its reddish appearance." },
  ],
  asteroids: [
    { name: "Ceres", radius: 0.05, orbitRadius: 12, color: "#8B8989", orbitPeriod: 4.6, type: "asteroid", description: "Ceres is the largest object in the asteroid belt between Mars and Jupiter." },
    { name: "Vesta", radius: 0.04, orbitRadius: 12.5, color: "#A0522D", orbitPeriod: 3.63, type: "asteroid", description: "Vesta is one of the largest asteroids in the Solar System." },
  ],
  comets: [
    { name: "Halley's Comet", radius: 0.08, orbitRadius: 14, color: "#87CEEB", orbitPeriod: 75, type: "comet", description: "Halley's Comet is a short-period comet visible from Earth every 75-76 years.", tail: true },
  ],
  pha: [
    { name: "Apophis", radius: 0.1, orbitRadius: 9, color: "#FF4500", orbitPeriod: 0.89, type: "pha", description: "Apophis is a near-Earth asteroid that caused a brief period of concern in December 2004." },
  ],
}

interface CelestialBodyProps {
  body: {
    name: string,
    radius: number,
    orbitRadius?: number,
    color: string,
    orbitPeriod?: number,
    type: string,
    description: string,
    tail?: boolean,
  },
  time: number,
  setSelectedBody: (body: CelestialBodyProps['body'] | null) => void
}

function CelestialBody({ body, time, setSelectedBody }: CelestialBodyProps) {
  const ref = useRef<THREE.Group>(null)
  const { radius, orbitRadius, color, orbitPeriod, tail } = body
  const angle = (time / orbitPeriod) * Math.PI * 2

  const position: [number, number, number] = [
    Math.cos(angle) * orbitRadius,
    0,
    Math.sin(angle) * orbitRadius,
  ]

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(...position)
    }
  })

  return (
    <group ref={ref}>
      <mesh 
        onClick={() => setSelectedBody(body)}
        onPointerOver={() => ref.current?.scale.set(1.1, 1.1, 1.1)} // Scale up on hover
        onPointerOut={() => ref.current?.scale.set(1, 1, 1)} // Scale back on hover out
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {tail && (
        <mesh position={[-radius * 2, 0, 0]}>
          <coneGeometry args={[radius / 2, radius * 4, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
      <Html>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-white text-xs bg-black bg-opacity-50 px-1 rounded"
        >
          {body.name}
        </motion.div>
      </Html>
    </group>
  )
}

function Orbit({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.05, 64]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Scene({ time, setSelectedBody }: { time: number, setSelectedBody: (body: CelestialBodyProps['body'] | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1.5} />
      <Stars radius={100} depth={60} count={7000} factor={5} saturation={0} fade speed={2} />

      {/* Sun */}
      <mesh onClick={() => setSelectedBody(celestialBodies.sun)}>
        <sphereGeometry args={[celestialBodies.sun.radius, 32, 32]} />
        <meshStandardMaterial color={celestialBodies.sun.color} emissive={celestialBodies.sun.color} emissiveIntensity={1.5} />
      </mesh>

      {/* Planets */}
      {celestialBodies.planets.map((planet) => (
        <React.Fragment key={planet.name}>
          <CelestialBody body={planet} time={time} setSelectedBody={setSelectedBody} />
          <Orbit radius={planet.orbitRadius} />
        </React.Fragment>
      ))}

      {/* Asteroids */}
      {celestialBodies.asteroids.map((asteroid) => (
        <React.Fragment key={asteroid.name}>
          <CelestialBody body={asteroid} time={time} setSelectedBody={setSelectedBody} />
          <Orbit radius={asteroid.orbitRadius} />
        </React.Fragment>
      ))}

      {/* Comets */}
      {celestialBodies.comets.map((comet) => (
        <React.Fragment key={comet.name}>
          <CelestialBody body={comet} time={time} setSelectedBody={setSelectedBody} />
          <Orbit radius={comet.orbitRadius} />
        </React.Fragment>
      ))}

      {/* Potentially Hazardous Asteroids (PHA) */}
      {celestialBodies.pha.map((pha) => (
        <React.Fragment key={pha.name}>
          <CelestialBody body={pha} time={time} setSelectedBody={setSelectedBody} />
          <Orbit radius={pha.orbitRadius} />
        </React.Fragment>
      ))}
    </>
  )
}

function InfoPanel({ selectedBody }: { selectedBody: CelestialBodyProps['body'] | null }) {
  if (!selectedBody) return null

  return (
    <Card className="absolute left-4 top-4 w-64 bg-opacity-80 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-yellow-400 font-bold">{selectedBody.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{selectedBody.description}</p>
        <p>Type: <span className="text-yellow-300">{selectedBody.type}</span></p>
        <p>Radius: {selectedBody.radius} units</p>
        <p>Orbit Radius: {selectedBody.orbitRadius} units</p>
        <p>Orbit Period: {selectedBody.orbitPeriod} Earth years</p>
      </CardContent>
    </Card>
  )
}

function InteractiveOrrery() {
  const [time, setTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [selectedBody, setSelectedBody] = useState<CelestialBodyProps['body'] | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let animationId: number
    const animate = () => {
      if (!paused) {
        setTime((prevTime) => prevTime + 0.01 * speed)
      }
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [speed, paused])

  return (
    <div className="w-full h-[600px] relative bg-gradient-to-b from-black to-gray-900 rounded-lg shadow-lg">
      <Canvas camera={{ position: [0, 20, 20], fov: 60 }}>
        <Scene time={time} setSelectedBody={setSelectedBody} />
        <OrbitControls />
      </Canvas>
      
      <InfoPanel selectedBody={selectedBody} />
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-gray-800 bg-opacity-90 backdrop-blur-sm p-4 rounded-lg shadow-md">
        <Button className="font-bold text-lg" onClick={() => setPaused(!paused)}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <div className="flex-1 mx-4">
          <Slider
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            min={0.1}
            max={5}
            step={0.1}
          />
        </div>
        <div className="text-lg font-bold">Speed: {speed.toFixed(1)}x</div>
      </div>
    </div>
  )
}

function DidYouKnow() {
  const facts = [
    "The Sun accounts for 99.86% of the mass in the Solar System.",
    "One day on Venus is longer than its year.",
    "Jupiter has the shortest day of all the planets.",
    "The Great Red Spot on Jupiter is a storm that has lasted for hundreds of years.",
  ]

  const [currentFact, setCurrentFact] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [facts.length])

  return (
    <Card className="w-full bg-opacity-80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-yellow-300 font-bold">Did You Know?</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-lg"
          >
            {facts[currentFact]}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default function SpaceEducationOrrery() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="bg-gray-800 py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-yellow-400">Space Education Orrery</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-yellow-300">Interactive Solar System</h2>
          <InteractiveOrrery />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-yellow-300">Fascinating Facts</h2>
          <DidYouKnow />
        </section>
      </main>

      <footer className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-yellow-300">&copy; 2024 Space Education Orrery. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="underline">Privacy Policy</a> | 
            <a href="#" className="underline ml-2">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
