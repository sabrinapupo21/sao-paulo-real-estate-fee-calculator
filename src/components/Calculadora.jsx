import { useState, useRef, useEffect } from "react";
import dados from "../assets/tabelaCRI.json";
import cidades from "../assets/tabelaCities.json";

function Calculadora() {
  const [temFinanciamento, setTemFinanciamento] = useState(true);
  const [imovel, setImovel] = useState("");
  const [financiado, setFinanciado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [primeiraAquisição, setPrimeiraAquisição] = useState(false);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [buscaCidade, setBuscaCidade] = useState("");
  const listaRef = useRef(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const cidadesFiltradas =
    buscaCidade.length > 0
      ? cidades.filter((c) =>
          c.name.toLowerCase().includes(buscaCidade.toLowerCase()),
        )
      : cidades;
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const selecionarCidade = (cidade) => {
    setCidadeSelecionada(String(cidade.id));
    setBuscaCidade(cidade.name);
    setMostrarSugestoes(false);
    setIndiceAtivo(-1);
  };
  const handleKeyDown = (e) => {
    if (!mostrarSugestoes || cidadesFiltradas.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((prev) =>
        prev < cidadesFiltradas.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((prev) =>
        prev > 0 ? prev - 1 : cidadesFiltradas.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (indiceAtivo >= 0 && cidadesFiltradas[indiceAtivo]) {
        selecionarCidade(cidadesFiltradas[indiceAtivo]);
      }
    } else if (e.key === "Escape") {
      setMostrarSugestoes(false);
      setIndiceAtivo(-1);
    }
  };
  useEffect(() => {
    if (indiceAtivo >= 0 && listaRef.current) {
      const itemAtivo = listaRef.current.children[indiceAtivo];
      if (itemAtivo) {
        itemAtivo.scrollIntoView({ block: "nearest" });
      }
    }
  }, [indiceAtivo]);

  const limpar = () => {
    setImovel("");
    setFinanciado("");
    setResultado(null);
    setPrimeiraAquisição(false);
    setCidadeSelecionada("");
    setBuscaCidade("");
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
    if (!valorImovelNum) {
      alert("Preencha o valor do imóvel.");
      return;
    }

    if (temFinanciamento && !valorFinanciadoNum) {
      alert("Preencha o valor do financiamento.");
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
    const faixaFinanciado = temFinanciamento
      ? dados.find((item) => Number(item.valorMax) >= valorFinanciadoNum)
      : null;

    const totalImovel = faixaImovel ? Number(faixaImovel.total) / 100 : 0;
    const oficialImovel = faixaImovel ? Number(faixaImovel.oficial / 100) : 0;
    const totalFinanciado = faixaFinanciado
      ? Number(faixaFinanciado.total / 100)
      : 0;
    const oficialFinanciado = faixaFinanciado
      ? Number(faixaFinanciado.oficial / 100)
      : 0;
    let contaFinal;

    if (temFinanciamento) {
      contaFinal =
        totalImovel +
        totalFinanciado +
        matriculaTotal +
        (iss / 100) * (oficialImovel + oficialFinanciado + matriculaOficial);
    } else {
      contaFinal =
        totalImovel +
        matriculaTotal +
        (iss / 100) * (oficialImovel + matriculaOficial);
    }

    // Se primeiraAquisição for true, divide por 2. Se não, mantém contaFinal.
    setResultado(primeiraAquisição ? contaFinal / 2 : contaFinal);
  };
  return (
    <>
      <div className="calc-container">
        <h2>Calcular Custos</h2>
        <div className="calc-form-row">
          <div className="cidade-select-wrapper">
            <input
              className="calc-input cidade-input"
              type="text"
              placeholder="Digite a cidade"
              value={buscaCidade}
              onChange={(e) => {
                setBuscaCidade(e.target.value);
                setCidadeSelecionada("");
                setMostrarSugestoes(true);
                setIndiceAtivo(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
            />
            <span className="seta-cidade">▾</span>
            {mostrarSugestoes && cidadesFiltradas.length > 0 && (
              <ul className="calc-sugestoes" ref={listaRef}>
                {cidadesFiltradas.map((cidade, index) => (
                  <li
                    key={cidade.id}
                    onMouseDown={() => selecionarCidade(cidade)}
                    className={index === indiceAtivo ? "sugestao-ativa" : ""}
                  >
                    {cidade.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="calc-checkbox">
            <label htmlFor="temFinanciamento">
              <input
                type="checkbox"
                id="temFinanciamento"
                checked={temFinanciamento}
                onChange={(e) => setTemFinanciamento(e.target.checked)}
              />
              O imóvel será financiado?
            </label>
          </div>
          <input
            className="calc-input"
            type="text"
            placeholder="Valor do Imóvel"
            value={imovel}
            onChange={(e) => setImovel(formatarMoeda(e.target.value))}
          />

          {temFinanciamento && (
            <input
              className="calc-input"
              type="text"
              placeholder="Valor Financiado"
              value={financiado}
              onChange={(e) => setFinanciado(formatarMoeda(e.target.value))}
            />
          )}
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
