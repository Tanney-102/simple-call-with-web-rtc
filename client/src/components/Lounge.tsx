import { Link } from "react-router-dom"

const Lounge = () => {
  console.log('render')
  return (
    <main>
      <h2>Select Room</h2>
      <Link to="/room/1">room1</Link>
      <Link to="/room/2">room2</Link>
      <Link to="/room/3">room3</Link>
    </main>
  )
}

export default Lounge