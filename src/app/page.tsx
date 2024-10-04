"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html, Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Enhanced celestial body data including all planets
const celestialBodies = {
  sun: { name: "Sun", radius: 2, color: "#FDB813", type: "star", description: "The Sun is the star at the center of our Solar System." },
  planets: [
    { name: "Mercury", radius: 0.1, orbitRadius: 4, color: "#A5A5A5", orbitPeriod: 0.24, type: "planet", description: "Mercury is the smallest planet in our Solar System and the closest to the Sun." },
    { name: "Venus", radius: 0.2, orbitRadius: 6, color: "#FFC649", orbitPeriod: 0.62, type: "planet", description: "Venus is often called Earth's twin because of their similar size and mass." },
    { name: "Earth", radius: 0.2, orbitRadius: 8, color: "#0077BE", orbitPeriod: 1, type: "planet", description: "Earth is the only known planet to support life and has one natural satellite, the Moon.", 
      moon: { name: "Moon", radius: 0.05, orbitRadius: 0.4, color: "#C0C0C0", orbitPeriod: 0.0748, type: "moon", description: "The Moon is Earth's only natural satellite and the fifth largest moon in the Solar System." }
    },
    { name: "Mars", radius: 0.15, orbitRadius: 10, color: "#E27B58", orbitPeriod: 1.88, type: "planet", description: "Mars is often called the Red Planet due to its reddish appearance." },
    { name: "Jupiter", radius: 0.5, orbitRadius: 14, color: "#E0A064", orbitPeriod: 11.86, type: "planet", description: "Jupiter is the largest planet in our Solar System and has a prominent Great Red Spot." },
    { name: "Saturn", radius: 0.4, orbitRadius: 18, color: "#F4D098", orbitPeriod: 29.46, type: "planet", description: "Saturn is known for its prominent ring system, composed mainly of ice particles with a smaller amount of rocky debris and dust." },
    { name: "Uranus", radius: 0.3, orbitRadius: 22, color: "#B3E5FC", orbitPeriod: 84.01, type: "planet", description: "Uranus is an ice giant with a tilted axis of rotation, causing extreme seasons." },
    { name: "Neptune", radius: 0.3, orbitRadius: 26, color: "#4682B4", orbitPeriod: 164.79, type: "planet", description: "Neptune is the windiest planet in our Solar System and has a Great Dark Spot similar to Jupiter's Great Red Spot." },
  ],
}

function CelestialBody({ body, time, setSelectedBody, parentPosition = [0, 0, 0] }) {
  const ref = useRef()
  const { radius, orbitRadius, color, orbitPeriod } = body
  const angle = (time / orbitPeriod) * Math.PI * 2

  const position = [
    Math.cos(angle) * orbitRadius + parentPosition[0],
    0,
    Math.sin(angle) * orbitRadius + parentPosition[2]
  ]

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(...position)
    }
  })

  return (
    <group ref={ref}>
      <mesh onClick={() => setSelectedBody(body)}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html>
        <div className="text-white text-xs bg-black bg-opacity-50 px-1 rounded">
          {body.name}
        </div>
      </Html>
      {body.moon && (
        <CelestialBody body={body.moon} time={time} setSelectedBody={setSelectedBody} parentPosition={[0, 0, 0]} />
      )}
    </group>
  )
}

function Orbit({ radius, parentPosition = [0, 0, 0] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={parentPosition}>
      <ringGeometry args={[radius, radius + 0.05, 64]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  )
}

function SolarSystem({ time, setSelectedBody }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Sun */}
      <mesh onClick={() => setSelectedBody(celestialBodies.sun)}>
        <sphereGeometry args={[celestialBodies.sun.radius, 32, 32]} />
        <meshStandardMaterial color={celestialBodies.sun.color} emissive={celestialBodies.sun.color} emissiveIntensity={0.5} />
      </mesh>

      {/* Planets */}
      {celestialBodies.planets.map((planet) => (
        <React.Fragment key={planet.name}>
          <CelestialBody body={planet} time={time} setSelectedBody={setSelectedBody} />
          <Orbit radius={planet.orbitRadius} />
          {planet.moon && (
            <Orbit radius={planet.moon.orbitRadius} parentPosition={[
              Math.cos((time / planet.orbitPeriod) * Math.PI * 2) * planet.orbitRadius,
              0,
              Math.sin((time / planet.orbitPeriod) * Math.PI * 2) * planet.orbitRadius
            ]} />
          )}
        </React.Fragment>
      ))}
    </>
  )
}

function MilkyWay() {
  const galaxyTexture = useTexture('/placeholder.svg?height=1024&width=1024')
  const galaxyRef = useRef()

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005
    }
  })

  return (
    <group ref={galaxyRef}>
      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={galaxyTexture} side={THREE.BackSide} transparent opacity={0.7} />
      </mesh>
      <Stars radius={49} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
    </group>
  )
}

function InfoPanel({ selectedBody }) {
  if (!selectedBody) return null

  return (
    <Card className="absolute left-4 top-4 w-64 bg-opacity-80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{selectedBody.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{selectedBody.description}</p>
        <p>Type: {selectedBody.type}</p>
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
  const [selectedBody, setSelectedBody] = useState(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let animationId
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
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 30, 30], fov: 60 }}>
        <SolarSystem time={time} setSelectedBody={setSelectedBody} />
        <OrbitControls />
      </Canvas>
      
      <InfoPanel selectedBody={selectedBody} />
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-opacity-80 backdrop-blur-sm p-4 rounded-lg">
        <Button onClick={() => setPaused(!paused)}>
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
        <div>Speed: {speed.toFixed(1)}x</div>
      </div>
    </div>
  )
}

function MilkyWayAnimation() {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 60], fov: 60 }}>
        <MilkyWay />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}

