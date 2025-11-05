function App(): React.ReactNode {
  return (
    <div className="w-screen h-screen bg-blue-50/70 p-4 flex gap-4">
      <div className="w-[15%] h-full bg-white rounded-lg shadow-sm p-4">Sidebar</div>
      <div className="w-full h-full bg-white rounded-lg shadow-sm p-4">MainContent</div>
    </div>
  )
}

export default App
