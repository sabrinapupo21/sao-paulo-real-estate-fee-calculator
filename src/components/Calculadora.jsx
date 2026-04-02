import { useState } from "react";
import dados from "../assets/tabela.json";
function Calculadora() {
  const [imovel, setImovel] = useState("");
  const [financiado, setFinanciado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [primeiraAquisição, setPrimeiraAquisição] = useState(false);
  const formatarMoeda = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    const valorDecimal = Number(apenasNumeros) / 100;
    return valorDecimal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  const limparValor = (valorFormatado) => {
    // Tira o R$, pontos e troca vírgula por ponto para o JS entender como número
    return Number(valorFormatado.replace(/\D/g, "")) / 100;
  };
  const calcular = () => {
    const matriculaTotal = 75.6;
    const matriculaOficial = 45.88;
    const valorImovelNum = limparValor(imovel);
    const valorFinanciadoNum = limparValor(financiado);
    const faixaImovel = dados.find(
      (item) => Number(item.valorMax) >= valorImovelNum,
    );
    const faixaFinanciado = dados.find(
      (item) => Number(item.valorMax) >= valorFinanciadoNum,
    );

    const totalImovel = faixaImovel ? Number(faixaImovel.total) / 100 : 0;
    const oficialImovel = faixaImovel ? Number(faixaImovel.oficial / 100) : 0;
    const totalFinanciado = faixaFinanciado
      ? Number(faixaFinanciado.total / 100)
      : 0;
    const oficialFinanciado = faixaFinanciado
      ? Number(faixaFinanciado.oficial / 100)
      : 0;
    const contaFinal =
      totalImovel +
      totalFinanciado +
      matriculaTotal +
      (5 / 100) * (oficialImovel + oficialFinanciado + matriculaOficial);

    // Se primeiraAquisição for true, divide por 2. Se não, mantém contaFinal.
    setResultado(primeiraAquisição ? contaFinal / 2 : contaFinal);
  };
  return (
    <>
      <div className="calc-container">
        <h2>Calcular Custos</h2>
        <div className="calc-form-row">
          <input
            className="calc-input"
            type="text"
            placeholder="Valor do Imóvel"
            value={imovel}
            onChange={(e) => setImovel(formatarMoeda(e.target.value))}
          />
          <input
            className="calc-input"
            type="text"
            placeholder="Valor Financiado"
            value={financiado}
            onChange={(e) => setFinanciado(formatarMoeda(e.target.value))}
          />
          <button onClick={calcular}>Calcular</button>
        </div>
        <div className="calc-checkbox">
          <label htmlFor="primeiraAquisição">
            <input
              type="checkbox"
              id="primeiraAquisição"
              checked={primeiraAquisição}
              onChange={(e) => setPrimeiraAquisição(e.target.checked)}
            />
            Primeira Aquisição de Imóvel no SFH?
          </label>
        </div>
        {resultado !== null && (
          <p>Custo total do cartório: R$ {resultado.toFixed(2)}</p>
        )}
      </div>
    </>
  );
}

export default Calculadora;
