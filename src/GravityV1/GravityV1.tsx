import { Blur } from "konva/lib/filters/Blur"
import { useEffect, useMemo, useRef, useState } from "react"
import { Ellipse, Layer, Rect, Stage, Text } from "react-konva"

export const GravityV1 = ({ WIDTH, HEIGHT }: { WIDTH: number, HEIGHT: number }) => {


    type point = {
        pos: { x: number, y: number },
        vel: { x: number, y: number },
        type: "matter" | "dark",
        force: { x: number, y: number },
        mass: number
    }


    const NUMPOINTS = 100
    const TICKTIME = 10 //ms
    const TIMEBOOST = 10000
    const MAXMASS = 100
    const MAXSPAWNMASS = 100
    const MAXRANDSPEED = 0

    const [points, setPoints] = useState<point[]>([])
    const [tick, setTick] = useState<number>(0)
    const posNegRand = () => {
        return Math.random() > 0.5 ? true : false
    }

    const findHypot = (x: number, y: number) => {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
    }

    const getPointRadius = (p: point) => {
        // if (p.mass > MAXMASS) {
        //     return 1
        // }
        return Math.max((p.mass / (MAXMASS) * 5), 1)
    }

    const findOA = (brg: number, hypot: number) => {
        let O = Math.sin(brg) * hypot
        let A = Math.cos(brg) * hypot
        if (isNaN(O)) {
            console.log("NAN for a force sin :-( " + brg + " | " + hypot)
            O = 0
        }
        if (isNaN(A)) {
            console.log("NAN for a force cos :-(")
            A = 0
        }
        if (isNaN(brg)) {
            console.log("Nan bearing")
        }

        return [O, A]
        // return [!isNaN(O) ? -O : 100, !isNaN(A) ? -A : 100]

    }

    const getPointDistance = (p1: point, p2: point) => {
        const pos1 = p1.pos
        const pos2 = p2.pos
        const posDiff = { x: pos1.x - pos2.x, y: pos1.y - pos2.y }
        const dist = findHypot(posDiff.x, posDiff.y)
        if (dist == Infinity) {
            return 0
        }
        return dist
    }

    const getBearing = (p1: point, p2: point) => {
        const pos1 = p1.pos
        const pos2 = p2.pos
        if (p1.pos.x == p2.pos.x || p1.pos.y == p2.pos.y)
            return 0
        return Math.atan2((pos1.y - pos2.y), (pos1.x - pos2.x))
    }

    const isClose: (a: number, b: number, diff?: number) => boolean = (a: number, b: number, diff: number = 0.5) => {
        if (Math.abs(a - b) < diff) {
            return true
        }
        return false
    }

    const newRandPoint: () => point = () => {
        return {
            pos: { x: Math.random() * WIDTH, y: Math.random() * HEIGHT },
            vel: {
                x: posNegRand() ? Math.random() * MAXRANDSPEED : Math.random() * -MAXRANDSPEED, y: posNegRand() ? Math.random() * MAXRANDSPEED : Math.random() * -MAXRANDSPEED
            },
            type: Math.random() > 0 ? "matter" : "dark",
            force: { x: 0, y: 0 },
            mass: Math.max(Math.random() * MAXSPAWNMASS, 5)
            // mass: MAXSPAWNMASS
        }
    }

    const superNovaPoints = (superNova: point) => {
        const tempPoints: point[] = []
        // for (let i = 0; i < superNova.mass / split; i + split) {
        // const velBrg = ((i/split) * superNova.mass ) / (superNova.mass / split)
        const dispersal = 50
        for (let i = 0; i < 10; i++) {

            const velBrg = posNegRand() ? Math.random() * 2 : Math.random() * -2
            const [velX, velY] = findOA(velBrg, 5)
            // const velX = 0
            // const velY = 0
            tempPoints.push({
                pos: { x: superNova.pos.x + (posNegRand() ? -dispersal * Math.random() : dispersal * Math.random()), y: superNova.pos.y + (posNegRand() ? -dispersal * Math.random() : dispersal * Math.random()) },
                vel: {
                    x: velX,
                    y: velY

                },
                type: "matter",
                force: { x: 0, y: 0 },

                mass: superNova.mass / 10
            })
            // tempPoints.push(newRandPoint())



        }

        return tempPoints
    }
    useEffect(() => {
        const tempPoints: point[] = []
        for (let i = 0; i < NUMPOINTS; i++) {
            tempPoints.push(
                newRandPoint()
            )
        }
        setPoints(tempPoints)


        const int = setInterval(() => {
            setTick((prev) => prev + 1)
        }, TICKTIME)

        // console.log(getBearing(
        //     {
        //         pos: { x: 1, y: 1 },
        //         vel: {
        //             x: 0, y: 0
        //         },
        //         mass: 1
        //     },
        //     {
        //         pos: { x: 1, y: 0 },
        //         vel: {
        //             x: 0, y: 0
        //         },
        //         mass: 1
        //     }
        // ))

        return (() => {
            clearInterval(int)
        }
        )


    }, [])

    useEffect(() => {

        const tempPoints: point[] = points

        if (!(tempPoints.length > 0)) {
            return
        }

        for (let i = 0; i < tempPoints.length; i++) {
            if (tempPoints[i]) {
                if (tempPoints.length <= 0)
                    return
                const p1 = tempPoints[i]

                for (let j = i + 1; j < tempPoints.length - i + 1; j++) {
                    if (i != j && tempPoints[j]) {


                        const p2 = tempPoints[j]
                        if (isClose(p1.pos.x, p2.pos.x, getPointRadius(p1) * 0.9) && isClose(p1.pos.y, p2.pos.y, getPointRadius(p1) * 0.9) && p1.type !== "dark" && p2.type !== "dark" && false) {
                            if (p1.mass <= p2.mass) {
                                p2.mass += p1.mass
                                // tempPoints[i] = newRandPoint()
                                tempPoints[i] = undefined
                                // tempPoints.splice(i, 1)
                            }
                            else {
                                p1.mass += p2.mass
                                // tempPoints.splice(j, 1)
                                tempPoints[j] = undefined

                                // tempPoints[j] = newRandPoint()
                            }
                        }
                        let divisor = (Math.pow(getPointDistance(p1, p2), 2))
                        if (divisor == Infinity)
                            divisor = 1
                        let force = (p1.mass * p2.mass) / divisor
                        if (isNaN(force)) {
                            console.log("force is NAN " + p1.mass + " " + p2.mass + " " + divisor)
                            force = 0
                        }
                        let bearing = getBearing(p1, p2)
                        if (isNaN(bearing)) {
                            console.log("FUUCCCCCC")
                            bearing = 0.5
                        }
                        let forceSplit = findOA(bearing, force)
                        if (isNaN(forceSplit[0]) || isNaN(forceSplit[1])) {
                            console.log("why do")
                            forceSplit = [0, 0]
                        }
                        if (p1.type !== "dark" && p2.type !== "dark") {
                            p1.force.x -= forceSplit[1]
                            p1.force.y -= forceSplit[0]

                            p2.force.x += forceSplit[1]
                            p2.force.y += forceSplit[0]

                            // forceSum[0] += forceSplit[1]
                            // forceSum[1] += forceSplit[0]
                        }
                        else {
                            p1.force.x -= forceSplit[1]
                            p1.force.y -= forceSplit[0]
                            p2.force.x += forceSplit[1]
                            p2.force.y += forceSplit[0]
                            // forceSum[0] -= forceSplit[1]
                            // forceSum[1] -= forceSplit[0]
                        }
                    }
                }
                const acc = [(p1.force.x / p1.mass) * (1000 / TICKTIME), ((p1.force.y / p1.mass) * (1000 / TICKTIME))]
                if (tempPoints[i]) {
                    const speedCap = 10
                    tempPoints[i].vel = { x: Math.min(Math.max(tempPoints[i].vel.x + acc[0], -speedCap), speedCap), y: Math.max(Math.min(tempPoints[i].vel.y + acc[1], speedCap), -speedCap) }

                    let newX = tempPoints[i].pos.x + tempPoints[i].vel.x
                    let newY = tempPoints[i].pos.y + tempPoints[i].vel.y
                    const screenBoundary = 0.1
                    if (newX > WIDTH * (1 + screenBoundary)) {
                        newX = -screenBoundary * WIDTH
                    }
                    else if (newX < -WIDTH * screenBoundary) {
                        newX = (1 + screenBoundary) * WIDTH
                    }
                    if (newY > HEIGHT * (1 + screenBoundary)) {
                        newY = -screenBoundary * WIDTH
                    }
                    else if (newY < -HEIGHT * screenBoundary) {
                        newY = (1 + screenBoundary) * HEIGHT
                    }
                    tempPoints[i].pos = { x: newX, y: newY }

                    // if (tempPoints[i].mass > MAXMASS * 5) {
                    //     const novaPoints = superNovaPoints(tempPoints[i])
                    //     tempPoints.splice(i, 1)
                    //     novaPoints.forEach((point) => {
                    //         tempPoints.push(point)
                    //     })
                    // }
                }
                // if (newX > WIDTH || newX < 0 || newY > HEIGHT || newY < 0) {
                //     tempPoints[i] = newRandPoint()
                // }
                // else {
                //     tempPoints[i].pos = { x: newX, y: newY }

                // }

            }


        }

        setPoints(tempPoints.filter((point) => point))
    }, [tick])


    const pointDraw = useMemo(() => {
        return points.map((point, index) => {
            const rad = getPointRadius(point)
            return <Ellipse key={"point" + index} radiusX={rad} radiusY={rad} x={point.pos.x} y={point.pos.y} fill={point.type === "dark" ? "magenta" : "red"
            } />

        })
    }, [tick])

    const PointData = useMemo(() => {
        let m = 0
        const n = points.length

        for (let i = 0; i < points.length; i++) {
            m += points[i].mass
        }
        return [<Text text={"Number of Points: " + n} fill="white" />,
        <Text text={"Total Mass: " + m} fill="white" y={0.015 * HEIGHT} />]
    }, [tick])

    return (

        <>
            {pointDraw}
            {/* {
                    points.map((point, index) => {
                        const rad = getPointRadius(point)
                        return <Ellipse key={"point" + index} radiusX={rad} radiusY={rad} x={point.pos.x ? point.pos.x : 0} y={point.pos.y ? point.pos.y : 0} fill={point.type === "dark" ? "magenta" : "red"
                        } />

                    })} */}
            {/* {
                    points.map((point) => {
                        return <Ellipse radiusX={0.5} radiusY={0.5} x={point.pos.x} y={point.pos.y} fill="white" />
                    })
                } */}
            {PointData}
        </>
    )
}