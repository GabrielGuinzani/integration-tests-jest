import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('Mercado', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com/';

  p.request.setDefaultTimeout(90000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('MERCADO', () => {
    it('Buscar Todos os Mercados', async () => {
      await p
        .spec()
        .get(`${baseUrl}mercado`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cnpj: {
                type: 'string',
                pattern: '^[0-9]{14}$'
              },
              endereco: {
                type: 'string'
              },
              id: {
                type: 'integer'
              },
              nome: {
                type: 'string'
              },
              produtos: {
                type: 'object',
                properties: {
                  acougue: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        bovinos: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              nome: {
                                type: 'string'
                              },
                              preco: {
                                type: 'number'
                              }
                            },
                            required: ['nome', 'preco']
                          }
                        }
                      }
                    }
                  },
                  bebidas: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        com_alcool: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              nome: {
                                type: 'string'
                              },
                              preco: {
                                type: 'number'
                              }
                            },
                            required: ['nome', 'preco']
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ['cnpj', 'endereco', 'id', 'nome']
          }
        });
    });

    it('Testar criação de mercado', async () => {
      const mercado = {
        nome: faker.name.firstName(),
        cnpj: faker.string.numeric(14),
        endereco: faker.address.city()
      };

      const response = await p
        .spec()
        .post(`${baseUrl}mercado`)
        .withJson(mercado)
        .expectStatus(StatusCodes.OK)
        .expectJson({
          message: 'Mercado adicionado com sucesso!',
          novoMercado: {
            id: expect.any(Number),
            nome: mercado.nome,
            cnpj: expect.stringMatching(/^\d{14}$/),
            endereco: mercado.endereco,
            produtos: {
              hortifruit: [{ frutas: [] }, { legumes: [] }],
              padaria: [{ doces: [] }, { salgados: [] }],
              acougue: [{ bovinos: [] }, { suinos: [] }, { aves: [] }],
              peixaria: [{ peixes: [] }, { frutos_do_mar: [] }],
              frios: [{ queijos: [] }, { embutidos: [] }, { outros: [] }],
              mercearia: [
                { graos_cereais: [] },
                { massas: [] },
                { farinhas: [] },
                { conservados_enlatados: [] },
                { oleos: [] },
                { temperos_condimentos: [] }
              ],
              bebidas: [{ com_alcool: [] }, { sem_alcool: [] }],
              higienelimpeza: [{ higiene: [] }, { limpeza: [] }]
            }
          }
        });

      const mercadoId = response.body.novoMercado.id;

      await p
        .spec()
        .get(`${baseUrl}mercado/${mercadoId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson({
          id: mercadoId,
          nome: mercado.nome,
          cnpj: expect.stringMatching(/^\d{14}$/),
          endereco: mercado.endereco,
          produtos: {
            hortifruit: [{ frutas: [] }, { legumes: [] }],
            padaria: [{ doces: [] }, { salgados: [] }],
            acougue: [{ bovinos: [] }, { suinos: [] }, { aves: [] }],
            peixaria: [{ peixes: [] }, { frutos_do_mar: [] }],
            frios: [{ queijos: [] }, { embutidos: [] }, { outros: [] }],
            mercearia: [
              { graos_cereais: [] },
              { massas: [] },
              { farinhas: [] },
              { conservados_enlatados: [] },
              { oleos: [] },
              { temperos_condimentos: [] }
            ],
            bebidas: [{ com_alcool: [] }, { sem_alcool: [] }],
            higienelimpeza: [{ higiene: [] }, { limpeza: [] }]
          }
        });
    });
  });
});
