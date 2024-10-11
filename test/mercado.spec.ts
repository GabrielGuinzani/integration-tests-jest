import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('API Mercado', () => {
  const pactumInstance = pactum;
  pactumInstance.request.setDefaultTimeout(90000);

  const reporter = SimpleReporter;
  const apiBaseUrl = 'https://api-desafio-qa.onrender.com/mercado';

  let marketId = 0;
  let fruitId = 0;
  let vegetableId = 0;

  const marketName = faker.company.name();
  const marketCNPJ = faker.string.numeric(14);
  const marketAddress = faker.location.streetAddress();

  beforeAll(async () => pactumInstance.reporter.add(reporter));
  afterAll(async () => pactumInstance.reporter.end());

  describe('Operações CRUD de Mercado', () => {
    it('Buscar todos os Mercados', async () => {
      await pactumInstance
        .spec()
        .get(apiBaseUrl)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            properties: {
              endereco: { type: 'string' },
              id: { type: 'number' },
              nome: { type: 'string' }
            },
            required: ['cnpj', 'endereco', 'id', 'nome']
          }
        });
      console.log(`Solicitação GET para ${apiBaseUrl} realizada com sucesso.`);
    });

    it('Criar um novo Mercado', async () => {
      marketId = (
        await pactumInstance
          .spec()
          .post(apiBaseUrl)
          .withJson({
            nome: marketName,
            endereco: marketAddress,
            cnpj: marketCNPJ
          })
          .expectStatus(StatusCodes.CREATED)
      ).body.novoMercado.id;
      console.log(
        `Mercado '${marketName}' criado com sucesso. ID: ${marketId}.`
      );
    });

    it('Buscar Mercado por ID', async () => {
      await pactumInstance
        .spec()
        .get(`${apiBaseUrl}/${marketId}`)
        .expectStatus(StatusCodes.OK);
      console.log(`Mercado ID ${marketId} encontrado com sucesso.`);
    });

    it('Buscar um Mercado inexistente por ID', async () => {
      await pactumInstance
        .spec()
        .get(`${apiBaseUrl}/7878`)
        .expectStatus(StatusCodes.NOT_FOUND);
      console.log(`Mercado ID 7878 não encontrado.`);
    });

    it('Atualizar informações do Mercado', async () => {
      await pactumInstance
        .spec()
        .put(`${apiBaseUrl}/${marketId}`)
        .withJson({
          nome: marketName + ' Atualizado',
          endereco: marketAddress,
          cnpj: marketCNPJ
        })
        .expectStatus(StatusCodes.OK);
      console.log(`Mercado ID ${marketId} atualizado com sucesso.`);
    });

    it('Atualizar um Mercado inexistente', async () => {
      await pactumInstance
        .spec()
        .put(`${apiBaseUrl}/7878`)
        .expectStatus(StatusCodes.NOT_FOUND);
      console.log(`Tentativa de atualização do Mercado ID 7878 falhou.`);
    });

    it('Deletar um Mercado inexistente', async () => {
      await pactumInstance
        .spec()
        .delete(`${apiBaseUrl}/7878`)
        .expectStatus(StatusCodes.NOT_FOUND);
      console.log(`Tentativa de exclusão do Mercado ID 7878 falhou.`);
    });
  });

  describe('Operações CRUD de Produtos', () => {
    it('Buscar Produtos do Mercado', async () => {
      await pactumInstance
        .spec()
        .get(`${apiBaseUrl}/${marketId}/produtos`)
        .expectStatus(StatusCodes.OK);
      console.log(
        `Produtos do Mercado ID ${marketId} encontrados com sucesso.`
      );
    });

    it('Criar uma Fruta nos Produtos do Mercado', async () => {
      fruitId = (
        await pactumInstance
          .spec()
          .post(`${apiBaseUrl}/${marketId}/produtos/hortifruit/frutas`)
          .withJson({
            nome: 'Kiwi',
            valor: 20
          })
          .expectStatus(StatusCodes.CREATED)
      ).body.product_item.id;
      console.log(`Fruta 'Kiwi' adicionada ao Mercado ID ${marketId}.`);
    });

    it('Buscar Frutas dos Produtos do Mercado', async () => {
      await pactumInstance
        .spec()
        .get(`${apiBaseUrl}/${marketId}/produtos/hortifruit/frutas`)
        .expectStatus(StatusCodes.OK);
      console.log(`Frutas do Mercado ID ${marketId} encontradas com sucesso.`);
    });

    it('Deletar uma Fruta nos Produtos do Mercado', async () => {
      await pactumInstance
        .spec()
        .delete(
          `${apiBaseUrl}/${marketId}/produtos/hortifruit/frutas/${fruitId}`
        )
        .expectStatus(StatusCodes.OK);
      console.log(`Fruta ID ${fruitId} excluída do Mercado ID ${marketId}.`);
    });

    it('Deletar uma Fruta inexistente no Mercado', async () => {
      await pactumInstance
        .spec()
        .delete(`${apiBaseUrl}/${marketId}/produtos/hortifruit/frutas/7878`)
        .expectStatus(StatusCodes.NOT_FOUND);
      console.log(
        `Tentativa de exclusão da Fruta ID 7878 no Mercado ID ${marketId} falhou.`
      );
    });

    it('Criar um Legume nos Produtos do Mercado', async () => {
      vegetableId = (
        await pactumInstance
          .spec()
          .post(`${apiBaseUrl}/${marketId}/produtos/hortifruit/legumes`)
          .withJson({
            nome: 'Pepino',
            valor: 20
          })
          .expectStatus(StatusCodes.CREATED)
      ).body.product_item.id;
      console.log(`Legume 'Pepino' adicionado ao Mercado ID ${marketId}.`);
    });

    it('Buscar Legumes dos Produtos do Mercado', async () => {
      await pactumInstance
        .spec()
        .get(`${apiBaseUrl}/${marketId}/produtos/hortifruit/legumes`)
        .expectStatus(StatusCodes.OK);
      console.log(`Legumes do Mercado ID ${marketId} encontrados com sucesso.`);
    });

    it('Deletar um Legume no Mercado', async () => {
      await pactumInstance
        .spec()
        .delete(
          `${apiBaseUrl}/${marketId}/produtos/hortifruit/legumes/${vegetableId}`
        )
        .expectStatus(StatusCodes.OK);
      console.log(
        `Legume ID ${vegetableId} excluído do Mercado ID ${marketId}.`
      );
    });
  });
});
