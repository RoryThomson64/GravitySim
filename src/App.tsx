
import { Layer, Stage } from 'react-konva'
import './App.css'
import { GravityV1 } from './GravityV1/GravityV1'

function App() {
  const WIDTH = window.innerWidth
  const HEIGHT = window.innerHeight
  return (
    <>
      <Stage width={WIDTH} height={HEIGHT}>
        <Layer >
          <GravityV1 WIDTH={WIDTH} HEIGHT={HEIGHT}></GravityV1>
        </Layer>
      </Stage>


    </>
  )
}

export default App
