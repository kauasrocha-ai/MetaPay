
const transacao = {
  type: "object",
  required: ["descricao", "categoria", "tipo", "valor"],
  properties: {
    descricao: { type: "string", example: "Supermercado" },
    categoria: { type: "string", example: "Alimentação" },
    tipo: {
      type: "string",
      enum: ["entrada", "saida"]
    },
    valor: { type: "number", example: 150.50 }
  }
};

const login = {
  type: "object",
  required: ["email", "senha"],
  properties: {
    email: {
      type: "string",
      example: "teste123@metapay.com"
    },
    senha: {
      type: "string",
      example: "Teste@1234"
    }
  }
};

const corpo = (schema) => ({
  required: true,
  content: {
    "application/json": { schema }
  }
});

module.exports = {
  openapi: "3.0.3",

  info: {
    title: "MetaPay API",
    version: "1.0.0",
    description: "Documentação da API do sistema MetaPay."
  },

  servers: [
    { url: "http://localhost:3002" }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },

  paths: {
    "/api/health": {
      get: {
        tags: ["Sistema"],
        summary: "Verificar API e banco",
        responses: {
          200: { description: "Sistema funcionando" },
          503: { description: "Banco indisponível" }
        }
      }
    },

    "/api/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Cadastrar usuário",
        requestBody: corpo({
          type: "object",
          required: ["nome", "email", "senha"],
          properties: {
            nome: { type: "string", example: "Teste" },
            ...login.properties
          }
        }),
        responses: {
          201: { description: "Usuário cadastrado" },
          400: { description: "Dados inválidos" },
          409: { description: "E-mail já cadastrado" }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Realizar login",
        requestBody: corpo(login),
        responses: {
          200: { description: "Login realizado e JWT gerado" },
          401: { description: "Credenciais incorretas" }
        }
      }
    },

    "/api/auth/me": {
      get: {
        tags: ["Autenticação"],
        summary: "Consultar usuário autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dados do usuário" },
          401: { description: "Token inválido ou ausente" }
        }
      }
    },

    "/api/admin/check": {
      get: {
        tags: ["Administração"],
        summary: "Verificar permissão de administrador",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Acesso autorizado" },
          403: { description: "Acesso negado" }
        }
      }
    },

    "/api/transacoes": {
      get: {
        tags: ["Transações"],
        summary: "Listar transações do usuário",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lista de transações" },
          401: { description: "Não autenticado" }
        }
      },

      post: {
        tags: ["Transações"],
        summary: "Cadastrar uma transação",
        security: [{ bearerAuth: [] }],
        requestBody: corpo(transacao),
        responses: {
          201: { description: "Transação cadastrada" },
          400: { description: "Dados inválidos" },
          401: { description: "Não autenticado" }
        }
      }
    },

    "/api/transacoes/{id}": {
      put: {
        tags: ["Transações"],
        summary: "Atualizar uma transação",
        security: [{ bearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" }
        }],
        requestBody: corpo(transacao),
        responses: {
          200: { description: "Transação atualizada" },
          400: { description: "Dados inválidos" },
          404: { description: "Transação não encontrada" }
        }
      }
    }
  }
};
