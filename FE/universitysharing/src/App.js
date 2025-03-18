import logo from "./logo.svg";
import "./App.css";
import helloWorld from "./Components/helloWorld";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <helloWorld></helloWorld>
      </header>
    </div>
  );
}

export default App;
