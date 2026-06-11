import { useState } from "react";
import dados from "../assets/tabelaCRI.json";
import cidades from "../assets/tabelaCities.json";
function Calculadora() {
  const [imovel, setImovel] = useState("");
  const [financiado, setFinanciado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [primeiraAquisição, setPrimeiraAquisição] = useState(false);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const limpar = () => {
    setImovel("");
    setFinanciado("");
    setResultado(null);
    setPrimeiraAquisição(false);
    setCidadeSelecionada("");
  };
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

    if (!cidadeSelecionada) {
      alert("Por favor, selecione uma cidade antes de calcular.");
      return;
    }
    if (!valorImovelNum || !valorFinanciadoNum) {
      alert("Preencha os valores do imóvel e do financiamento.");
      return;
    }
    const dadosCidade = cidades.find((c) => c.id === Number(cidadeSelecionada));
    const iss = dadosCidade ? Number(dadosCidade.iss) : 5;
    console.log("Cidade:", cidadeSelecionada);
    console.log("Dados cidade:", dadosCidade);
    console.log("ISS:", iss);
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
      (iss / 100) * (oficialImovel + oficialFinanciado + matriculaOficial);

    // Se primeiraAquisição for true, divide por 2. Se não, mantém contaFinal.
    setResultado(primeiraAquisição ? contaFinal / 2 : contaFinal);
  };
  return (
    <>
      <div className="calc-container">
        <h2>Calcular Custos</h2>
        <div className="calc-form-row">
          <select
            className="calc-input"
            value={cidadeSelecionada}
            onChange={(e) => setCidadeSelecionada(e.target.value)}
          >
            <option value="">Selecione a Cidade</option>
            {cidades &&
              cidades.map((cidade) => (
                <option key={cidade.id} value={String(cidade.id)}>
                  {cidade.name}
                </option>
              ))}
          </select>
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
          <div className="btn-group">
            <button className="btn-limpar" onClick={limpar}>
              Limpar
            </button>
            <button className="btn-calcular" onClick={calcular}>
              Calcular
            </button>
          </div>
        </div>

        {resultado !== null && (
          <p>
            Custo total do cartório: R${" "}
            {resultado.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>
    </>
  );
}

export default Calculadora;
