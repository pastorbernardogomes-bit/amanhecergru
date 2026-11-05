# Perguntas sobre o evento

Função Supabase Edge que recebe uma pergunta e consulta o AI Gateway no servidor. Não acessa as tabelas de inscrições ou voluntários e não armazena perguntas ou respostas.

## Configuração do servidor

- `LOVABLE_API_KEY`: chave do AI Gateway, mantida exclusivamente nos secrets da função. Nunca disponibilizar no frontend.
- `EVENT_INFORMATION_URL`: URL HTTPS pública da fonte oficial do evento, mantida pela organização. Deve retornar texto simples (`text/plain`), Markdown (`text/markdown`) ou JSON (`application/json`), com até 60.000 bytes e sem redirecionamentos. Não usar URL com credenciais, tokens ou informações pessoais: esse endereço é devolvido como referência da resposta.

A fonte deve conter as informações oficiais vigentes, como data, horário, endereço, programação e orientações. A função busca o documento novamente em cada solicitação, sem cache local. `consulted_at` indica o instante da consulta, não a data da última atualização editorial.

Sem chave ou fonte definida, a função retorna HTTP 503. Se a consulta à fonte falhar, não envia uma pergunta sem contexto ao modelo.

## Contrato

Invocar `event-questions` pelo cliente Supabase existente com o corpo:

```json
{ "question": "Qual é o horário do evento?" }
```

Resposta bem-sucedida:

- `answer`: resposta em texto simples; renderizar como texto, nunca como HTML.
- `source`: URL oficial consultada.
- `consulted_at`: instante da consulta em formato ISO 8601.

Erros retornam o campo `error` com uma mensagem em português. A pergunta deve ter entre 1 e 2.000 caracteres. A interface deve tratar envio em andamento, erros e HTTP 429, além de exibir a referência da resposta.

## Integração pendente

Os arquivos da interface, do cliente Supabase e dos três players não estão presentes na lista de arquivos fornecida. Esta entrega não cria um cliente alternativo nem altera a autenticação existente. A publicação da função deve seguir o fluxo de Edge Functions do projeto, preservando sua política de autenticação e aplicando os limites de uso da plataforma antes da abertura ao público.

As capas já disponíveis para os respectivos players são:

- `/event-covers/video-1.svg`
- `/event-covers/video-2.svg`
- `/event-covers/video-3.svg`

Todas já contêm o texto GUARULHOS-SP com selo azul de verificado. Para players HTML nativos, aplicar cada caminho ao atributo `poster` do vídeo correspondente, preservando o endereço original do vídeo.
