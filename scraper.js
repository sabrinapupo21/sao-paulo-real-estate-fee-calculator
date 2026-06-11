import { chromium } from "playwright";
import fs from "fs";
import citiesData from "./src/assets/teste2.json" with { type: "json" };

async function run() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 60,
  });

  const page = await browser.newPage();
  const results = [];

  await page.goto("https://calculadora.registrodeimoveis.org.br/");
  await page.waitForLoadState("networkidle");

  for (const c of citiesData.cities || citiesData) {
    try {
      console.log(`\n➡️ Processando: ${c.name}`);

      await page.reload();
      await page.waitForLoadState("networkidle");

      // =========================
      // 1. UF (SP) - OK
      // =========================
      const ufInput = page.locator("select, input").first();
      await ufInput.click();
      await page.keyboard.type("São Paulo");
      await page.keyboard.press("Enter");

      await page.waitForTimeout(1000);

      // =========================
      // 2. CIDADE (OK - VS2)
      // =========================
      console.log("Selecionando cidade...");

      const cityBox = page.locator("#vs2__combobox");
      await cityBox.click();
      await page.waitForTimeout(500);

      const search = cityBox.locator("input.vs__search");
      await search.fill(c.name);
      await page.waitForTimeout(1200);

      await page.locator("#vs2__listbox .vs__dropdown-option").first().click();
      await page.waitForTimeout(1000);

      // =========================
      // 3. ESCOLHER TIPO DE REGISTRO
      // =========================
      console.log("Selecionando tipo...");
      await page.getByText("Registro em Geral").click();
      await page.waitForTimeout(800);

      const valorInput = page.locator("#valor_imovel");
      await valorInput.click();

      // limpa valor antigo
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");

      // digitação REAL
      await page.keyboard.type("500000", { delay: 80 });
      await page.waitForTimeout(800);

      // =========================
      // 5. CLICAR CALCULAR e CAPTURAR API
      // =========================
      console.log("Calculando...");

      const responsePromise = page.waitForResponse(
        (res) =>
          res.url().includes("/calculate") && res.request().method() === "POST",
        { timeout: 30000 },
      );

      await page.getByRole("button", { name: /calcular/i }).click();

      const response = await responsePromise;
      console.log("Resposta da API recebida com status:", response.status());

      const responseData = await response.json();

      // =========================
      // 6. EXTRAIR ISS (DIRETO DO JSON)
      // =========================
      console.log("Extraindo ISS...");

      let iss = null;

      try {
        if (responseData && responseData.result && responseData.result.extras) {
          const extras = responseData.result.extras;

          const issItem = extras.find(
            (item) =>
              item.description &&
              item.description.toUpperCase().includes("ISS"),
          );

          if (issItem) {
            console.log("Item do ISS encontrado no JSON:", issItem.description);
            const match = issItem.description.match(/ISS\s*\(([\d.,]+)%/i);
            iss = match ? parseFloat(match[1].replace(",", ".")) : null;
          }
        }
      } catch (jsonErr) {
        console.log("Erro ao processar o JSON da API:", jsonErr.message);
      }

      // Fallback HTML: Só roda se o JSON não vier com a estrutura esperada
      if (iss === null) {
        try {
          const allCells = await page.locator("td").allInnerTexts();
          const targetCell = allCells.find((text) => text.includes("ISS"));
          if (targetCell) {
            const match = targetCell.match(/ISS\s*\(([\d.,]+)%/i);
            iss = match ? parseFloat(match[1].replace(",", ".")) : null;
          }
        } catch (e) {
          console.log("Fallback do HTML também falhou.");
        }
      }

      console.log("✔ ISS FINAL:", iss);

      results.push({
        id: c.id,
        name: c.name,
        iss: iss,
        error: iss === null,
      });

      // =========================
      // 7. VOLTAR PRA HOME
      // =========================
      console.log("Voltando para início...");

      try {
        // Ignora a espera passiva do loading e tenta clicar diretamente no botão usando seletores variados
        const backBtn = page
          .locator('button.border-azul, button:has-text("Voltar")')
          .first();

        // Timeout curto de 3s. Se o overlay ainda bloquear o clique normal, o { force: true } fura o bloqueio.
        await backBtn.waitFor({ state: "visible", timeout: 3000 });
        await backBtn.click({ force: true });

        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log(
          "⚠️ Botão voltar inacessível, forçando reload da URL para resetar.",
        );
        await page.goto("https://calculadora.registrodeimoveis.org.br/");
        await page.waitForLoadState("networkidle");
      }
    } catch (err) {
      console.log("❌ erro cidade:", c.name, err.message);

      results.push({
        id: c.id,
        name: c.name,
        iss: null,
        error: true,
      });

      await page.goto("https://calculadora.registrodeimoveis.org.br/");
      await page.waitForLoadState("networkidle");
    }
  }

  fs.writeFileSync("iss-result.json", JSON.stringify(results, null, 2));
  console.log("\n🎯 FINALIZADO");
  await browser.close();
}

run();
