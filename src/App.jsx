import "./App.css";
import Calculadora from "./components/Calculadora";
function App() {
  return (
    <>
      <div className="App">
        <div className="App-wrapper">
          <h1>
            Custos de Registro: Compra, Venda e Financiamento <br />
            (Tabela SP)
          </h1>{" "}
          <Calculadora />
        </div>
      </div>
    </>
  );
}

export default App;
