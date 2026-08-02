import { GameCatalog } from "./features/catalog/GameCatalog";

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">Game commerce platform</p>
        <h1>GamePay Store</h1>
        <p>Discover the best game deals.</p>
      </header>

      <GameCatalog />
    </main>
  );
}

export default App;