function HistoricalSolarSystem({ model }) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const animationId = requestAnimationFrame(function animate() {
      setTime((prevTime) => prevTime + 0.01)
      requestAnimationFrame(animate)
    })
    return () => cancelAnimationFrame(animationId)
  }, [])

  const geocentricModel = [
    { name: "Earth", radius: 0.3, orbitRadius: 0, color: "#0077BE" },
    { name: "Moon", radius: 0.1, orbitRadius: 2, color: "#C0C0C0", orbitPeriod: 1 },
    { name: "Sun", radius: 0.5, orbitRadius: 5, color: "#FDB813", orbitPeriod: 7 },
    { name: "Mercury", radius: 0.1, orbitRadius: 3, color: "#A5A5A5", orbitPeriod: 3 },
    { name: "Venus", radius: 0.15, orbitRadius: 4, color: "#FFC649", orbitPeriod: 5 },
    { name: "Mars", radius: 0.12, orbitRadius: 6, color: "#E27B58", orbitPeriod: 9 },
    { name: "Jupiter", radius: 0.2, orbitRadius: 7, color: "#E0A064", orbitPeriod: 11 },
    { name: "Saturn", radius: 0.18, orbitRadius: 8, color: "#F4D098", orbitPeriod: 13 },
  ]

  const heliocentricModel = [
    { name: "Sun", radius: 1, orbitRadius: 0, color: "#FDB813" },
    { name: "Mercury", radius: 0.1, orbitRadius: 2, color: "#A5A5A5", orbitPeriod: 0.24 },
    { name: "Venus", radius: 0.15, orbitRadius: 3, color: "#FFC649", orbitPeriod: 0.62 },
    { name: "Earth", radius: 0.2, orbitRadius: 4, color: "#0077BE", orbitPeriod: 1,
      moon: { name: "Moon", radius: 0.05, orbitRadius: 0.4, color: "#C0C0C0", orbitPeriod: 0.0748 }
    },
    { name: "Mars", radius: 0.15, orbitRadius: 5, color: "#E27B58", orbitPeriod: 1.88 },
    { name: "Jupiter", radius: 0.4, orbitRadius: 7, color: "#E0A064", orbitPeriod: 11.86 },
    { name: "Saturn", radius: 0.35, orbitRadius: 9, color: "#F4D098", orbitPeriod: 29.46 },
  ]

  const bodies = model === 'geocentric' ? geocentricModel : heliocentricModel

  return (
    <Canvas camera={{ position: [0, 15, 15], fov: 60 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1} />
      {bodies.map((body) => (
        <React.Fragment key={body.name}>
          <CelestialBody body={body} time={time} setSelectedBody={() => {}} />
          {body.orbitRadius > 0 && <Orbit radius={body.orbitRadius} />}
        </React.Fragment>
      ))}
      <OrbitControls />
    </Canvas>
  )
}

function PlanetDetail({ planet }) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const animationId = requestAnimationFrame(function animate() {
      setRotation((prevRotation) => (prevRotation + 0.01) % (2 * Math.PI))
      requestAnimationFrame(animate)
    })
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="w-full h-[400px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh rotation={[0, rotation, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={planet.color} />
        </mesh>
        {planet.moon && (
          <mesh position={[Math.cos(rotation * 5) * 2, 0, Math.sin(rotation * 5) * 2]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color={planet.moon.color} />
          </mesh>
        )}
        <OrbitControls enableZoom={false} />
      </Canvas>
      <div className="absolute bottom-4 left-4 right-4 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-2">{planet.name}</h3>
        <p>{planet.description}</p>
      </div>
    </div>
  )
}

function SolarSystemModels() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Geocentric Model (Ancient)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <HistoricalSolarSystem model="geocentric" />
          </div>
          <p className="mt-4">
            The geocentric model, proposed by ancient Greek astronomers, placed Earth at the center of the universe with other celestial bodies orbiting around it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Heliocentric Model (Copernican)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <HistoricalSolarSystem model="heliocentric" />
          </div>
          <p className="mt-4">
            The heliocentric model, proposed by Nicolaus Copernicus in the 16th century, correctly placed the Sun at the center of the Solar System with planets orbiting around it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modern Solar System Model</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveOrrery />
          <p className="mt-4">
            Our current understanding of the Solar System includes eight planets, numerous dwarf planets, asteroids, comets, and other celestial bodies all orbiting the Sun.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function PlanetaryDetails() {
  return (
    <Tabs defaultValue="mercury" className="w-full">
      <TabsList>
        {celestialBodies.planets.map((planet) => (
          <TabsTrigger key={planet.name} value={planet.name.toLowerCase()}>{planet.name}</TabsTrigger>
        ))}
      </TabsList>
      {celestialBodies.planets.map((planet) => (
        <TabsContent key={planet.name} value={planet.name.toLowerCase()}>
          <PlanetDetail planet={planet} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function EnhancedSpaceEducationOrrery() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-800 to-purple-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Enhanced Space Education Orrery</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        <section>
          <h2 className="text-3xl font-bold mb-6">Interactive Solar System</h2>
          <InteractiveOrrery />
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Milky Way Galaxy</h2>
          <MilkyWayAnimation />
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Solar System Models Through History</h2>
          <SolarSystemModels />
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Planetary Details</h2>
          <PlanetaryDetails />
        </section>
      </main>

      <footer className="bg-gradient-to-r from-blue-800 to-purple-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">&copy; 2024 Enhanced Space Education Orrery. All rights reserved.</p>
          <p className="mt-2 text-lg">
            <a href="#" className="underline hover:text-blue-300 transition-colors">Privacy Policy</a> | 
            <a href="#" className="underline ml-2 hover:text-blue-300 transition-colors">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  )
}