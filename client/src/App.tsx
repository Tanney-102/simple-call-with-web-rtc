import { Route, Routes } from 'react-router'
import Lounge from './components/Lounge'
import Room from './components/Room'

function App() {
  return (
    <main>
      <h1>Simple Call</h1>
      <Routes>
        <Route path="/" element={<Lounge />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </main>
  );
}

export default App;
